# js--check-internet-connection
check internet connection by third-party corporations servers (Google, Apple, Microsoft)


## Code example:
```js
'use strict';


const Log4js = require('log4js');
const logger = Log4js.getLogger('internet-connection-checker');

Log4js.configure({
    appenders: {
        toConsole:                  { type: 'console' },
        just_debug:                 { type: 'logLevelFilter', appender: 'toConsole', level: 'debug' },
    },
    categories: {
        default:                    { appenders: ['just_debug'], level: 'trace' },
    }
});


const InternetConnectionChecker = require('internet-connection-checker');
const checker = InternetConnectionChecker.Get();

console.log('connected: ', checker.status);

checker.on('connected', () => {
    console.log('connected: ', checker.status);
});

checker.on('disconnected', () => {
    console.log('disconnected: ', checker.status);
});

setTimeout(function() {
    InternetConnectionChecker.Stop();
}, 60 * 1000);

```
