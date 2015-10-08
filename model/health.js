var mongoose = require('mongoose')
var Schema = mongoose.Schema
// define the schema for our user model
var healthSchema = mongoose.Schema({
        team         : String,
        blood        : { type: Number, min: 0, max: 1000},
        created_at   : { type: Date, default: Date.now },
        updated_at   : { type: Date, default: Date.now },
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Health', healthSchema);
