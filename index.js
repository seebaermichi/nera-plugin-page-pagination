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

    if (aHasOrder && bHasOrder && aOrder !== bOrder) {
        return aOrder - bOrder
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

    return pagesData
        .filter(({ meta }) => meta?.dirname === dirname)
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
