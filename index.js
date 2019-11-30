const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const config = getConfig(`${__dirname}/config/page-pagination.yaml`)

  const getPages = pagesData => {
    const pagePath = config.page_path
    return pagesData.filter(({ meta }) => meta.htmlPathName.includes(pagePath))
      .sort((a, b) => Date.parse(b.meta.date) - Date.parse(a.meta.date))
      .map(({ meta }) => meta.htmlPathName)
  }

  const getPaginationLinks = (href, pages) => {
    const index = pages.indexOf(href)

    return {
      previous: pages[index - 1] || false,
      linkOverviewText: config.link_overview_text,
      next: pages[index + 1] || false
    }
  }

  const getMetaData = data => {
    if (data.pagesData !== null && typeof data.pagesData === 'object') {
      const pages = getPages(data.pagesData)

      return data.pagesData.map(page => ({
        content: page.content,
        meta: Object.assign({}, page.meta, getPaginationLinks(page.meta.htmlPathName, pages))
      }))
    }

    return data.pagesData
  }

  return {
    getMetaData
  }
})()
