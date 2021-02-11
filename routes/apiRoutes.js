require("dotenv").config();
var db = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { check, validationResult } = require("express-validator");
const user = require("../models/user");
var passport = require("../config/passport");
const jwt = require("../services/jwt");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var fs = require("fs");
var multer  = require('multer')
var upload = multer({ dest: './public/assets/dist/img' })

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
        res.send({ message: "Error de servidor", alert: "Error" });
      }
      if (!user) {
        res.send({ message: info.message, alert: "Error" });
      }
      req.logIn(user, function (err) {
        if (err) {
          res.send({
            message: "Error de servidor",
            alert: "Error",
          });
        }
        res.send({
          message: "Usuario correcto",
          alert: "Success",
          accessToken: jwt.createAccessToken(user),
          refreshToken: jwt.createRefreshToken(user),
        });
      });
    })(req, res, next);
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
        let errores = errors.array();
        return res.send({
          message: errores[0].msg,
          alert: "Error",
        });
      }

      const { email, password, role } = req.body;

      db.User.create({
        email: email.toLowerCase(),
        password: password,
        role: role,
      })
        .then((data) => {
          if (!data) {
            res.send({
              message: "Error al crear el usuario",
              alert: "Error",
            });
          } else {
            res.send({
              message: "Usuario dado de alta",
              alert: "Success",
            });
          }
        })
        .catch((err) => {
          //console.log(err)
          res.send({
            message: "El usuario ya existe",
            alert: "Error",
          });
        });
    }
  );

  //Get User
  app.get("/users-active", isAuthenticated, (req, res) => {
    const query = req.query;
    //console.log(req.query)
    //console.log(req.query.active)
    //console.log(typeof(query.active))
    db.User.findAll({
      where: {
        active: query.active,
      },
      attributes: ["id", "email", "role", "active"],
    })
      .then((users) => {
        if (users.length == 0) {
          res.send({ message: "No se han encontrado ningun usuario" });
        } else {
          res.send({ users });
        }
      })
      .catch((err) => {
        res.send(err);
      });
  });

  //Activate User
  app.put("/activate-user/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { email, active, role, password } = req.body;
    db.User.update(
      {
        email: email,
        active: active,
        role: role,
        password: password,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((userStore) => {
        console.log(userStore);
        if (userStore[0] === 0) {
          res.send({
            message: "Usuario no encontrado",
            alert: "Error",
          });
        } else {
          if (active === true) {
            res.send({
              message: "Usuario actualizado correctamente",
              alert: "Success",
            });
          } else {
            res.send({
              message: "Usuario actualizado correctamente",
              alert: "Success",
            });
          }
        }
      })
      .catch((err) => {
        res.send({ message: "Error del servidor" });
      });
  });

  //Get User Info
  app.get("/get-user/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.User.findOne({
      where: {
        id: id,
      },
      attributes: ["id", "email", "role", "active"],
    }).then((userStore) => {
      if (!userStore) {
        res.send({
          message: "Usuario no encontrado",
          alert: "Error",
        });
      } else {
        res.send({
          message: "Usuario correcto",
          alert: "Success",
          user: userStore,
        });
      }
    });
  });

  //Borrar Usuario
  app.delete("/delete-user/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.User.destroy({
      where: {
        id: id,
      },
    })
      .then((userDeleted) => {
        console.log(userDeleted);
        if (!userDeleted) {
          res.send({
            message: "Usuario no encontrado",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Usuario eliminado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", err: err });
      });
  });

  app.get("/post", (req, res) => {
    db.Post.findAll({
      order: [["createdAt", "ASC"]],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Add Post
  app.post("/add-post", isAuthenticated, (req, res) => {
    const { title, url, description } = req.body;
    db.Blog.create({
      title: title,
      url: url,
      description: description,
    })
      .then((postStored) => {
        if (!postStored) {
          res.send({
            message: "No se ha podido crear el post",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Post Creado correctamente",
            alert: "Success",
            post: postStored,
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error" });
      });
  });

  //Get posts
  app.get("/get-posts", (req, res) => {
    const { page, limit } = req.query;
    db.Blog.findAndCountAll({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "ASC"]],
    })
      .then((postStored) => {
        if (!postStored) {
          res.send({
            message: "No se ha encontrado ningun post",
            alert: "Error",
          });
        } else {
          res.send({
            page: page,
            limit: limit,
            total: postStored.count,
            data: postStored.rows,
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
        });
      });
  });

  //Get All post

  app.get("/get-all-posts", (req, res) => {
    db.Blog.findAndCountAll({
      order: [["createdAt", "ASC"]],
    })
      .then((postStored) => {
        if (!postStored) {
          res.send({
            message: "No se ha encontrado ningun post",
            alert: "Error",
          });
        } else {
          res.send({
            total: postStored.count,
            data: postStored.rows,
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
          error: err,
        });
      });
  });

  //Update Posts
  app.put("/update-post/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { title, url, description } = req.body;
    db.Blog.update(
      {
        title: title,
        url: url,
        description: description,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((updatePost) => {
        if (updatePost[0] === 0) {
          res.send({
            message: "No se ha encontrado ningun post",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Post actualizado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error del servidor", alert: "Error" });
      });
  });

  //Delete Post
  app.delete("/delete-post/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.Blog.destroy({
      where: {
        id: id,
      },
    })
      .then((postDeleted) => {
        //console.log(userDeleted);
        if (!postDeleted) {
          res.send({
            message: "Post no encontrado",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Post eliminado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", err: err });
      });
  });

  //Get Specific Post by url
  app.get("/get-post/:url", (req, res) => {
    const { url } = req.params;
    db.Blog.findOne({
      where: {
        url: url,
      },
    })
      .then((postStored) => {
        if (!postStored) {
          res.send({
            message: "No se ha encontrado ningun post",
            alert: "Error",
          });
        } else {
          res.send({
            post: postStored,
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
        });
      });
  });

  //Get Specific Post by id
  app.get("/get-post-id/:id", (req, res) => {
    const { id } = req.params;
    db.Blog.findOne({
      where: {
        id: id,
      },
    })
      .then((postStored) => {
        if (!postStored) {
          res.send({
            message: "No se ha encontrado ningun post",
            alert: "Error",
          });
        } else {
          res.send({
            post: postStored,
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
        });
      });
  });

  //Create metatags
  app.post("/add-metatags", isAuthenticated, (req, res) => {
    db.Metatag.create({
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
      BlogId: req.body.BlogId,
    })
      .then((tagStored) => {
        if (!tagStored) {
          res.send({
            message: "No se ha podido crear el post",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Post Creado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error" });
      });
  });

  //Get Metatags by id
  app.get("/get-metatags/:id", (req, res) => {
    const { id } = req.params;
    db.Metatag.findOne({
      where: {
        BlogId: id,
      },
    })
      .then((tagStored) => {
        if (!tagStored) {
          res.send({
            message: "No se ha encontrado ningun metatag",
            alert: "Error",
          });
        } else {
          res.send({
            tag: tagStored,
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
          error: err,
        });
      });
  });

  //Upload Image
  app.post("/fileupload", upload.single("avatar"),function (req, res,next) {
    //console.log(req.file)
    let originalName=req.file.originalname;
    let newName=req.file.filename;
    let path=req.file.destination;
    let tempPath=`${path}/${newName}`;
    let targetPath=`${path}/${originalName}`
    fs.rename(tempPath,targetPath,function(err){
      if(err) { 
        res.send("Error found to upload file "+err);
        var msg = "Error found to upload file "+err;
        var type="error"; 
     } else {
        //res.send("<b>File uploaded to "+targetPath+" ("+req.files.uploadfile.size +" bytes)</b>");
        var fileSize = req.file.size/1024;
        var msg = "File uploaded to "+targetPath+" ("+(fileSize.toFixed(2)) +" kb)";
        var type="success";
        res.send(msg);
     }
    })
    
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
