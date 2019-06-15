
var HAPI    = require("@hapi/hapi")
var HAPICo  = require("./hapi-plugin-co")
var Request = require("request-promise")

var server = HAPI.server({
    host:  "127.0.0.1",
    port:  12345,
    debug: { request: [ "error" ] }
})

;(async () => {
    await server.register(HAPICo)

    /*  provider  */
    server.route({
        method:  "GET",
        path:    "/foo",
        handler: function * (request, h) {  /*  THE CO-ROUTINE  */
            var value = yield new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(42)
                }, 1000)
            })
            return { value: value }
        }
    })
    server.route({
        method:  "GET",
        path:    "/bar",
        handler: async (request, h) => {
            var value = await new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(42)
                }, 1000)
            })
            return { value: value }
        }
    })

    await server.start()

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

})()

