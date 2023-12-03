const mongoose = require("mongoose")
require('dotenv').config()
const connection = mongoose.connect(`${process.env.MONGOOSE_URL}`);
if(connection){
    console.log("connected");
}

module.exports ={connection}