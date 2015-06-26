
# common-bundler

> Creates a common package from a collection of scripts

## Getting Started

```sh
$ npm i -D common-bundler
```

## Example

The bundler is a little opinionated about how you structure your scripts but something like this is a good start:

```
.
└── src
    ├── bundles
    │   ├── bundleA
    │   │   ├── bundleADep.js
    │   │   └── main.js
    │   └── bundleB
    │       └── main.js
    └── common
        └── menu.js
```

Now just let the bundler do its thing

```sh
$ bundler src/bundles -o dist
```

The bundler will give you some info about what its doing and you’ll end up with a few scripts to include in whichever pages you want, this will let you include just what the page needs to work and not drag around kb of dependency unless you need them

```
.
└── dist
    ├── bundleA.js
    ├── bundleB.js
    └── common.js
```

In general you’ll need `common` and whichever bundle you need in a page, making sure `common` goes in first.

```html
<script src="dist/common.js"></script>
<script src="dist/bundleA.js"></script>
```

## Use npm scripts

You can use it a global module, but that kind-of sucks so add the build process to your npm scripts object in your `package.json`

```json
{
    "scripts": {
        "build:scripts": "bundler src/bundles -o dist"
    }
}
```

Then let `npm` execute it

```sh
$ npm run build:scripts
```

## API

Check the help to see the full list of options

```sh
$ bundler -h
```

### `-t` `--transform`

> Adds a transform to the browserify pipeline

Feel free to add multiple transforms, as usual the order is important

_Note that there is generally no need to pass uglify, omitting the debug flag will tell the bundler to uglify up the scripts, currently just uses UglifyJS_

```sh
$ bundler src/bundles -o dist -t flowcheck -t babelify
```

### `-d` `--debug`

> Sticks browserify into debug mode which leaves the build unminified and gives you source maps too

_Having unminified and source maps is useful for something like babel that transpiles code as you’ll have access to human-readable transpiled code and the ES6 version that you’re writing_

```sh
$ bundler src/bundles -o dist -d
```

---

Enjoy responsibly!
