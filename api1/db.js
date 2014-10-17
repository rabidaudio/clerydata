var mysql = require('mysql');

var CONNECTION_INFO = require('./database_info.json'); //in .gitignore to keep it safe

var pool = mysql.createPool(CONNECTION_INFO);

exports.getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
          if (err) {
            console.error('error connecting: ' + err.stack);
            return;
          }
        callback(connection);
    });
};

exports.escape = mysql.escape;
exports.escapeId = mysql.escapeId;