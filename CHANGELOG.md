# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.1] - 2026-07-22

### Fixed

-   **the shipped template no longer crashes the build on pages created by
    another plugin.** `views/page-pagination.pug` dereferenced
    `meta.pagePagination.previous` with no guard, and that key is *absent* — not
    empty — on pages a later-running plugin generates. Plugins are applied in
    the order `start:` → alphabetical → `end:`, so `plugin-tags`, which builds
    its tag overview pages inside its own hook, sorts after this one: any site
    running both plugins with this template in a shared layout died with
    `TypeError: Cannot read properties of undefined (reading 'previous')` at the
    first tag page, taking the whole render down. Such pages now render an empty
    `<nav class="page-pagination">`
-   **ordering is deterministic for non-numeric `pagination_order` values.** The
    comparator returned `aOrder - bOrder`, which is `NaN` for a non-numeric
    string, and a comparator returning `NaN` makes `Array.prototype.sort`
    undefined behaviour: three pages ordered `intro` / `setup` / `zed` came back
    in a *different* order for each of the six input permutations. Numeric
    values, including numeric strings, still compare as numbers (`2` before
    `10`); non-numeric values now compare as text. This is the same class of
    defect 2.2.0 fixed for the mixed ordered/unordered case
-   **pages without a `layout` are no longer linked to.** Nera writes a page to
    `public/` only if its frontmatter has a `layout`, so such a page is never
    rendered — but it was still included in the sibling chain, producing a
    previous/next link to a URL that does not exist. Easy to hit by following
    the docs, since `@nera-static/plugin-stacks` recommends omitting `layout` on
    stack pages. Layout-less pages are now excluded from the chain in both
    directions

### Documentation

-   **fixed a broken include.** The absolute form was documented as
    `include /views/vendor/…`; root-absolute includes are resolved relative to
    `views/`, so that path looked for `views/views/vendor/…` and failed with
    `ENOENT`. The correct form is `include /vendor/plugin-page-pagination/page-pagination`
-   documented that `meta.pagePagination` is **absent** on plugin-generated
    pages, that running this plugin last via `config/plugin-order.yaml`
    paginates them, and that custom markup must guard the key
-   corrected the template-publishing description: the skip is checked on the
    **destination directory**, not per file, so a deleted template is not
    restored by a plain re-publish and the command still exits `0`
-   framed `--force` as what **delivers** a template change to a site that has
    already published — see the migration note below
-   documented that a missing neighbour is `false` rather than an absent key,
    that `name` comes from the sibling's `title`, and that a page with no
    siblings still emits an empty `<nav>`
-   documented how numeric and non-numeric `pagination_order` values compare
-   Compatibility: Node.js corrected from `>= 18` to `>= 20.0.0` (the floor
    2.3.0 actually raised), added the `plugin-utils` range, and split the Nera
    line — v4.1.0+ is the baseline for the plugin itself, the optional plugin
    ordering entry needs v4.2.0+, and the optional root-absolute include needs
    v4.3.0+
-   `📊 Generated Output` now shows real rendered markup for all four states
-   Development section uses `npx vitest run`; `npm test` is watch mode
-   stated that BEM class names are a public contract, and added a
    `🤝 Contributing` section linking to the Nera contributing guide

### Changed

-   the packaged `config/page-pagination.yaml` ships its one key **commented
    out**. It only restated the built-in default, so nothing changes; commenting
    it out means a copied config cannot silently pin the value

### Migration from v2.3.0

No action is required for the ordering and layout fixes — they are behavioural
bugfixes with no API change.

**The template fix is not delivered by upgrading.** `publishTemplates` skips
when `views/vendor/plugin-page-pagination/` already exists, so a site that has
published once keeps its old, unguarded copy and stays exposed to the crash. To
pick it up:

```bash
npx nera-page-pagination --force
```

This overwrites the published template and discards any local edits to it, so
diff first if you have customised it.

## [2.3.0] - 2026-07-21

### Changed

-   raised minimum Node from 18 to 20; Node 18 reached end-of-life on
    2025-04-30 and the dev toolchain requires Node 20+


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
