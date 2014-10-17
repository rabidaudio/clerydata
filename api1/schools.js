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
    type: ["public", "4-year"],
    student_population: {
        male: 13426,
        female: 5316,
        ratio: 0.283641020168605,
        total: 18742
    },
    campuses: ["Main Campus", "Savannah Campus"]
}
*/
var Fuse = require('fuse.js');
var _ = require('underscore');

var db = require('./db');

var d = console.log.bind(console); //TODO remove

var fuse;

//Go ahead and build the search function for the fuzzy name search
db.getConnection(function(connection){

    //get all names and nicknames
    connection.query("SELECT id, name, nicknames FROM schools", function(err, results) {
        if(err){
            console.error(err.message);
            //TODO build error handler
            connection.release();
            return;
        }
        d(results);

        var fuse = new Fuse(a, {keys: ["name", "nicknames"], threshold: 0.4, id: "ident", includeScore: true})

        connection.release();
        
    });
})

/**
    Return an array of school id's with similar names
*/
function fuzzy_search_name(name){
    return _.flatten(fuse.search(name));
}



module.exports = {
    /**

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

        Search for a school in the database. params can have any one of these terms:
        {
            name: "Georgia Tech",               //fuzzy search
            type: ["public", "4-year"],         //valid terms: 4-year, 2-year, for-profit, nonprofit, public, private
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
    search: function(params, callback){
        query = {};
        query.name = wildcard(params.name);
        query.city = (params.location ? wildcard(params.location.city) : "%");
        query.state = (params.location ? wildcard(params.location.state) : "%");

        var sql = "SELECT * FROM schools WHERE ( name LIKE ? OR ";

        if(params.type instanceof Array){ //false if undefined
            params.type.forEach(function(e,i,a){
                sql += "AND type LIKE %"+mysql.escape(e)+"%";
            });
        }
        
        //run query
        db.getConnection(function(connection){
            connection.release();
        });

        if(callback instanceof Function) callback(params);
    },

    get: function(id){
        //TODO return that school
    }
};


function build(database_row){
    //TODO convert database object to proper format
}

    
function wildcard(value){
    return (value === undefined || value === null ? "%" : value );
}