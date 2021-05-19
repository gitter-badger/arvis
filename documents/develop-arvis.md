## Build and development

### Template

This package is builded on [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

### Other packages

* [arvis-core](https://github.com/jopemachine/arvis-core)

Arvis module not directly related to electron, renderer

### Build from sources

* [Macos](./documents/build-macos.md)
* [Windows](./documents/build-windows.md)

### iohook config

This package uses [iohook](https://github.com/electron/releases) which depending on the version of the electron and node, has different binaries.

So, If `node` or `electron` version is updated, the iohook config of package.json should be updated as well.

### config file pathes

[Click to view config file pathes](./documents/config-file-pathes.md)