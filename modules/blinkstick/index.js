module.exports = function(myApp) {
    var debug = require('debug')('module:blinkstick');
    var blinkstick = { module: "blinkstick" };

    var fs = require('fs');
    var net = require('net');
    var bs = require('blinkstick');
    var leds = bs.findAll();
    var serial = [];                     // Access the Blinkstick via its Serial Number

    blinkstick.initialize = function(){
        debug('searching for Blinksticks(tm)...');

        bs.findAllSerials(blinkstick.finishInitialize);
    };

    blinkstick.finishInitialize = function(){
        if (leds.length > 0) {
            for (var i = leds.length - 1; i >= 0; i--) {
                var s = leds[i].serial;

                if(myApp.config.BLINKSTICK_USE_INVERSE === true) {
                    leds[i].setInverse(true);
                }
                if(myApp.config.BLINKSTICK_USE_MODE === 0 || myApp.config.BLINKSTICK_USE_MODE === 1 || myApp.config.BLINKSTICK_USE_MODE === 2) {
                    leds[i].setMode(myApp.config.BLINKSTICK_USE_MODE);
                }

                serial[s] = leds[i];
            }

            myApp.utils.customSort(leds, 'serial');

            // Remove old path if exists, to avoid EADDRINUSE message
            // fs.unlink(myApp.config.SOCK, function () { startSocket(myApp.config.SOCK); });

            // Listen on the emitter
            myApp.emitter.on('module.blinkstick', function(obj) {

                // Format incoming object data
                if (isNaN(obj.body.target)) {
                    obj.body.target = myApp.utils.searchByFieldGetIndex(leds, 'serial', obj.body.target);
                } else {
                    obj.body.target = parseInt(obj.body.target);
                }

                // if searchByFieldGetIndex returns undefined, we want to find it.
                if (typeof leds[obj.body.target] === 'undefined') {
                    myApp.emitter.emit('module.webserver', { res: obj.head.callback.object, status: 400, data: "400 Bad target." } );
                    return;
                }

                debug(obj.body.target);
                if (obj.body.action === 'set') {
                    changeColor(obj.body.target, obj.body.data, makeCallback(obj));
                } else if (obj.body.action === 'get') {
                    makeCallback(obj)();
                } else {
                    if (typeof obj.head !== 'undefined' && typeof obj.head.callback !== 'undefined' && typeof obj.head.callback.object === 'object' && obj.head.callback.type === 'express') {
                        myApp.emitter.emit('module.webserver', { res: obj.head.callback.object, status: 400, data: "400 Bad dog!" } );
                    } else {
                        debug('silently failing from bad object', obj);
                    }
                }
            });

            myApp.utils.consoleOutput('blinkstick: initialized ' + leds.length + ' Blinksticks(tm)...');
        } else {
            throw new RangeError("No Blinksticks(tm) found.", "modules/blinkstick/index.js");
        }
    };

    //********* Private Functions *********//

    // You must return a function in order for 'obj.head.callback.res' to remain stateful
    makeCallback = function(obj) {
        debug(obj.body);
        return function() {
            leds[obj.body.target].getColor(function(err,r,g,b) {
                r = leds[obj.body.target].getInverse() ? 255 - r : r;
                g = leds[obj.body.target].getInverse() ? 255 - g : g;
                b = leds[obj.body.target].getInverse() ? 255 - b : b;
                debug('read:', myApp.utils.decimalToHex(r) + myApp.utils.decimalToHex(g) + myApp.utils.decimalToHex(b));
                myApp.emitter.emit('module.webserver', { res: obj.head.callback.object, status: 200, data: myApp.utils.decimalToHex(r) + myApp.utils.decimalToHex(g) + myApp.utils.decimalToHex(b) } );
            });
        };
     };

    // This server listens on a Unix socket at 'path'
    function startSocket(path) {
        var unix = net.createServer(function(client) {
            debug('client connected');
            client.on('end', function() {
                debug('client disconnected');
            });
            client.on('data', function(data) {
                debug("socket: ", data);
                changeColor(data);
                client.write('OK');
            });
        });

        unix.listen(path, function() { //'listening' listener
            fs.chmodSync(path, 0777);
            debug('server bound');
        });
    }

    function changeColor(target, data, callback) {
        var pattern = new RegExp(/[0-9a-f]{6}/);
        var str = data.toString().toLowerCase().replace(/\n$/, '');
        if (typeof colors[str] !== 'undefined') {
            debug('changing color to', str, colors[str]);
            leds[target].setColor(colors[str], callback);
        } else if (pattern.test(str)) {
            debug('changing color to', str);
            leds[target].setColor("#"+str, callback);
        } else {
            debug('invalid data', str);
        }
    }

    myApp.blinkstick = blinkstick;
    debug('loaded...');

    var colors = {
        'off': '#000000',
        'on':  '#FFFFFF',
        'blue': '#0000FF',
        'red':  '#FF0000',
        'green': '#00FF00',
        'purple': '#FF00FF',
        'white': '#FFFFFF'
    };

};
