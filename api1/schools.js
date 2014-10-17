/* EXAMPLE SCHOOL OBJECT - will increase data with access to WHED database: http://www.whed.net/results_institutions.php
{
    id: 0,
    name: "Georgia Institute of Technology",
    nicknames: ["Georgia Tech", "GT"],
    location: {
        address: "225 North Ave",
        city: "Atlanta",
        state: "GA",
        zip: 30332
    },
    type: {
        private: false,
        for_profit: false,
        program_length: "4-year or above"
    },
    student_population: {
        male: 13426,
        female: 5316,
        ratio: 0.283641020168605,
        total: 18742
    },
    campuses: ["Main Campus", "Savannah Campus"]
}
*/
var events = require("events");
var Fuse   = require('fuse.js');
var _      = require('underscore');
var after  = require('after');

var db = require('./db');

var fuse = null;

//Go ahead and build the search function for the fuzzy name search
db.getConnection(function(connection){

    //get all names and nicknames
    connection.query("SELECT id, name, (SELECT GROUP_CONCAT(name) FROM  `nicknames` WHERE  `nicknames`.school_id =  `schools`.id) AS  'nicknames' FROM schools", function(error, results) {
        if(error){
            console.log(error);
            return;
        }
        // if(error){
        //     //TODO build error handler
        //     connection.release();
        //     return;
        // }

        fuse = new Fuse(results, {
            keys: ["name", "nicknames"],
            threshold: 0.4,
            id: "id",
            getFn: function(item, key){ //this is neccessary because for some reason the default getFn won't return integer ids
                return item[key];
            }
        });

        connection.release();
        console.log("Fuzzy name search ready");
        //emit event
        Schools.emit("ready");
    });
});

/**
    Return an array of school id's with similar names
*/
function fuzzy_search_name(name, callback){
    console.log("looking for "+name);
    if(fuse === null){
        setTimeout(function(){ fuzzy_search_name(name, callback); }, 500);//delay
    }else{
        console.log(fuse);
        if(callback instanceof Function) callback(_.flatten(fuse.search(name)));
    }
}


/* All possible types:
        Administrative Unit Only
        New Institution
        Private for-profit, 2-year
        Private for-profit, 4-year or above
        Private for-profit, less-than 2-year
        Private nonprofit, 2-year
        Private nonprofit, 4-year or above
        Private nonprofit, less-than 2-year
        Public, 2-year
        Public, 4-year or above
        Public, less-than 2-year
*/

function School(result){
        this = {
            id        : row.id,
            name      : row.name,
            nicknames : (row.nicknames ? row.nicknames.split(",") : []),
            campuses  : (row.campuses ? row.campuses.split(",") : []),
            location  : {
                address : row.address,
                city    : row.city,
                state   : row.state,
                zip     : row.zip
            },
            type : {
                "private"      : !!row["private?"],
                "for_profit"   : !!row["for_profit?"],
                program_length : row.program_length
            },
            student_population : {
                male   : row.male_pop,
                female : row.female_pop,
                ratio  : row.ratio,
                total  : row.total_pop
            }
        };
}



    /**
        Search for a school in the database. params can have any one of these terms:
        {
            name: "Georgia Tech",               //fuzzy search
            type: "public, 4-year",         //valid terms: 4-year, 2-year, for-profit, nonprofit, public, private
            location: {
                city: "Atlanta",
                state: "GA",
                zip: 30332
            },
            population: {
                male: {
                    more_than: 10000,
                    less_than: 50000
                },
                female: {
                    more_than: 5000,
                    less_than: 10000
                },
                ratio: {
                    more_than: .2,
                    less_than: .5
                },
                total:{
                    more_than: 10000,
                    less_than: 20000
                }
            }
        }
    */

var Schools = new events.EventEmitter();


