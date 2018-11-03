'use strict';

const log4js = require('@log4js-node/log4js-api');
const logger = log4js.getLogger('internet-connection-checker-google');

const https = require('https');


class CheckConnectionBy_Google {
    constructor() {
    }

    Check() {
        let ResolvePromise, RejectPromise;
        const promise = new Promise(function (resolve, reject) {
            ResolvePromise  = resolve;
            RejectPromise   = reject;
        });

        https.get('https://www.gstatic.com/generate_204', (resp) => {
            const ok = (resp.statusCode == 204);
            if (ok) {
                logger.debug('status: Ok');
                ResolvePromise(true);
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

//////////////////////////////////////////
module.exports = CheckConnectionBy_Google;
