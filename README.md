# @nera-static/plugin-page-pagination

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator that creates previous/next navigation between sibling pages. Perfect for documentation sites, tutorials, or any sequential content that needs pagination-style navigation.

## ✨ Features

-   Automatically adds previous/next navigation based on sibling pages
-   Supports custom sorting via `pagination_order` meta field
-   Falls back to creation date when no order is specified
-   Configurable sorting property via YAML config
-   Includes a ready-to-use Pug view template
-   Lightweight and easy to integrate

## 🚀 Installation

Install the plugin in your Nera project:

```bash
npm install @nera-static/plugin-page-pagination
```

Nera will automatically detect the plugin and apply the page pagination metadata during the build.

## 🛠️ Usage

### Automatic sibling pagination

The plugin automatically creates pagination between pages in the same directory. Pages are sorted by:

1. **`pagination_order`** field (if present)
2. **Creation date** (fallback)

```yaml
---
title: Getting Started
type: page
pagination_order: 1
---
```

```yaml
---
title: Advanced Topics
type: page
pagination_order: 2
---
```

This creates navigation like:

-   "Getting Started" → Next: "Advanced Topics"
-   "Advanced Topics" → Previous: "Getting Started"

### Directory-based grouping

Only pages within the same directory are linked together:

```
pages/
├── docs/
│   ├── intro.md          # Links to start.md
│   └── start.md          # Links to intro.md
└── blog/
    └── post.md           # No pagination (standalone)
```

### Template integration

The plugin adds a `pagePagination` object to each page's metadata:

```javascript
{
  previous: {
    href: "/docs/intro.html",
    name: "Introduction"
  },
  next: {
    href: "/docs/advanced.html",
    name: "Advanced Topics"
  }
}
```

Use it in your templates:

```pug
if meta.pagePagination.previous
  a.previous(href=meta.pagePagination.previous.href)
    | ← #{meta.pagePagination.previous.name}

if meta.pagePagination.next
  a.next(href=meta.pagePagination.next.href)
    | #{meta.pagePagination.next.name} →
```

## 🛠️ Publish Default Template

Use the default template provided by the plugin:

```bash
npx @nera-static/plugin-page-pagination run publish-template
```

This copies the template to:

```
views/vendor/plugin-page-pagination/page-pagination.pug
```

Include it in your layout:

```pug
include /views/vendor/plugin-page-pagination/page-pagination
```

## ⚙️ Configuration

Create a configuration file to customize the sorting behavior:

```yaml
# config/page-pagination.yaml
order_property: custom_order
```

This tells the plugin to use `custom_order` instead of the default `pagination_order` field for sorting.

### Example with custom property:

```yaml
---
title: Chapter 1
custom_order: 100
---
```

```yaml
---
title: Chapter 2
custom_order: 200
---
```

## 🎯 Use Cases

### Documentation Sites

Create sequential navigation through documentation sections:

```
docs/installation.md    (pagination_order: 1)
docs/getting-started.md (pagination_order: 2)
docs/advanced.md        (pagination_order: 3)
```

### Tutorial Series

Link tutorial steps in order:

```
tutorial/step-1.md      (pagination_order: 1)
tutorial/step-2.md      (pagination_order: 2)
tutorial/step-3.md      (pagination_order: 3)
```

### Blog Series

Connect related blog posts:

```
blog/series/part-1.md   (pagination_order: 1)
blog/series/part-2.md   (pagination_order: 2)
blog/series/part-3.md   (pagination_order: 3)
```

## 🧪 Development

```bash
npm install
npm test
npm run lint
```

Tests use [Vitest](https://vitest.dev) and cover:

-   Sibling page detection and grouping
-   Sorting by `pagination_order` and creation date
-   Previous/next link generation
-   Edge cases (first page, last page, standalone pages)
-   Template rendering with different pagination states

### 🔄 Compatibility

-   **Nera v4.1.0+**: Full compatibility with latest static site generator
-   **Node.js 18+**: Modern JavaScript features and ES modules
-   **Plugin Utils v1.1.0+**: Enhanced plugin utilities integration

### 🏗️ Architecture

This plugin uses the `getMetaData()` function to process page data and inject pagination information. It automatically detects pages in the same directory and provides sequential navigation links.

### 🎨 BEM CSS Classes

The plugin uses BEM (Block Element Modifier) methodology:

-   `.page-pagination` - Main pagination container
-   `.page-pagination__link` - Pagination links
-   `.page-pagination__link--previous` - Previous page link
-   `.page-pagination__link--next` - Next page link

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

-   [Plugin Repository](https://github.com/seebaermichi/nera-plugin-page-pagination)
-   [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-page-pagination)
-   [Nera Static Site Generator](https://github.com/seebaermichi/nera)
-   [Plugin Documentation](https://github.com/seebaermichi/nera#plugins)

## 📦 License

MIT
