# Page pagination - Nera plugin
This is a plugin for the static side generator [nera](https://github.com/seebaermichi/nera) to create a page pagination.

## Usage
The only thing you need to do is to place this plugin in the `src/plugins` folder of your nera project.  
In addition you should include the template for this plugin, where ever you want to show the page pagination, by adding:
```html
include /relative/path/to/src/plugins/page-pagination/views/page-pagination
```
