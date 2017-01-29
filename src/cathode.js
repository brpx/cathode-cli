#!/usr/bin/env node

const program = require('commander');
const request = require('superagent');
const Throttle    = require('superagent-throttle')
const fs = require('fs');
const chalk = require('chalk');
const open = require("open");
const shortid = require('shortid');

var data, config;

var endpoint = process.env.APIURL || 'https://cathode.io';

var throttle = new Throttle({
    active: true,     // set false to pause queue
    rate: 1,          // how many requests can be sent every `ratePer`
    ratePer: 1000,    // number of ms in which `rate` requests may be sent
    concurrent: 1     // how many requests can be sent concurrently
})

function retryTokenLoop(uid) {

    var count = 1;
    var retries = 30;

    for(var i=0;i<retries;i++) {
        request
            .post(endpoint + '/api/gettoken')
            .send({
                uid: uid
            })
        .set('Accept', 'application/json')
            .use(throttle.plugin())
            .end(function (err, res) {
                count++;
                process.stdout.write(".");
                if(res.body.token) {
                    console.log("\nGot authentication token. Saved to ~/.cathode");
                    fs.writeFileSync(process.env.HOME + "/.cathode", JSON.stringify({
                        token: res.body.token
                    }), "utf8");
                    console.log(res.body.token);
                    process.exit(0);
                }
                if(count==retries) {
                    console.log("\nAuthentication timed out. Try again.");
                }
            });
    }
}

program
.arguments('<url>')
.option('-f, --file <srapfile>', 'use local scrap file')
.option('-s, --scope <scope>', 'query scope. Use with -q')
.option('-q, --query <query>', 'query expression')
.option('-t, --token', 'get your auth token')
.option('-r, --render', 'render javascript into dom (default is false)')
.option('-x, --search <string>', 'search string, return probable expression')
.parse(process.argv);

if(program.token) {
    var uid = shortid.generate();
    open(endpoint + '/token/' + uid);
    retryTokenLoop(uid);
}
else
{

    if(program.args[0]) { // got url?

        try {
            data = fs.readFileSync( process.env.HOME + '/.cathode');
            config = JSON.parse(data);
        }
        catch (err) {
            console.log('You need to login to Cathode first.');
            console.log('Type: cathode --token');
            process.exit(0);
        }

        var scrap = false;
        if(program.file) {
            scrap=fs.readFileSync(program.file).toString();
        }

        request
            .post((process.env.APIURL || 'https://cathode.io') + '/api/scrap')
            .send({
                scrap: scrap,
                url: program.args[0],
                scope: program.scope,
                query: program.query,
                render: program.render ? "yes" : "no",
                search: program.search
            })
        .set('Authorization','token ' + config.token)
        .set('Accept', 'application/json')
            .end(function (err, res) {
                if (res && res.ok) {
                    switch(res.body.result) {
                        case 0:
                            if(program.search) {
                                for(var i in res.body.items) {
                                    console.log(res.body.items[i]);
                                    console.log("\n");
                                }
                            }
                            else
                            {
                                console.log(res.body.query);
                            }
                            break;
                        default:
                            console.log("Error: "+res.body.result+" "+res.body.error);
                            break;
                    }
                    process.exit(0);
                }
                else
                {
                    console.error(chalk.red(err));
                    console.log("Bad token? Try cathode --token");
                }

                process.exit(1);
            });

    } // got url

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}
