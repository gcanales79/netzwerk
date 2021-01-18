require("dotenv").config();
var db = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { check, validationResult } = require("express-validator");
const user = require("../models/user");
var passport = require("../config/passport");
const jwt = require("../services/jwt");
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function (app) {
  //JWT
  function willExpireToken(token) {
    const { exp } = jwt.decodeToken(token);
    const currentDate = moment().unix();

    if (currentDate > exp) {
      return true;
    }

    return false;
  }

  app.post("/refresh-access-token", (req, res) => {
    const { refreshToken } = req.body;
    const isTokenExpired = willExpireToken(refreshToken);
    console.log(isTokenExpired);
    if (isTokenExpired) {
      res.status(404).send({ message: "El refreshToken ha expirado" });
    } else {
      const { id } = jwt.decodeToken(refreshToken);

      db.User.findOne({
        where: {
          id: id,
        },
      })
        .then((data) => {
          if (!data) {
            res.status(404).send({ message: "Usuario no encontrado" });
          } else {
            res.status(200).send({
              accessToken: jwt.createAccessToken(data),
              refreshToken: refreshToken,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: "Error del servidor" });
        });
    }
  });

  //Login
  app.get("/signin", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        res.send({ message: "Error de servidor", alert: "alert alert-danger" });
      }
      if (!user) {
        res.send({ message: info.message, alert: "alert alert-danger" });
      }
      req.logIn(user, function (err) {
        if (err) {
          res.send({
            message: "Error de servidor",
            alert: "alert alert-danger",
          });
        }
        res.send({
          message: "Usuario correcto",
          alert: "alert alert-success",
          accessToken: jwt.createAccessToken(user),
          refreshToken: jwt.createRefreshToken(user),
        })
        
        
      });
    })(req, res, next)
    
  });

  //Logout
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  //User Signup
  app.post(
    "/signup",
    check("email").isEmail().withMessage("No es un correo valido"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("La contraseña debe tener 5 caracteres  "),
    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let errores=errors.array()
        return res.send({ message: errores[0].msg, alert: "alert alert-danger" });
      }

      const { email, password, role } = req.body;

      db.User.create({
        email: email.toLowerCase(),
        password: password,
        role:role,
      })
        .then((data) => {
          if (!data) {
            res.send({ message: "Error al crear el usuario",alert: "alert alert-danger" });
          } else {
            res.send({ message:"Usuario dado de alta",alert:"alert alert-success"});
          }
        })
        .catch((err) => {
          //console.log(err)
          res.send({ message: "El usuario ya existe",alert: "alert alert-danger" });
        });
    }
  );

  //Get User
  app.get("/users-active",isAuthenticated,(req,res)=>{
    const query=req.query
    //console.log(req.query)
    //console.log(req.query.active)
    //console.log(typeof(query.active))
    db.User.findAll({
      where:{
        active:query.active
      }, 
      attributes:["id","email","role","active"]
    }).then((users)=>{
      if(users.length==0){
        res.send({message:"No se han encontrado ningun usuario"})
      }else{
        res.send({users})
      }
    }).catch((err)=>{
      res.send(err)
    })
  })

  //Activate User
  app.put("/activate-user/:id",isAuthenticated,(req,res)=>{
    const {id}=req.params
    const {email,active,role,password}=req.body
    db.User.update({
      email:email,
      active:active,
      role:role,
      password:password
      },{
        where:{
          id:id
        }
      }).then((userStore)=>{
        console.log(userStore)
      if(userStore[0]===0){
        res.send({message:"Usuario no encontrado",alert: "alert alert-danger",})
      }else{
        if(active===true){
          res.send({message:"Usuario actualizado correctamente",alert: "alert alert-success"})
        }
        else{
          res.send({message:"Usuario actualizado correctamente",alert: "alert alert-success"})
        }

      }
    }).catch((err)=>{
      res.send({message:"Error del servidor"})
    })
  })

  //Get User Info
  app.get("/get-user/:id", isAuthenticated, (req,res)=>{
    const {id}=req.params
    db.User.findOne({
      where:{
        id:id
      },
      attributes:["id","email","role","active"]
    }).then((userStore)=>{
      if(!userStore){
        res.send({message:"Usuario no encontrado",alert: "alert alert-danger",})
      }else{
          res.send({message:"Usuario correcto",alert: "alert alert-success",user:userStore})    
        

      }

    })
  })

  //Borrar Usuario
  app.delete("/delete-user/:id",isAuthenticated,(req,res)=>{
    const {id}=req.params;
    db.User.destroy({
      where:{
        id:id
      }
    }).then((userDeleted)=>{
      console.log(userDeleted)
      if(!userDeleted){
        res.send({message:"Usuario no encontrado",alert: "alert alert-danger",})
      }else{
        res.send({message:"Usuario eliminado correctamente",alert:"alert alert-success"})
      }
    }).catch((err)=>{
      res.send({message:"Error de servidor",err:err})
    })
  })

  app.get("/post", (req, res) => {
    db.Post.findAll({
      order: [["createdAt", "DESC"]],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Test for associates
  //* Route for getting all uploaded documents
  app.get("/pruebaapi", (req, res) => {
    db.Post.findOne({
      include: [db.Tag],
    })
      .then((data) => {
        res.json(data);
      })
      .catch(function (err) {
        console.log(err);
        res.json(err);
      });
  });

  //Upload New Posts
  app.post("/data/upload", (req, res) => {
    db.Post.create({
      tema: req.body.tema,
      titulo: req.body.titulo,
      url: req.body.url,
      url_id: req.body.url_id,
      imagen: req.body.imagen,
      imagen_alt: req.body.imagen_alt,
      autor: req.body.autor,
      post: req.body.post,
      imagen_post: req.body.imagen_post,
      imagen_post_alt: req.body.imagen_post_alt,
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Upload New Posts
  app.post("/data/metatags", (req, res) => {
    db.Tag.create({
      title: req.body.title,
      description: req.body.description,
      keywords: req.body.keywords,
      cardType: req.body.cardType,
      site: req.body.site,
      creator: req.body.creator,
      url: req.body.url,
      twitterTitle: req.body.twitterTitle,
      twitterDescription: req.body.twitterDescription,
      image: req.body.image,
      PostId: req.body.PostId,
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
