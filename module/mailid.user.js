const mongoose=require("mongoose")

let schema=mongoose.Schema({
    mailid:{type:String},
    label:{type:String}
})

let mailschema=mongoose.model("mail",schema)

module.exports={mailschema}