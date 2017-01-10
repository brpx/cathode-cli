# cathode-cli

[Cathode][1] is a free cloud-based, crowdsourced, developer friendly and incredibly simple to use scraping engine for the web of data.

cathode-cli is a command line tool that uses Cathode's API and helps developers to build and test their scrap formulas.

**Installation**

To install cathode-cli using npm:

```
npm install cathode-cli -g
```

**Usage**

To use cathode-cli, just type *cathode* from your terminal command line:


```
  Usage: cathode [options] <url>

  Options:

    -h, --help             output usage information
    -f, --file <srapfile>  use local scrap file
    -s, --scope <scope>    query scope. Use with -q
    -q, --query <query>    query expression
    -x, --search <string>  search string, return probable expression
```

Before you start using Cathode, you should understand what [scrap files][2] are.


[1]: https://cathode.io/
[2]: https://github.com/brpx/cathode-scraps/blob/master/README.md
