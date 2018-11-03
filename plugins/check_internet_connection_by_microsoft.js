'use strict';

const log4js = require('@log4js-node/log4js-api');
const logger = log4js.getLogger('internet-connection-checker-ms');

const http = require('http');


class CheckConnectionBy_MS {
    constructor() {
    }

    Check() {
        let ResolvePromise, RejectPromise;
        const promise = new Promise(function (resolve, reject) {
            ResolvePromise  = resolve;
            RejectPromise   = reject;
        });

        http.get('http://www.msftncsi.com/ncsi.txt', (resp) => {
            let ok = (resp.statusCode == 200);

            if (ok) {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });
            
                resp.on('end', () => {
                    if (data === 'Microsoft NCSI') {
                        logger.debug('status: Ok');
                        ResolvePromise(true);
                    }
                    else {
                        logger.error("incorrect answer: '" + data + "'");
                        RejectPromise(false);
                    }
                });                
            }
            else {
                logger.error('incorrect status code: ' + resp.statusCode);
                RejectPromise(false);
            }
        }).on("error", (err) => {
            logger.error('error', err);
            RejectPromise(false);
        });

        return promise;
    }
};

//////////////////////////////////////
module.exports = CheckConnectionBy_MS;
