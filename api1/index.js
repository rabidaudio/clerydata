/*
Connection options

When establishing a connection, you can set the following options:

host: The hostname of the database you are connecting to. (Default: localhost)
port: The port number to connect to. (Default: 3306)
localAddress: The source IP address to use for TCP connection. (Optional)
socketPath: The path to a unix domain socket to connect to. When used host and port are ignored.
user: The MySQL user to authenticate as.
password: The password of that MySQL user.
database: Name of the database to use for this connection (Optional).
charset: The charset for the connection. This is called "collation" in the SQL-level of MySQL (like utf8_general_ci). If a SQL-level charset is specified (like utf8mb4) then the default collation for that charset is used. (Default: 'UTF8_GENERAL_CI')
timezone: The timezone used to store local dates. (Default: 'local')
connectTimeout: The milliseconds before a timeout occurs during the initial connection to the MySQL server. (Default: 10 seconds)
stringifyObjects: Stringify objects instead of converting to values. See issue #501. (Default: 'false')
insecureAuth: Allow connecting to MySQL instances that ask for the old (insecure) authentication method. (Default: false)
typeCast: Determines if column values should be converted to native JavaScript types. (Default: true)
queryFormat: A custom query format function. See Custom format.
supportBigNumbers: When dealing with big numbers (BIGINT and DECIMAL columns) in the database, you should enable this option (Default: false).
bigNumberStrings: Enabling both supportBigNumbers and bigNumberStrings forces big numbers (BIGINT and DECIMAL columns) to be always returned as JavaScript String objects (Default: false). Enabling supportBigNumbers but leaving bigNumberStrings disabled will return big numbers as String objects only when they cannot be accurately represented with [JavaScript Number objects] (http://ecma262-5.com/ELS5_HTML.htm#Section_8.5) (which happens when they exceed the [-2^53, +2^53] range), otherwise they will be returned as Number objects. This option is ignored if supportBigNumbers is disabled.
dateStrings: Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date objects. (Default: false)
debug: Prints protocol details to stdout. (Default: false)
trace: Generates stack traces on Error to include call site of library entrance ("long stack traces"). Slight performance penalty for most calls. (Default: true)
multipleStatements: Allow multiple mysql statements per query. Be careful with this, it exposes you to SQL injection attacks. (Default: false)
flags: List of connection flags to use other than the default ones. It is also possible to blacklist default ones. For more information, check Connection Flags.
ssl: object with ssl parameters or a string containing name of ssl profile. See SSL options.
*/

//var sql   = require('friendly-sql').parse('queries.sql');


var Schools   = require('./schools');
var Incidents = require('./incidents');

        // {
        //     name: "Georgia Tech",               //fuzzy search
        //     type: ["public", "4-year"],         //valid terms: 4-year, 2-year, for-profit, nonprofit, public, private
        //     location: {
        //         city: "Atlanta",
        //         state: "GA",
        //         zip: 30332
        //     },
        //     population: {
        //         male: {
        //             more_than: 10000,
        //             less_than: 50000
        //         },
        //         female: {
        //             more_than: 5000,
        //             less_than: 10000
        //         },
        //         ratio: {
        //             more_than: .2,
        //             less_than: .5
        //         },
        //         total:{
        //             more_than: 10000,
        //             less_than: 20000
        //         }
        //     }
        // }
var log = console.log.bind(console);



setTimeout(function(){
    Schools.search({population: {total: {more_than: 9000}}}, log);
    Schools.search({population: {total: {more_than: 9000, less_than: 10000}, women:{more_than: 1}, men:{less_than: 10}}, location:{city: "nowhere", state:"TN", zip: 12345}},log);
    Schools.search({name: "Dummy School for Dummies"}, log);
    Schools.search({name: "Dummy"}, log);
    Schools.search({name: "DSD"}, log);
    Schools.search({name: "nonsense"}, log);
    Schools.search({type: "public, 4-year"});
}, 1000);