const express=require("express")
const mailRouter=express.Router()
let {mailschema}=require("../module/mailid.user")


mailRouter.get("/:id",async(req,res)=>{
    let {id}=req.params
    try{
        let data=await mailschema.findOne({mailid:id})
        console.log(data)
        if(data){
            res.send(true)
        }
        else{
            res.send(false)
        }

    }
    catch(err){
        res.send(err)
    }
})

mailRouter.get("/",async(req,res)=>{
 
    try{
        let data=await mailschema.find()
       res.send(data)

    }
    catch(err){
        console.log(err)
        res.send(err)
    }
})

mailRouter.post("/add",async(req,res)=>{
    try{
        let data=new mailschema(req.body)
        await data.save()
        res.send(data)
    }
    catch(err){
        console.log(err)
        res.send(err)
    }
})


module.exports={mailRouter}