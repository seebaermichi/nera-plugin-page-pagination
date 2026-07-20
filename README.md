# @nera-static/plugin-page-pagination

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator that creates previous/next navigation between sibling pages. Perfect for documentation sites, tutorials, or any sequential content that needs pagination-style navigation.

## ✨ Features

- Automatically generates previous/next links based on sibling pages
- Supports custom sorting via `pagination_order` (or custom property)
- Falls back to creation date when no order is specified
- Configurable sorting property via `config/page-pagination.yaml`
- Includes a ready-to-use Pug template
- Lightweight and easy to integrate
- Full compatibility with Nera v4.1.0+

## 🚀 Installation

Install the plugin in your Nera project:

```bash
npm install @nera-static/plugin-page-pagination
```

Nera will automatically detect the plugin and inject pagination metadata during the build.

## ⚙️ Configuration

Customize the order property by creating `config/page-pagination.yaml`:

```yaml
order_property: custom_order
```

This tells the plugin to use `custom_order` instead of `pagination_order`.

### Example with custom property

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

## 🧩 Usage

### Automatic sibling pagination

Pages in the same directory are linked in order:

1. Pages with a **`pagination_order`**, sorted by that value
2. Then pages without one, sorted by **creation date**
3. Ties are broken by `href`, so the result never depends on the order files
   happen to be read from disk

Mixing the two is safe: every page that defines `pagination_order` comes before
every page that does not. `pagination_order: 0` is a valid value and sorts
first — it is not treated as "unset".

```yaml
---
title: Getting Started
pagination_order: 1
---
```

```yaml
---
title: Advanced Topics
pagination_order: 2
---
```

Result:

- "Getting Started" → Next: "Advanced Topics"
- "Advanced Topics" → Previous: "Getting Started"

### Directory-based grouping

Only pages within the same directory are linked:

```
pages/
├── docs/
│   ├── intro.md
│   └── start.md
└── blog/
    └── post.md
```

### Template integration

`meta.pagePagination` is added to each page:

```javascript
{
  previous: { href: "/docs/intro.html", name: "Introduction" },
  next: { href: "/docs/advanced.html", name: "Advanced Topics" }
}
```

Use in Pug:

```pug
if meta.pagePagination.previous
  a.previous(href=meta.pagePagination.previous.href)
    | ← #{meta.pagePagination.previous.name}

if meta.pagePagination.next
  a.next(href=meta.pagePagination.next.href)
    | #{meta.pagePagination.next.name} →
```

## 🛠️ Template Publishing

Use the default template provided by the plugin:

```bash
npx nera-page-pagination
```

This copies the template to:

```
views/vendor/plugin-page-pagination/page-pagination.pug
```

Publishing skips when the file already exists, so re-running never discards
your edits. To overwrite it with the packaged version:

```bash
npx nera-page-pagination --force
```

Include it in your layout:

```pug
include ../vendor/plugin-page-pagination/page-pagination
```

The path is relative to the **including file**, so from a layout in
`views/layouts/` this resolves to `views/vendor/…`. An absolute
`include /views/vendor/…` also works, but only on Nera 4.3.0 and later — the
relative form works on every version.

## 🎨 Styling

The plugin uses BEM CSS methodology:

```css
.page-pagination { }
.page-pagination__link { }
.page-pagination__link--previous { }
.page-pagination__link--next { }
```

Customize these classes in your CSS.

## 📊 Generated Output

The plugin injects pagination metadata into `meta.pagePagination`. The rendering depends on your chosen template or custom markup.

## 🧪 Development

```bash
npm install
npm test
npm run lint
```

Tests use [Vitest](https://vitest.dev) and cover:

- Sibling page detection and grouping
- Sorting by order property and fallback
- Previous/next link generation
- Edge cases (first page, last page)
- Template rendering

## 🧑‍💻 Author

Michael Becker
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

- [Plugin Repository](https://github.com/seebaermichi/nera-plugin-page-pagination)
- [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-page-pagination)
- [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## 🧩 Compatibility

- **Nera**: v4.1.0+
- **Node.js**: >= 18
- **Plugin API**: Uses `getMetaData()` for pagination metadata

## 📦 License

MIT
