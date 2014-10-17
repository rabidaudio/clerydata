/*
id              PK
school_id       FK
campus          STR
year            INT
forcible        INT
nonforcible     INT


men_total,women_total,Total,FORCIB,NONFOR,forcib_or_nonfor,campus_id

,14974,6583,21557,0,0,0,5388
,14974,6583,21557,,,,5388
,14974,6583,21557,,,,5388
,14974,6583,21557,,,,5388
,14974,6583,21557,0,0,0,5388
,14974,6583,21557,,,,5388
,14974,6583,21557,,,,5388
,14974,6583,21557,0,0,0,5388
,14974,6583,21557,,,,5388


*/
var _ = require('underscore');

var db = require('./db');


/*
params: {
    school_id: 1,           //get from school search
    year: 2003 OR
    year: {
        since:  2000,       //inclusive
        before: 2010        //exclusive
    },
    campus: "Main campus",
    on_campus: true         //or false or null (both)
}
*/
function count_incidents(params, callback){
    db.getConnection(function(err, connection){
        sql_append = "";
        if(params.year instanceof Object){
            if(params.year.since) sql_append += " AND `year` >= "+db.escape(params.year.since);
            if(params.year.before) sql_append += " AND `year` < "+db.escape(params.year.before);
            params = _.omit(params, "year");
        }
        params = rename_key(params, "school_id", "incidents.school_id");
        params = rename_key(params, "campus", "campuses.name");
        params = rename_key(params, "on_campus", "on_campus?");

        connection.query( db.build_where_all(
            "SELECT SUM(`incidents`.`count_forcible`) as forcible, SUM(`incidents`.`count_nonforcible`) as nonforcible FROM `incidents`"+
            " LEFT JOIN `campuses` ON `incidents`.`campus_id` = `campuses`.`id` WHERE ? " + sql_append, params), function(err, results){
            console.log(err, results);
        });
    });
}

function rename_key(object, oldkey, newkey){
    if(object[oldkey] !== null && object[oldkey] !== undefined){
        object[newkey] = object[oldkey];
        return _.omit(object, oldkey);
    }else{
        return object;
    }
}

count_incidents({school_id: 1, });
count_incidents({campus: "main campus" });
count_incidents({year: 2055 });
// count_incidents({year: {before: 2009} });
// count_incidents({ jib: "errish" }); //TODO
count_incidents({school_id: 1, on_campus: true });