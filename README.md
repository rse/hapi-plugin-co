
hapi-plugin-co
=====================

[HAPI](http://hapijs.com/) plugin for Co-Routine handlers

<p/>
<img src="https://nodei.co/npm/hapi-plugin-co.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/hapi-plugin-co.png" alt=""/>

Installation
------------

```shell
$ npm install hapi hapi-plugin-co
```

About
-----

This is a small plugin for the [HAPI](http://hapijs.com/) server
framework for seamless support of co-routines for route handlers.

Usage
-----

The following sample server shows the plugin in action.
It responds with `{ value: 42 }` after waiting for a second.

```js
var HAPI   = require("hapi")
var HAPICo = require("hapi-plugin-co")

var server = new HAPI.Server({ debug: { request: [ "error" ] } })
server.connection({ address: "127.0.0.1", port: 12345 })
server.register(HAPICo, function () {
    server.route({
        method:  "GET",
        path:    "/foo",
        handler: function * (request, reply) {
            var value = yield new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(42)
                }, 1000)
            })
            reply({ value: value })
        }
    })
    server.start()
})
```

Notice
------

With [`hapi-async-handler`](https://github.com/ide/hapi-async-handler)
there is an alternative HAPI plugin with similar functionality. The
difference is that `hapi-async-handler` uses the official HAPI `handler`
functionality to provide its functionality (and this way unfortunately
causes more boilerplate code for the application then wished), does not
recognize `Boom` error responses, requires an ES7 `async function ()`
(and not just an ES6 generator function `function * ()`) and especially
does not use `co` internally (and this way cannot easily support the
yielding of regular values, promises, sunks, etc).

With [`hapi-co`](https://github.com/bandwidthcom/co-hapi)
there is another alternative HAPI plugin with a much larger
functionality. It allows the use of `co`-powered generator functions for
all types of callbacks, including handlers. If you really need all this
additional functionality, go with this module instead.

License
-------

Copyright (c) 2016-2017 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

