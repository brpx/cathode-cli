#!/usr/bin/env node

var program = require('commander');
var request = require('superagent');
var fs = require('fs');
var chalk = require('chalk');

var data, config;

program
.arguments('<url>')
.option('-f, --file <srapfile>', 'use local scrap file')
.option('-s, --scope <scope>', 'query scope. Use with -q')
.option('-q, --query <query>', 'query expression')
.option('-x, --search <string>', 'search string, return probable expression')
.action(function(url) {

    try {
        data = fs.readFileSync('~/.cathode');
        config = JSON.parse(data);
    }
    catch (err) {
        console.log('You need to login to Cathode first.');
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
            search: program.search
        })
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

            console.error(chalk.red(err));
            process.exit(1);
        });

})
.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