Schools.search = function(params, callback){

    var sql = "SELECT *, (male_pop + female_pop) as total_pop, (female_pop/(male_pop + female_pop)) as ratio,";
    sql += " (SELECT GROUP_CONCAT(name) FROM  `campuses`  WHERE  `campuses`.school_id  =  `schools`.id) AS  'campuses',";
    sql += " (SELECT GROUP_CONCAT(name) FROM  `nicknames` WHERE  `nicknames`.school_id =  `schools`.id) AS  'nicknames'";
    sql += " FROM schools WHERE 1";

    if(params.location){
        _.each(params.location, function(value, key, list){
            sql += " AND "+db.escape(key)+(value instanceof String ? " LIKE " : " = ")+db.escape(value);
        });
    }

    var continue_building = after(1, function(){ //maybe not the best way. if only there were a way to block on require until fuze was ready...

        if(params.type){
            e = params.type.toLowerCase();
            if(e.match(/public/))        sql += " AND `private?` = false";
            if(e.match(/private/))       sql += " AND `private?` = true";
            if(e.match(/non-?profit/))   sql += " AND `for_profit?` = false";
            if(e.match(/for-?profit/))   sql += " AND `for_profit?` = true";
            if(e.match(/(two|2).year/))  sql += " AND program_length LIKE \"%2-year%\""; //TODO better way
            if(e.match(/(four|4).year/)) sql += " AND program_length LIKE \"%4-year%\"";
        }

        if(params.population){
            if(params.population.male){
                if(params.population.male.more_than)    sql += " AND male_pop > "   + db.escape(params.population.male.more_than);
                if(params.population.male.less_than)    sql += " AND male_pop < "   + db.escape(params.population.male.less_than);
            }
            if(params.population.female){
                if(params.population.female.more_than)  sql += " AND female_pop > " + db.escape(params.population.female.more_than);
                if(params.population.female.less_than)  sql += " AND female_pop < " + db.escape(params.population.female.less_than);
            }
            if(params.population.total){
                if(params.population.total.more_than)   sql += " AND (male_pop + female_pop) > "  + db.escape(params.population.total.more_than);
                if(params.population.total.less_than)   sql += " AND (male_pop + female_pop) < "  + db.escape(params.population.total.less_than);
            }
            if(params.population.ratio){
                if(params.population.ratio.more_than)   sql += " AND (female_pop/(male_pop + female_pop)) > " + db.escape(params.population.ratio.more_than);
                if(params.population.ratio.less_than)   sql += " AND (female_pop/(male_pop + female_pop)) < " + db.escape(params.population.ratio.less_than);
            }
        }
        
        //run query
        db.getConnection(function(connection){
            console.log(sql);
            connection.query(sql, function(error, results){
                if(error){
                    console.log(error);
                    return;
                }
                //handle error
                connection.release();
                if(callback instanceof Function) callback(build_a(results));
            });
        });
    });

    //this is the stuff to do first (name search)
    if(params.name){
        fuzzy_search_name(params.name, function(possible_schools){
            console.log("possible:", possible_schools);
            if(possible_schools.length === 0){
                console.log("no matches");
                if(callback instanceof Function) callback([]); //no valid schools
            }else{
                sql += " AND id IN ("+possible_schools.join()+")";
                continue_building();
            }
        });
    }else{
        continue_building();
    }
};

Schools.get = function(id, callback){
    //TODO return that school
    db.getConnection(function(connection){
        connection.query("SELECT * FROM schools WHERE id = ?", [id], function(error, result){
            //hanlde error
            connection.release();
            if(callback instanceof Function) callback(new School(result[0]));
        });
    });
};


// function build(row){
//     //make it less flat
//     //TODO maybe should be object with constructor?
//     return {
//         id        : row.id,
//         name      : row.name,
//         nicknames : (row.nicknames ? row.nicknames.split(",") : []),
//         campuses  : (row.campuses ? row.campuses.split(",") : []),
//         location  : {
//             address : row.address,
//             city    : row.city,
//             state   : row.state,
//             zip     : row.zip
//         },
//         type : {
//             "private"      : !!row["private?"],
//             "for_profit"   : !!row["for_profit?"],
//             program_length : row.program_length
//         },
//         student_population : {
//             male   : row.male_pop,
//             female : row.female_pop,
//             ratio  : row.ratio,
//             total  : row.total_pop
//         },
//     };
// }

function build_a(rows){
    var array = [];
    rows.forEach(function(e,i,a){ array.push(new School(e)); }); //probably not very efficient....
    return array;
}


Schools.School = School;
module.exports = Schools;
    
// function wildcard(value){
//     return (value === undefined || value === null ? "%" : value );
// }