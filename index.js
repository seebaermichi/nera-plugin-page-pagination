const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const config = getConfig(`${__dirname}/config/page-pagination.yaml`)
  const orderProperty = config.order_property || 'pagination_order'

  const getPageSiblings = (pagePathName, pagesData) => {
    return pagesData.filter(({ meta }) => meta.pagePathName === pagePathName)
      .sort((a, b) => {
        if (a.meta[orderProperty] && b.meta[orderProperty]) {
          return a.meta[orderProperty] - b.meta[orderProperty]
        }

        return a.meta.createdAt - b.meta.createdAt
      })
      .map(({ meta }) => ({
        href: meta.href,
        name: meta.title
      }))
  }

  const getPagePagination = (pagePathName, href, pagesData) => {
    const pagePagination = {
      'previous': false,
      'next': false
    }

    const pageSiblings = getPageSiblings(pagePathName, pagesData)

    pageSiblings.forEach((page, index) => {
      if (page.href === href) {
        if (pageSiblings[index - 1]) {
          pagePagination.previous = pageSiblings[index - 1]
        }

        if (pageSiblings[index + 1]) {
          pagePagination.next = pageSiblings[index + 1]
        }
      }
    })

    return pagePagination
  }

  const getMetaData = data => {
    if (data.pagesData !== null && typeof data.pagesData === 'object') {
      data.pagesData = data.pagesData.map(({ content, meta }) => ({
        content,
        meta: Object.assign({}, meta, {
          pagePagination: getPagePagination(meta.pagePathName, meta.href, data.pagesData)
        })
      }))
    }

    return data.pagesData
  }

  return {
    getMetaData
  }
})()
