# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-20

### Added

-   **the `publish-template` command is now actually shipped.** `bin/` was
    missing from both the `bin` field and the `files` list, so the script was
    never included in the published tarball — `npx nera-page-pagination` and
    `npm run publish-template` both failed for every consumer. The command is
    exposed as `nera-page-pagination`
-   `--force` flag on that command, to re-publish over an existing template
    and overwrite local edits. Without it, publishing skips as before

### Fixed

-   **pagination order is now deterministic when only some pages define
    `pagination_order`.** The comparator fell back to creation date whenever
    *either* page lacked an order, which is not a transitive relation: with
    pages ordered 1 (March), 2 (January) and unordered (February) it produced
    a cycle, and the same three pages sorted three different ways depending
    only on the order the filesystem returned them in. Adding an unrelated
    file to a directory could silently reshuffle a site's prev/next links.

    Ordering is now a total order: pages with an explicit `pagination_order`
    come first and sort by it, then pages without one sort by creation date,
    and `href` breaks any remaining tie
-   **`pagination_order: 0` is no longer treated as absent.** The guard tested
    truthiness, so a page numbered from zero fell through to date sorting
-   sorting no longer misbehaves when `createdAt` is missing or unparseable;
    such pages sort last rather than producing `NaN` comparisons

### Changed

-   configuration is read inside `getMetaData` rather than at module load, so
    edits to `config/page-pagination.yaml` take effect without a restart
-   `@nera-static/plugin-utils` range raised to `^1.2.0`, where `force` lands

### Documentation

-   documented the full ordering rules, including that ordered and unordered
    pages can be mixed safely and that `0` is a valid order
-   the include example uses the layout-relative form, which works on every
    Nera version; the previous absolute form requires 4.3.0 or later
-   fixed an invalid `npx` invocation; the command is `npx nera-page-pagination`

## [2.1.0] - 2025-07-19

### Added

-   Professional CHANGELOG.md for release tracking
-   Enhanced README.md with comprehensive documentation and examples
-   Support for Nera v4.1.0 static site generator
-   BEM (Block Element Modifier) CSS methodology for pagination templates
-   Enhanced template publishing system via `bin/publish-template.js`
-   Comprehensive test suite with 12 tests covering all functionality

### Changed

-   Updated @nera-static/plugin-utils to v1.1.0 for improved compatibility
-   Improved package.json metadata and repository references
-   Enhanced code documentation and examples
-   Modernized CSS classes using BEM methodology:
    -   `.page-pagination` (main pagination container)
    -   `.page-pagination__link` (pagination links)
    -   `.page-pagination__link--previous` (previous page link)
    -   `.page-pagination__link--next` (next page link)

### Technical Details

-   Maintains stable API with `getMetaData()` function
-   Full compatibility with Nera v4.1.0 plugin system
-   Zero breaking changes from previous version
-   All tests passing (12/12)
-   Template publishing to `views/vendor/plugin-page-pagination/`
-   Sequential navigation within directory structures
-   Configurable ordering via `pagination_order` property

## [2.0.0] - 2024-07-19

### Added

-   Initial stable release for Nera static site generator
-   Previous/next page pagination within directories
-   Support for custom ordering via `pagination_order` frontmatter
-   Automatic fallback to creation date sorting
-   Built-in Pug template with clean markup
-   Template publishing system
-   Comprehensive test coverage

### Features

-   Sequential navigation between sibling pages
-   Directory-based page grouping
-   Configurable ordering system
-   Simple previous/next link generation
-   Integration with @nera-static/plugin-utils

### Dependencies

-   Node.js >=18 support
-   ES modules architecture
-   Modern development tooling (Vitest, ESLint, Husky)
