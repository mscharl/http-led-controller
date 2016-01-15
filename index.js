var myApp = { };
myApp.root = require('path').dirname(require.main.filename);
myApp.package = require(myApp.root+"/package.json");

// Load global event emitter
var events = require('events');
myApp.emitter = new events.EventEmitter();

require("./modules/utils")(myApp);

// Initialize myApp
myApp.utils.consoleOutput("line");
myApp.utils.consoleOutput(myApp.package.name + " v"+myApp.package.version, "Center", true);
myApp.utils.consoleOutput(myApp.package.author, "Center", true);
if(myApp.package.description !== undefined){
    myApp.utils.consoleOutput(myApp.package.description, "Center", true);
}
myApp.utils.consoleOutput("line");

// Start the initialization process
myApp.utils.consoleOutput("Initializing...");

// Save environment into a structure
myApp.config = require('config');

// TODO Confirm all variables

/***
 *  Initialize the blinkstick
 ***/
require(myApp.root + "/modules/blinkstick/")(myApp);
myApp.blinkstick.initialize();


/***
 *  Initialize direct database access
 ***/
// require(myApp.root + "./database/sqlite3")(myApp);
// myApp.database.initialize();


/***
 *  Initialize simple persistent storage
 ***/
// require(myApp.root + "./storage/redis")(myApp);
require(myApp.root + "/modules/storage/memory")(myApp);
myApp.storage.initialize();


/***
 *  Initialize the webserver
 ***/
require(myApp.root + "/modules/webserver/")(myApp);
myApp.webserver.initialize();


/***
 *  Initialize the socket.io namespaces
 ***/
require(myApp.root + "/modules/sockets/template")(myApp);
