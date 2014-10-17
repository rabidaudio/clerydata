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
var count = 0;
var log = function(stuff){
    console.log(++count, stuff);
};

Schools.on('ready', function(){
    Schools.search({population: {total: {more_than: 9000}}}, log);
    Schools.search({population: {total: {more_than: 9000, less_than: 10000}, women:{more_than: 1}, men:{less_than: 10}}},log);
    Schools.search({location:{city: "nowhere", state:"TN", zip: 12345}},log);
    Schools.search({name: "Dummy School for Dummies"}, log);
    Schools.search({name: "Dummy"}, log);
    Schools.search({name: "DSD"}, log);
    Schools.search({name: "nonsense"}, log);
    Schools.search({type: "public, 4-year"});
    Schools.search({location: {barf: "bag"}}, log);

    Schools.get(1, log);
    Schools.get(99, log);

    Schools.search(null, log);
});