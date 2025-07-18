import { getConfig } from '@nera-static/plugin-utils'
import path from 'path'

const HOST_CONFIG_PATH = path.resolve(
    process.cwd(),
    'config/page-pagination.yaml'
)

const config = getConfig(HOST_CONFIG_PATH)
const orderProperty = config.order_property || 'pagination_order'

function getPageSiblings(dirname, pagesData) {
    if (!Array.isArray(pagesData)) return []

    return pagesData
        .filter(({ meta }) => meta?.dirname === dirname)
        .sort((a, b) => {
            if (a.meta[orderProperty] && b.meta[orderProperty]) {
                return a.meta[orderProperty] - b.meta[orderProperty]
            }

            const aDate = new Date(a.meta.createdAt)
            const bDate = new Date(b.meta.createdAt)
            return aDate - bDate
        })
        .map(({ meta }) => ({
            href: meta.href,
            name: meta.title,
        }))
}

function getPagePagination(dirname, href, pagesData) {
    const pagePagination = {
        previous: false,
        next: false,
    }

    const pageSiblings = getPageSiblings(dirname, pagesData)

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

    return data.pagesData.map(({ content, meta }) => ({
        content,
        meta: {
            ...meta,
            pagePagination: getPagePagination(
                meta.dirname,
                meta.href,
                data.pagesData
            ),
        },
    }))
}
