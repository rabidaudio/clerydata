var mysql = require('mysql');
var _ = require('underscore');

var CONNECTION_INFO = require('./database_info.json'); //in .gitignore to keep it safe

var pool = mysql.createPool(CONNECTION_INFO);

exports.getConnection = function(callback) {
    pool.getConnection(callback);
};

exports.escape = mysql.escape;
exports.escapeId = mysql.escapeId;
exports.build_where_all = function(sql, data){
    key_string = " ";
    _.each(data, function(value, key, list){
        key_string += mysql.escapeId(key) + " = " + mysql.escape(value) + " AND ";
    });
    return sql.replace(" ? ", key_string.substring(0, key_string.length - "AND ".length));
}