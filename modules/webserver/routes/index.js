module.exports = function(app, myApp, express){

    var router = express.Router();

    router.get('/api/v1/power/:state', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'set', data: req.params.state } });
    });

    router.get('/api/v1/power', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'get' } });
    });

    router.get('/api/v1/brightness', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'get' } });
    });

    router.get('/api/v1/color/:color', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'set', data: req.params.color } });
    });

    router.get('/api/v1/color', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'get' } });
    });

    //

    router.get('/api/v1/:target/power/:state', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'set', target: req.params.target, data: req.params.state } });
    });

    router.get('/api/v1/:target/power', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'get', target: req.params.target } });
    });

    router.get('/api/v1/:target/brightness', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'get', target: req.params.target } });
    });

    router.get('/api/v1/:target/color/:color', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'set', target: req.params.target, data: req.params.color } });
    });

    router.get('/api/v1/:target/color', function(req, res, next) {
        myApp.emitter.emit('module.blinkstick', { head: { callback: { type: 'express', object: res } }, body: { action: 'get', target: req.params.target } });
    });

    myApp.emitter.on('module.webserver', function(obj) {
        obj.res.status(obj.status);
        switch (obj.res.req.url.substring(obj.res.req.url.lastIndexOf('/'))) {
            case '/power':
                output = (obj.data === '000000' ? "0" : "1");
                break;
            case '/brightness':
                output = parseInt( (
                        (parseInt(obj.data.substr(0,2),16)*0.265074126) +
                        (parseInt(obj.data.substr(2,2),16)*0.670114631) +
                        (parseInt(obj.data.substr(4,2),16)*0.064811243)
                    )*100/255);
                break;
            default:
                output = obj.data.toString();
        }

        obj.res.send(output);
    });

    return router;
};