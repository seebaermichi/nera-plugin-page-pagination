import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getMetaData } from '../index.js'

let cwd
let originalCwd

// The plugin reads config from process.cwd(). Start from an empty temp cwd so
// these exercise the documented default (`pagination_order`) rather than
// whatever config happens to sit in the repo.
beforeEach(() => {
    originalCwd = process.cwd()
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-page-pagination-'))
    process.chdir(cwd)
})

afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(cwd, { recursive: true, force: true })
})

const page = (title, order, createdAt) => ({
    content: '',
    meta: {
        title,
        href: `/blog/${title}.html`,
        dirname: '/blog',
        ...(order === undefined ? {} : { pagination_order: order }),
        createdAt,
    },
})

// Walk the prev/next chain back into a flat ordering, which is the thing a
// user actually sees.
const resolveOrder = (pagesData) => {
    const result = getMetaData({ pagesData })
    const byName = Object.fromEntries(result.map((p) => [p.meta.title, p.meta]))

    const first = result.find((p) => p.meta.pagePagination.previous === false)
    const order = [first.meta.title]

    while (byName[order[order.length - 1]].pagePagination.next) {
        order.push(byName[order[order.length - 1]].pagePagination.next.name)
    }

    return order
}

const permutations = (items) =>
    items.length <= 1
        ? [items]
        : items.flatMap((item, i) =>
            permutations([
                ...items.slice(0, i),
                ...items.slice(i + 1),
            ]).map((rest) => [item, ...rest])
        )

describe('sibling ordering', () => {
    // Regression: the old comparator fell back to dates whenever *either*
    // page lacked an order, which is not transitive. This exact triple yields
    // a<b, b<c and c<a — a cycle — and the same three pages sorted three
    // different ways (abc, bca, cab) depending only on the order fs.readdir
    // returned them in. Adding an unrelated file could reshuffle pagination.
    describe('when only some pages define pagination_order', () => {
        const a = page('a', 1, '2024-03-01')
        const b = page('b', 2, '2024-01-01')
        const c = page('c', undefined, '2024-02-01')

        it('produces the same order for every input permutation', () => {
            const orderings = new Set(
                permutations([a, b, c]).map((p) => resolveOrder(p).join(','))
            )

            expect(orderings.size).toBe(1)
        })

        it('places explicitly ordered pages before unordered ones', () => {
            expect(resolveOrder([a, b, c])).toEqual(['a', 'b', 'c'])
        })
    })

    it('is stable across permutations with a larger mixed set', () => {
        const pages = [
            page('w', 2, '2024-05-01'),
            page('x', undefined, '2024-01-01'),
            page('y', 1, '2024-06-01'),
            page('z', undefined, '2024-04-01'),
        ]

        const orderings = new Set(
            permutations(pages).map((p) => resolveOrder(p).join(','))
        )

        expect(orderings.size).toBe(1)
        // ordered pages first by order (y=1, w=2), then unordered by date
        // (x=Jan, z=Apr)
        expect(resolveOrder(pages)).toEqual(['y', 'w', 'x', 'z'])
    })

    // Regression: the guard was `a.meta[op] && b.meta[op]`, so a legitimate
    // `pagination_order: 0` was falsy and fell through to date comparison. A
    // user numbering pages from zero got the first page ordered by date.
    it('treats pagination_order: 0 as a real value, not as absent', () => {
        const pages = [
            page('one', 1, '2024-01-01'),
            page('zero', 0, '2024-12-01'),
            page('two', 2, '2024-02-01'),
        ]

        expect(resolveOrder(pages)).toEqual(['zero', 'one', 'two'])
    })

    it('orders pages with no order at all by date', () => {
        const pages = [
            page('late', undefined, '2024-03-01'),
            page('early', undefined, '2024-01-01'),
            page('mid', undefined, '2024-02-01'),
        ]

        expect(resolveOrder(pages)).toEqual(['early', 'mid', 'late'])
    })

    it('breaks ties on href so equal keys are still deterministic', () => {
        const pages = [
            page('b', 1, '2024-01-01'),
            page('a', 1, '2024-01-01'),
        ]

        const orderings = new Set(
            permutations(pages).map((p) => resolveOrder(p).join(','))
        )

        expect(orderings.size).toBe(1)
        expect(resolveOrder(pages)).toEqual(['a', 'b'])
    })

    it('does not throw when createdAt is missing or unparseable', () => {
        const pages = [
            page('good', undefined, '2024-01-01'),
            page('missing', undefined, undefined),
            page('bogus', undefined, 'not-a-date'),
        ]

        expect(() => getMetaData({ pagesData: pages })).not.toThrow()

        const orderings = new Set(
            permutations(pages).map((p) => resolveOrder(p).join(','))
        )
        expect(orderings.size).toBe(1)
    })

    it('honours a custom order_property from config', () => {
        fs.mkdirSync(path.join(cwd, 'config'), { recursive: true })
        fs.writeFileSync(
            path.join(cwd, 'config/page-pagination.yaml'),
            'order_property: weight\n',
            'utf-8'
        )

        const withWeight = (title, weight, createdAt) => ({
            content: '',
            meta: {
                title,
                href: `/blog/${title}.html`,
                dirname: '/blog',
                weight,
                createdAt,
            },
        })

        const pages = [
            withWeight('second', 2, '2024-01-01'),
            withWeight('first', 1, '2024-12-01'),
        ]

        expect(resolveOrder(pages)).toEqual(['first', 'second'])
    })
})
