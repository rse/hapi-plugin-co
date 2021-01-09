/*
**  hapi-plugin-co -- HAPI plugin for Co-Routine handlers
**  Copyright (c) 2016-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  external dependencies  */
const Boom = require("@hapi/boom")
const co   = require("co")

/*  internal dependencies  */
const pkg  = require("./package.json")

/*  the HAPI plugin register function  */
const register = async (server, options) => {
    /*  perform WebSocket handling on HAPI start  */
    server.ext({ type: "onPreStart", method: (server) => {
        /*  iterate over all routes  */
        server.table().forEach((route) => {
            /*  on-the-fly replace plain generator function with regular function
                which internally uses the generator function as a co-routine  */
            if (   typeof route.settings.handler === "function"
                && route.settings.handler.constructor.name === "GeneratorFunction") {
                route.settings.handler = ((handler) => {
                    /*  outer scope: provide regular handler function  */
                    return (request, h) => {
                        /*  execute generator function as a co-routine  */
                        return co.wrap(handler.bind(this))(request, h).catch((err) => {
                            /*  convert errors into HTTP replies  */
                            if (!(typeof err === "object" && err.isBoom)) {
                                if (err instanceof Error) {
                                    request.log([ "error", "uncaught" ], err.stack)
                                    err = Boom.boomify(err, 500)
                                }
                                else if (typeof err === "string") {
                                    request.log([ "error", "uncaught" ], err)
                                    err = Boom.create(500, err)
                                }
                                else {
                                    request.log([ "error", "uncaught" ], String(err))
                                    err = Boom.create(500, String(err))
                                }
                            }
                            return err
                        })
                    }
                })(route.settings.handler)
            }
        })
    } })
}

/*  export as plugin object  */
module.exports = {
    plugin: {
        register: register,
        pkg:      pkg
    }
}

