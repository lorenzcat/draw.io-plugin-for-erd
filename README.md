# ER Diagram Plugin for [draw.io](https://www.draw.io)

A plugin for [draw.io](https://www.draw.io) that can partially automate the process of drawing an entity-relationship diagram (Chen's notation). 

You write a line describing how the entity or relation should be and the plugin does the drawing for you.

### Example
A line like `entity Employee(id pk, firstName, lastName, email, hireDate, salary)w` results in

![Alt text](./examples/employee.svg)

### Installation
[This post](https://github.com/holroy/draw.io-plugins/wiki/Install-draw.io-Plugin) has instructions on how to install plugins:

- Navigate the menues to Extras > Plugins...
- Hit the Add button
- Paste [this](https://cdn.jsdelivr.net/gh/lorctn/draw.io-plugin-for-erd/dist/erd-plugin.js) link into the dialog text field that appears (distributed through [jsDelivr](https://www.jsdelivr.com/))
- Hit the Add button, and then the Apply button, and the OK button
- Reload the draw.io page, and accept the load of the plugin which follows
- Start using your newly installed plugin

### Usage
[Here](./notation.md) you will find a description of the notation that is beeing used.

[Here](./usage.md) you will find everything you can do with this plugin.

### License
[MIT](./LICENSE)

### Extras
When loading the plugin [draw.io](https://www.draw.io) prompts you this message: '*NOTE: Only allow plugins to run if you fully understand the security implications of doing so.*'. If you don't trust me you can build the project yourself and host the plugin locally. First clone [this](https://github.com/lorctn/draw.io-plugin-for-erd) repository, then do

```
$ npm init
$ node build.js
```
and then serve on the web (as you like, one quick way is `$ python -m http.server` ).

Finally paste the link to the local build (probably http://127.0.0.1:8000/dist/erd-plugin.js) in the [draw.io](https://www.draw.io) plugin box.