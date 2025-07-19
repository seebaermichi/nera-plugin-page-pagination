# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
