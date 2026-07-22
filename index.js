import { getConfig } from '@nera-static/plugin-utils'
import path from 'path'

function getOrderProperty() {
    const config = getConfig(
        path.resolve(process.cwd(), 'config/page-pagination.yaml')
    )

    return config.order_property || 'pagination_order'
}

// A total order. The previous comparator fell back to dates whenever *either*
// page lacked an order, which is not transitive: with a(order 1, Mar),
// b(order 2, Jan) and c(no order, Feb) it yields a<b, b<c and c<a — a cycle.
// The same three pages then sorted three different ways depending only on the
// order fs.readdir happened to return them in, so adding an unrelated file
// could silently reshuffle a user's pagination.
//
// Pages with an explicit order always come first, then by order, then by date,
// then by href so equal keys never tie.
function compareSiblings(a, b, orderProperty) {
    // `!= null` rather than a truthiness check: `pagination_order: 0` is a
    // legitimate value, and treating it as absent pushed a user numbering
    // from zero into the date-sorted group.
    const aOrder = a.meta?.[orderProperty]
    const bOrder = b.meta?.[orderProperty]
    const aHasOrder = aOrder != null
    const bHasOrder = bOrder != null

    if (aHasOrder !== bHasOrder) {
        return aHasOrder ? -1 : 1
    }

    // `aOrder - bOrder` alone is NaN for a non-numeric order, and a comparator
    // returning NaN makes Array.prototype.sort undefined behaviour: three pages
    // ordered `intro`/`setup`/`zed` came out in a different order for each of
    // the six input permutations, i.e. the result depended only on the order
    // fs.readdir returned the files in. Numeric strings ('10' vs '2') still
    // compare numerically, which is why this survived the 2.2.0 sweep.
    if (aHasOrder && bHasOrder) {
        const aNumber = Number(aOrder)
        const bNumber = Number(bOrder)

        if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
            if (aNumber !== bNumber) {
                return aNumber - bNumber
            }
        } else {
            const byString = String(aOrder).localeCompare(String(bOrder))

            if (byString !== 0) {
                return byString
            }
        }
    }

    const aDate = new Date(a.meta?.createdAt).getTime()
    const bDate = new Date(b.meta?.createdAt).getTime()
    const aValid = !Number.isNaN(aDate)
    const bValid = !Number.isNaN(bDate)

    if (aValid && bValid && aDate !== bDate) {
        return aDate - bDate
    }
    if (aValid !== bValid) {
        return aValid ? -1 : 1
    }

    return String(a.meta?.href ?? '').localeCompare(String(b.meta?.href ?? ''))
}

function getPageSiblings(dirname, pagesData, orderProperty) {
    if (!Array.isArray(pagesData)) return []

    // `meta.layout` as well as the directory: the generator renders a page only
    // if its frontmatter has a layout (generator/src/render.js), so a page
    // without one is never written to public/. Including it here produced a
    // prev/next link to a URL that does not exist — easy to hit, because
    // nera-plugin-stacks recommends giving stack pages no layout.
    return pagesData
        .filter(({ meta }) => meta?.dirname === dirname && meta?.layout)
        .sort((a, b) => compareSiblings(a, b, orderProperty))
        .map(({ meta }) => ({
            href: meta.href,
            name: meta.title,
        }))
}

function getPagePagination(dirname, href, pagesData, orderProperty) {
    const pagePagination = {
        previous: false,
        next: false,
    }

    const pageSiblings = getPageSiblings(dirname, pagesData, orderProperty)

    const currentIndex = pageSiblings.findIndex((page) => page.href === href)
    if (currentIndex !== -1) {
        if (currentIndex > 0) {
            pagePagination.previous = pageSiblings[currentIndex - 1]
        }
        if (currentIndex < pageSiblings.length - 1) {
            pagePagination.next = pageSiblings[currentIndex + 1]
        }
    }

    return pagePagination
}

export function getMetaData(data) {
    if (!data || !Array.isArray(data.pagesData)) {
        return []
    }

    // Read config here rather than at module load, so edits are picked up
    // without a restart and tests can point at a temporary cwd.
    const orderProperty = getOrderProperty()

    return data.pagesData.map(({ content, meta }) => ({
        content,
        meta: {
            ...meta,
            pagePagination: getPagePagination(
                meta.dirname,
                meta.href,
                data.pagesData,
                orderProperty
            ),
        },
    }))
}
