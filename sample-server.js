
var HAPI   = require("hapi")
var HAPICo = require("./hapi-plugin-co")

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

