'use strict';


////////////////////////////////////////////////
const CheckIntervalInSeconds = 60;
const PluginPath = __dirname + '/plugins/';
////////////////////////////////////////////////


const EventEmitter = require('events').EventEmitter;

const log4js = require('@log4js-node/log4js-api');
const logger = log4js.getLogger('internet-connection-checker');


function loadPlugins(pluginPath) {
    const fs = require('fs');

    let resolvePromise;
    const promise = new Promise(resolve => { resolvePromise = resolve; });

    fs.readdir(pluginPath, function(err, items) {
        let plugins = [];

        for (let item of items) {
            if (!/check_internet_connection_by_.*\.js/i.test(item))
                continue;

            const plugin = pluginPath + item;

            try {
                const PluginClass = require(plugin);
                plugins.push(new PluginClass);
                logger.info('loaded plugin[' + item + ']');
            }
            catch (err) {
                logger.error("can't load plugin[" + item + "] error: ", err);
            }
        }

        resolvePromise(plugins);
    });

    return promise;
}

let checkers;

function Init() {
    let PromiseResolve, PromiseReject;
    checkers = new Promise((resolve, reject) => {
        PromiseResolve  = resolve;
        PromiseReject   = reject;
    });

    loadPlugins(PluginPath).then(checkers => {
        PromiseResolve(checkers);
    }).catch(err => {
        PromiseReject(err);
    });
}
Init();


async function rotateCheckerPlugins() {
    let checkers_ = await checkers;
    const plugin = checkers_.shift();
    checkers_.push(plugin);
}

class InternetConnectionChecker extends EventEmitter {
    constructor() {
        super();

        this._init();
    }
    
    get status() {
        return this._connectionState;
    }
    
    async _init() {
        try {
            await checkers;

            this._timerId = setInterval(() => {
                this._checkNow();
            }, CheckIntervalInSeconds * 1000);

            logger.info("Activated. Check connetion every " + CheckIntervalInSeconds + "s.");
            this._checkNow();

            return true;
        }
        catch (err) {
            logger.error("DISABLED", err);
            return false;
        }
    }

    async _checkNow() {
        let checkers_ = await checkers;

        for (let i = 0; i < checkers_.length; ++i) {
            let cc = checkers_[0];
            try {
                await cc.Check();
                rotateCheckerPlugins();
                
                logger.debug('connection test: passed');
                if (!this._connectionState) {
                    this._connectionState = true;
                    logger.info('connected');
                    this.emit('connected');
                }
                
                return true;
            }
            catch (err) {
                rotateCheckerPlugins();
            }
        }
        
        logger.debug('connection test: FAILED');
        if (this._connectionState || (this._connectionState === undefined)) {
            this._connectionState = false;
            logger.info('disconnected');
            this.emit('disconnected');
        }

        return false;
    }

    _stop() {
        if (!this._timerId)
        return;
        
        clearInterval(this._timerId);
        this._timerId = null;
        
        logger.info("Deactivated.");
    }
};




/////////////////////////////
let checker;
module.exports.Get = function() {
    if (!checker)
        checker = new InternetConnectionChecker;

    return checker;
};

module.exports.Stop = function() {
    if (checker) {
        checker._stop();
        checker = null;
    }
}
