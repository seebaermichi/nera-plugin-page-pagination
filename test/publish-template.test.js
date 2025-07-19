import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'

const TEST_ROOT = path.resolve('.tmp/publish-template-test')
const SCRIPT_PATH = path.resolve('bin/publish-template.js')
const TEMPLATE_SRC = path.resolve('views/page-pagination.pug')
const TEMPLATE_DEST = path.join(
    TEST_ROOT,
    'views/vendor/plugin-page-pagination/page-pagination.pug'
)
const DUMMY_PACKAGE = path.join(TEST_ROOT, 'package.json')

beforeEach(() => {
    fs.rmSync(TEST_ROOT, { recursive: true, force: true })
    fs.mkdirSync(TEST_ROOT, { recursive: true })
    fs.writeFileSync(DUMMY_PACKAGE, JSON.stringify({ name: 'dummy' }, null, 2))

    // Create the source template only if needed
    if (!fs.existsSync(TEMPLATE_SRC)) {
        fs.mkdirSync(path.dirname(TEMPLATE_SRC), { recursive: true })
        fs.writeFileSync(
            TEMPLATE_SRC,
            `if meta.pagePagination.previous
  a.previous(href=meta.pagePagination.previous.href) #{ meta.pagePagination.previous.name }

if meta.pagePagination.next
  a.next(href=meta.pagePagination.next.href) #{ meta.pagePagination.next.name }`
        )
    }
})

afterEach(() => {
    fs.rmSync(TEST_ROOT, { recursive: true, force: true })
    // ⚠️ Do NOT delete views/ unless it was created by this test — and in your case it wasn’t.
    // fs.rmSync(TEMPLATE_SRC) could be used if and only if it was test-created.
})

describe('publish-template command', () => {
    it('copies the template to the correct location', () => {
        execSync(`node ${SCRIPT_PATH}`, { cwd: TEST_ROOT })

        expect(fs.existsSync(TEMPLATE_DEST)).toBe(true)

        const content = fs.readFileSync(TEMPLATE_DEST, 'utf-8')
        expect(content).toMatch(/meta\.pagePagination\.previous/)
        expect(content).toMatch(/page-pagination__link--previous/)
        expect(content).toMatch(/page-pagination__link--next/)
    })

    it('skips if template already exists', () => {
        fs.mkdirSync(path.dirname(TEMPLATE_DEST), { recursive: true })
        fs.writeFileSync(TEMPLATE_DEST, '// existing')

        const output = execSync(`node ${SCRIPT_PATH}`, {
            cwd: TEST_ROOT,
            stdio: 'pipe',
        }).toString()

        expect(output).toMatch(/Skipping/i)
        const finalContent = fs.readFileSync(TEMPLATE_DEST, 'utf-8')
        expect(finalContent).toBe('// existing')
    })
})

afterAll(() => {
    fs.rmSync(path.resolve('.tmp'), { recursive: true, force: true })
})
