rpi-led
=======

`rpi-led` is an over-engineered API server to interact with your blinkstick
remotely.

It listens on a web-server and via a unix-socket.

### Development

A `nodemon.json` file should be created in the root so that `grunt` can run
properly.  This would hold all run-time environment variables you do not wish
to commit to the git repo.

    {
        "env": {
            "PORT": 3000,
            "SOCK": "/tmp/node-led.sock"
        }
    }

#### Over-Engineered

This package was built upon
[NodeJS-Express-Boilerplate](http://github.com/jnovack/nodejs-express-boilerplate),
a package I wrote to get an express website with socket.io up and be less "quick
and dirty" about it.