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

    //Test for associates
    //* Route for getting all uploaded documents
  app.get("/pruebaapi", (req, res) => {
    db.Post.findOne({
      
      include: [db.Tag],

    })
      .then(data => {
        res.json(data)
      })
      .catch(function (err) {
        console.log(err)
        res.json(err)
      })

  })

  //Upload New Posts
  app.post("/data/upload",(req, res)=>{
    db.Post.create({
      tema: req.body.tema,
      titulo: req.body.titulo,
      url: req.body.url,
      url_id: req.body.url_id,
      imagen: req.body.imagen,
      imagen_alt:req.body.imagen_alt,
      autor: req.body.autor,
      post:req.body.post,
      imagen_post:req.body.imagen_post,
      imagen_post_alt:req.body.imagen_post_alt,
    }).then((data)=>{
      res.json(data)
    }).catch((err)=>{
      console.log(err)
    })
   
  })

    //Upload New Posts
    app.post("/data/metatags",(req, res)=>{
      db.Tag.create({
        title:req.body.title,
        description:req.body.description,
        keywords: req.body.keywords,
        cardType: req.body.cardType,
        site:req.body.site,
        creator:req.body.creator,
        url:req.body.url,
        twitterTitle:req.body.twitterTitle,
        twitterDescription:req.body.twitterDescription,
        image:req.body.image,
        PostId:req.body.PostId,
      }).then((data)=>{
        res.json(data)
      }).catch((err)=>{
        console.log(err)
      })
     
    })
}