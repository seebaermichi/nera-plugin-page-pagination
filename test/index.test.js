import path from 'path'
import pug from 'pug'
import { load } from 'cheerio'
import { describe, it, expect } from 'vitest'
import { getMetaData } from '../index.js'

describe('Page Pagination Plugin', () => {
    const pagesData = [
        {
            content: '<h1>Introduction</h1>',
            meta: {
                title: 'Introduction',
                href: '/docs/introduction.html',
                dirname: '/docs',
                pagination_order: 1,
                createdAt: '2023-01-01',
            },
        },
        {
            content: '<h1>Getting Started</h1>',
            meta: {
                title: 'Getting Started',
                href: '/docs/getting-started.html',
                dirname: '/docs',
                pagination_order: 2,
                createdAt: '2023-01-02',
            },
        },
        {
            content: '<h1>Advanced Topics</h1>',
            meta: {
                title: 'Advanced Topics',
                href: '/docs/advanced.html',
                dirname: '/docs',
                pagination_order: 3,
                createdAt: '2023-01-03',
            },
        },
        {
            content: '<h1>Standalone Page</h1>',
            meta: {
                title: 'Standalone Page',
                href: '/blog/standalone.html',
                dirname: '/blog',
                createdAt: '2023-01-04',
            },
        },
    ]

    it('generates correct pagination for middle page', () => {
        const result = getMetaData({ pagesData })

        const gettingStartedPage = result.find(
            (p) => p.meta.href === '/docs/getting-started.html'
        )
        const pagination = gettingStartedPage.meta.pagePagination

        expect(pagination.previous).toMatchObject({
            href: '/docs/introduction.html',
            name: 'Introduction',
        })
        expect(pagination.next).toMatchObject({
            href: '/docs/advanced.html',
            name: 'Advanced Topics',
        })
    })

    it('generates correct pagination for first page', () => {
        const result = getMetaData({ pagesData })

        const firstPage = result.find(
            (p) => p.meta.href === '/docs/introduction.html'
        )
        const pagination = firstPage.meta.pagePagination

        expect(pagination.previous).toBe(false)
        expect(pagination.next).toMatchObject({
            href: '/docs/getting-started.html',
            name: 'Getting Started',
        })
    })

    it('generates correct pagination for last page', () => {
        const result = getMetaData({ pagesData })

        const lastPage = result.find(
            (p) => p.meta.href === '/docs/advanced.html'
        )
        const pagination = lastPage.meta.pagePagination

        expect(pagination.previous).toMatchObject({
            href: '/docs/getting-started.html',
            name: 'Getting Started',
        })
        expect(pagination.next).toBe(false)
    })

    it('generates no pagination for standalone page', () => {
        const result = getMetaData({ pagesData })

        const standalonePage = result.find(
            (p) => p.meta.href === '/blog/standalone.html'
        )
        const pagination = standalonePage.meta.pagePagination

        expect(pagination.previous).toBe(false)
        expect(pagination.next).toBe(false)
    })

    it('falls back to createdAt when pagination_order is missing', () => {
        const pagesWithoutOrder = [
            {
                content: '<h1>Page 1</h1>',
                meta: {
                    title: 'Page 1',
                    href: '/test/page1.html',
                    dirname: '/test',
                    createdAt: '2023-01-03',
                },
            },
            {
                content: '<h1>Page 2</h1>',
                meta: {
                    title: 'Page 2',
                    href: '/test/page2.html',
                    dirname: '/test',
                    createdAt: '2023-01-01',
                },
            },
            {
                content: '<h1>Page 3</h1>',
                meta: {
                    title: 'Page 3',
                    href: '/test/page3.html',
                    dirname: '/test',
                    createdAt: '2023-01-02',
                },
            },
        ]

        const result = getMetaData({ pagesData: pagesWithoutOrder })

        // Should be sorted by createdAt: page2 (2023-01-01), page3 (2023-01-02), page1 (2023-01-03)
        const page3 = result.find((p) => p.meta.href === '/test/page3.html')
        const pagination = page3.meta.pagePagination

        expect(pagination.previous).toMatchObject({
            href: '/test/page2.html',
            name: 'Page 2',
        })
        expect(pagination.next).toMatchObject({
            href: '/test/page1.html',
            name: 'Page 1',
        })
    })

    it('handles invalid data gracefully', () => {
        const result = getMetaData({ pagesData: null })
        expect(result).toEqual([])

        const result2 = getMetaData({})
        expect(result2).toEqual([])

        const result3 = getMetaData(null)
        expect(result3).toEqual([])
    })

    it('renders pagination template correctly', () => {
        const templatePath = path.resolve('views/page-pagination.pug')

        const compileTemplate = pug.compileFile(templatePath, {
            basedir: path.resolve('.'),
        })

        const html = compileTemplate({
            meta: {
                pagePagination: {
                    previous: {
                        href: '/docs/introduction.html',
                        name: 'Introduction',
                    },
                    next: {
                        href: '/docs/advanced.html',
                        name: 'Advanced Topics',
                    },
                },
            },
        })

        const $ = load(html)

        const previousLink = $('a.previous')
        expect(previousLink).toHaveLength(1)
        expect(previousLink.attr('href')).toBe('/docs/introduction.html')
        expect(previousLink.text().trim()).toBe('Introduction')

        const nextLink = $('a.next')
        expect(nextLink).toHaveLength(1)
        expect(nextLink.attr('href')).toBe('/docs/advanced.html')
        expect(nextLink.text().trim()).toBe('Advanced Topics')
    })

    it('renders template with only previous link', () => {
        const templatePath = path.resolve('views/page-pagination.pug')

        const compileTemplate = pug.compileFile(templatePath, {
            basedir: path.resolve('.'),
        })

        const html = compileTemplate({
            meta: {
                pagePagination: {
                    previous: {
                        href: '/docs/introduction.html',
                        name: 'Introduction',
                    },
                    next: false,
                },
            },
        })

        const $ = load(html)

        const previousLink = $('a.previous')
        expect(previousLink).toHaveLength(1)
        expect(previousLink.attr('href')).toBe('/docs/introduction.html')

        const nextLink = $('a.next')
        expect(nextLink).toHaveLength(0)
    })

    it('renders template with only next link', () => {
        const templatePath = path.resolve('views/page-pagination.pug')

        const compileTemplate = pug.compileFile(templatePath, {
            basedir: path.resolve('.'),
        })

        const html = compileTemplate({
            meta: {
                pagePagination: {
                    previous: false,
                    next: {
                        href: '/docs/advanced.html',
                        name: 'Advanced Topics',
                    },
                },
            },
        })

        const $ = load(html)

        const previousLink = $('a.previous')
        expect(previousLink).toHaveLength(0)

        const nextLink = $('a.next')
        expect(nextLink).toHaveLength(1)
        expect(nextLink.attr('href')).toBe('/docs/advanced.html')
    })

    it('renders empty template when no pagination is available', () => {
        const templatePath = path.resolve('views/page-pagination.pug')

        const compileTemplate = pug.compileFile(templatePath, {
            basedir: path.resolve('.'),
        })

        const html = compileTemplate({
            meta: {
                pagePagination: {
                    previous: false,
                    next: false,
                },
            },
        })

        const $ = load(html)

        const links = $('a')
        expect(links).toHaveLength(0)
    })
})
