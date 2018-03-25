
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
framework for seamless support of co-routines for route handlers,
based on generator functions.

NOTICE
------

Although this plugin was ported to and works just with HAPI version
&gt;= 17.0.0 and Node.js version &gt; 8.0.0, you are advised to use
*asynchronous functions* with HAPI version &gt;= 17.0.0's native support
instead of *generator functions* and this HAPI plugin support. Generator
functions and this HAPI plugin are actually from the HAPI version &lt;
17.0.0 and Node.js version &lt; 8.0.0 era.

Usage
-----

The following sample server shows the plugin in action.
It responds with `{ value: 42 }` after waiting for a second.

```js
var HAPI    = require("hapi")
var HAPICo  = require("hapi-plugin-co")
var Request = require("request-promise")

var server = new HAPI.Server({ debug: { request: [ "error" ] } })
server.connection({ address: "127.0.0.1", port: 12345 })
server.register(HAPICo, function () {

    /*  provider  */
    server.route({
        method:  "GET",
        path:    "/foo",
        handler: function * (request, reply) {  /*  THE CO-ROUTINE  */
            var value = yield new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(42)
                }, 1000)
            })
            reply({ value: value })
        }
    })

    server.start(function () {
        /*  consumer  */
        let p1 = server.inject({ method: "GET", url: "/foo" }).then(function (response) {
            if (response.result.value === 42)
                console.log("-- internal request: /foo: OK")
            else
                console.log("-- internal request: /foo: ERROR: invalid response: ", response.result.value)
        }).catch(function (error) {
            console.log("-- internal request: /foo: ERROR: ", error)
        })
        let p2 = Request({ uri: "http://127.0.0.1:12345/foo", json: true }).then(function (response) {
            if (response.value === 42)
                console.log("-- external request: /foo: OK")
            else
                console.log("-- external request: /foo: ERROR: invalid response: ", response.value)
        }).catch(function (error) {
            console.log("-- external request: /foo: ERROR: ", error)
        })
        Promise.all([ p1, p2 ]).then(function () {
            server.stop({ timeout: 1000 }, function (error) {
                if (error)
                    console.log("ERROR", error)
                process.exit(0)
            })
        })
    })

})
```

Notice
------

The smaller alternative: With
[`hapi-async-handler`](https://github.com/ide/hapi-async-handler)
there is an alternative HAPI plugin with similar functionality. The
difference is that `hapi-async-handler` uses the official HAPI `handler`
functionality to provide its functionality (and this way unfortunately
causes more boilerplate code for the application then wished), does not
recognize `Boom` error responses, requires an ES7 `async function ()`
(and not just an ES6 generator function `function * ()`) and especially
does not use `co` internally (and this way cannot easily support the
yielding of regular values, promises, sunks, etc).

The larger alternative: With
[`hapi-co`](https://github.com/bandwidthcom/co-hapi) there is
another alternative HAPI plugin with a much larger functionality. It
allows the use of `co`-powered generator functions for all types of
callbacks, including handlers. If you really need all this additional
functionality, go with this module instead.

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

