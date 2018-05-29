'use strict';

var exec = require('sync-exec');
var commitHash = exec('git log --pretty=format:"%h" -n 1');
var commitDate = exec('git log --pretty=format:"%ci" -n 1');
module.exports = {
    frontend: {
        constants: {
            CONFIG: {
                // Everything here is injected as $rootScope.CONFIG into
                // the application.
            },
            API_END_POINT: 'http://mimo.api:3000/api/v1',
            API_URL: 'http://mimo.api:3000',
            AUTH_URL: 'http://mimo.api:3000',
            SLACK_TOKEN: '3540010629.12007999527',
            CHIMP_TOKEN: '531543883634',
            INTERCOM: '',
            PUSHER: 'f5c774e098156e548079',
            DEBUG: true,
            COLOURS: '#009688 #FF5722 #03A9F4 #607D8B #F44336 #00BCD4',
            COMMITHASH: commitHash.stdout,
            AMPLITUDE: '',
            THEMES: [
                "pink",
                "orange",
                "deep-orange",
                "blue",
                "blue-grey",
                "light-blue",
                "red",
                "green",
                "light-green",
                "lime",
                "yellow",
                "teal",
                "brown",
                "purple",
                "deep-purple",
                "cyan",
                "yellow",
                "amber",
                "indigo",
                "brown",
                "grey"
            ]
        }
    },
    // Server configuration.
    server: {
        env: {
            DEBUG: false,
        }
    }
};
