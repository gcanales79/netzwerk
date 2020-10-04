require('dotenv').config()
var db = require("../models");

module.exports = function (app) {
    app.get("/post",(req,res)=>{
        db.Post.findAll({
            order:[[
                "createdAt","DESC"
            ]]
        }).then((data)=>{
            res.json(data)
        }).catch((err)=>{
            console.log(err)
        })
    })
}