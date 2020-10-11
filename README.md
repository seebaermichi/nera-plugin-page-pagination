# Page pagination - Nera plugin
This is a plugin for the static side generator [Nera](https://github.com/seebaermichi/nera) to create a page pagination, where links to previous and next sibling of current page are added.

## Usage
The only thing you need to do is to place this plugin in the `src/plugins` folder of your Nera project.  
In addition you should include the template for this plugin, where ever you want to show the page pagination or see it as an example.
```html
include /relative/path/to/src/plugins/page-pagination/views/page-pagination
```

The previous and next pages are determined by ordering all pages on the same level by their creation date. If you want to influence this order you can either use another property `pagination_order` in the meta section of each page or define your own property in the config file as `order_property`.  
```yaml
//- config/page-pagination.yaml

order_property: some_property_for_siblings_order
```
