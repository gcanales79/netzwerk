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
var multer = require("multer");
var upload = multer({ dest: "./public/assets/dist/img" });
const axios = require("axios").default;
const crypto = require("crypto");
var async = require("async");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");
var moment = require("moment-timezone");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const EasyPost = require("@easypost/api");
const api = new EasyPost(process.env.EASY_POST_API_KEY);

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
  app.post("/signin", function (req, res, next) {
    //console.log(req.query)
    const { token } = req.body;
    //console.log(token)
    const secret_key = process.env.SECRET_KEY_RECAPTCHA;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
    //console.log(token)
    //console.log(secret_key)
    axios
      .post(url, {})
      .then(function (response) {
        console.log(response.data);
        if (response.data.success) {
          passport.authenticate("local", function (err, user, info) {
            if (err) {
              res.send({ message: "Error de servidor", alert: "Error" });
            }
            if (!user) {
              res.send({ message: info.message, alert: "Error" });
            }

            req.logIn(user, function (err) {
              if (err) {
                console.log(err);
              } else {
                //console.log(user)
                res.send({
                  message: "Usuario correcto",
                  alert: "Success",
                  accessToken: jwt.createAccessToken(user),
                  refreshToken: jwt.createRefreshToken(user),
                  redirect: "/admin",
                });
              }
            });
          })(req, res, next);
        } else {
          res.send({ message: "No eres humano", alert: "Error" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  //Logout
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  //Forgot
  app.post("/forgot", function (req, res) {
    const { email } = req.body;
    async.waterfall(
      [
        function (done) {
          crypto.randomBytes(20, function (err, buf) {
            var token = buf.toString("hex");
            //console.log("El token es " + token)
            done(err, token);
          });
        },
        function (token, done) {
          db.User.findOne({
            where: {
              email: email,
            },
          }).then((data) => {
            if (!data) {
              res.send({ message: "Usuario no dado de alta", alert: "Error" });
            } else {
              db.User.update(
                {
                  resetPasswordToken: token,
                  resetPasswordExpire: Date.now() + 3600000, //+1 hora
                },
                {
                  where: {
                    email: email,
                  },
                }
              )
                .then((user, err) => {
                  /*res.send({
                    message: `Correo enviado a ${data.email}`,
                    alert: "Success",
                  });*/
                  done(err, token, data);
                  //done(err, "done");
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          });
        },
        function (token, data, done) {
          const msg = {
            to: data.email, // Change to your recipient
            from: "netzwerk.mty@gmail.com", // Change to your verified sender
            //subject: 'Sending with SendGrid is Fun',
            //text: 'and easy to do anywhere, even with Node.js',
            //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            template_id: "d-7bb2f1084d154cecb824ff2ef1632ffe",
            dynamic_template_data: {
              user: data.email,
              link: `http://${req.headers.host}/recover-password/${token}`,
            },
          };
          sgMail
            .send(msg)
            .then((email, err) => {
              console.log("Email sent");
              done(err, "done");
            })
            .catch((err) => {
              console.log(err);
            });
        },
      ],
      function (err, result) {
        if (err) {
          res.send({
            message: "Error al tratar de restablecer la contraseña",
            alert: "Error",
          });
        }
        if (result === "done") {
          res.send({
            message: "Email enviado para restablecer contraseña",
            alert: "Success",
          });
        }
      }
    );
  });

  //Change password
  app.post("/reset/:token", (req, res) => {
    const { token } = req.params;
    const { password, confirm } = req.body;
    async.waterfall(
      [
        function (done) {
          db.User.findOne({
            where: {
              resetPasswordToken: token,
              resetPasswordExpire: {
                [Op.gt]: Date.now(),
              },
            },
          })
            .then((user) => {
              //console.log(user);
              if (!user) {
                /*req.flash(
              "error",
              "El token para restablecer la contraseña ha expirado"
            );*/
                res.send({
                  message:
                    "El token para restablecer la contraseña ha expirado",
                  alert: "Error",
                });
              }
              if (password.length > 4) {
                if (password === confirm) {
                  db.User.update(
                    {
                      resetPasswordToken: null,
                      resetPasswordExpire: null,
                      password: password,
                    },
                    {
                      where: {
                        resetPasswordToken: token,
                      },
                      individualHooks: true,
                    }
                  ).then((data, err) => {
                    done(err, user);
                  });
                } else {
                  /*req.flash("error","Las contraseñas no coinciden")*/
                  res.send({
                    message: "Las contraseñas no coinciden",
                    alert: "Error",
                  });
                }
              } else {
                /*req.flash("error","La contraseña debe tener minimo 5 caracteres")*/
                res.send({
                  message: "La contraseña debe tener mínimo 5 caracteres",
                  alert: "Error",
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        },
        function (user, done) {
          const msg = {
            to: user.email, // Change to your recipient
            from: "netzwerk.mty@gmail.com", // Change to your verified sender
            //subject: 'Sending with SendGrid is Fun',
            //text: 'and easy to do anywhere, even with Node.js',
            //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            template_id: "d-6bd06e5664bb44e08e7862e9dfe50ba0",
            dynamic_template_data: {
              user: user.email,
            },
          };
          sgMail
            .send(msg)
            .then((email, err) => {
              console.log("Email sent");
              done(err, "done");
            })
            .catch((err) => {
              console.log(err);
            });
        },
      ],
      function (err, result) {
        if (err) {
          res.send({ message: "Error de servidor", alert: "Error" });
        }
        if (result === "done") {
          res.send({
            message: "Contraseña restablecida correctamente",
            alert: "Success",
          });
        }
      }
    );
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
      attributes: [
        "id",
        "email",
        "role",
        "active",
        "twofa",
        "permanent_secret",
      ],
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
    const { email, active, role, password, twofa } = req.body;
    db.User.update(
      {
        email: email,
        active: active,
        role: role,
        password: password,
        twofa: twofa,
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
      attributes: [
        "id",
        "email",
        "role",
        "active",
        "twofa",
        "permanent_secret",
      ],
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

  //Activate FA
  app.get("/activate-fa/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.User.findOne({
      where: {
        id: id,
      },
      attributes: [
        "id",
        "email",
        "role",
        "active",
        "twofa",
        "permanent_secret",
      ],
    }).then((userStore) => {
      if (userStore.twofa) {
        res.send({
          action: "Disable",
        });
      } else {
        var secret = speakeasy.generateSecret({
          name: "Netzwerk",
        });
        qrcode.toDataURL(secret.otpauth_url, function (err, data) {
          if (err) {
            console.log(err);
          } else {
            //console.log(data);
            //console.log(secret)
            res.send({
              action: "Enable",
              qrcode: data,
              ascii: secret.ascii,
            });
          }
        });
      }
    });
  });

  //Confirm FA
  app.post("/fa-validate/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { ascii, code } = req.body;
    let verified = speakeasy.totp.verify({
      secret: ascii,
      encoding: "ascii",
      token: code,
    });
    if (verified) {
      db.User.update(
        {
          permanent_secret: ascii,
          twofa: true,
        },
        {
          where: {
            id: id,
          },
        }
      )
        .then((userStore) => {
          //console.log(userStore);
          if (userStore[0] === 0) {
            res.send({
              message: "Usuario no encontrado",
              alert: "Error",
            });
          } else {
            res.send({
              message: "Usuario actualizado correctamente",
              alert: "Success",
            });
          }
        })
        .catch((err) => {
          res.send({ message: "Error del servidor" });
        });
    } else {
      res.send({
        message: "Codigo de Verificacion Incorrecto",
        alert: "Error",
      });
    }
  });

  //Validate FA
  app.post("/fa-validation/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { code } = req.body;
    db.User.findOne({
      where: {
        id: id,
      },
    }).then((userStored) => {
      const { permanent_secret } = userStored;
      let verified = speakeasy.totp.verify({
        secret: permanent_secret,
        encoding: "ascii",
        token: code,
      });
      //console.log(verified);
      if (verified) {
        req.user.twofa_valid = true;
        res.send({
          message: "Código correcto",
          alert: "Success",
          redirect: "/admin",
        });
      } else {
        res.send({
          message: "Código Incorrecto",
          alert: "Error",
          redirect: "/admin",
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
    const { title, url, description, image, tema } = req.body;
    db.Blog.create({
      title: title,
      url: url,
      description: description,
      image: image,
      tema: tema,
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
        res.send({ message: "Error de servidor", alert: "Error", error: err });
      });
  });

  //Get posts
  app.get("/get-posts", (req, res) => {
    const { page, limit } = req.query;
    db.Blog.findAndCountAll({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
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
      order: [["createdAt", "DESC"]],
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

  //Get favorite post
  app.get("/get-fav-post", (req, res) => {
    db.Blog.findAll({
      where: {
        favorite: true,
      },
      limit: 5,
      order: [["createdAt", "ASC"]],
    })
      .then((postStored) => {
        if (!postStored) {
          res.send({
            message: "No se han encontrado ningun post",
            alert: "Error",
          });
        } else {
          res.send({
            post: postStored,
            alert: "Succes",
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

  //Update Posts
  app.put("/update-post/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const {
      title,
      url,
      description,
      image,
      image_alt,
      tema,
      active,
      favorite,
    } = req.body;
    db.Blog.update(
      {
        title: title,
        url: url,
        description: description,
        image: image,
        image_alt: image_alt,
        tema: tema,
        active: active,
        favorite: favorite,
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

  //Update Metatags
  app.put("/update-metatags/:id", (req, res) => {
    const { id } = req.params;
    db.Metatag.update(
      {
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
      },
      {
        where: {
          BlogId: id,
        },
      }
    )
      .then((updateTag) => {
        if (updateTag[0] === 0) {
          res.send({
            message: "No se ha encontrado ningun tag",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Tag actualizado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error del servidor", alert: "Error", error: err });
      });
  });

  //Upload Image
  app.post(
    "/fileupload",
    upload.single("imagenPost"),
    isAuthenticated,
    function (req, res, next) {
      //console.log(req.file)
      let originalName = req.file.originalname;
      let newName = req.file.filename;
      let path = req.file.destination;
      let tempPath = `${path}/${newName}`;
      let targetPath = `${path}/netzwerk-${originalName}`;
      let url = `/assets/dist/img/netzwerk-${originalName}`;
      let modifyUrl = url.replace(/\s+/g, "-").toLowerCase();
      let modifyPath = targetPath.replace(/\s+/g, "-").toLowerCase();
      let fileSplit = originalName.split(".");
      let fileExt = fileSplit[1];
      let modifyUrlSplit = modifyUrl.split(".");
      let webpFile = `${modifyUrlSplit[0]}.webp`;
      //console.log(req.file);
      console.log(webpFile);
      const { imagen_alt } = req.body;
      if (
        fileExt !== "png" &&
        fileExt !== "jpg" &&
        fileExt !== "JPG" &&
        fileExt !== "PNG" &&
        fileExt !== "JPEG" &&
        fileExt !== "jpeg"
      ) {
        res.send({
          message:
            "La extensión no es valida. Extensiones permtidas: .png y .jpg",
          alert: "Error",
        });
      } else {
        fs.rename(tempPath.replace(/\/\//g, "/"), modifyPath, function (err) {
          if (err) {
            res.send({
              message: "Error al subir el archivo, intentalo de nuevo",
              alert: "Error",
            });
            var msg = "Error found to upload file " + err;
            var type = "error";
          } else {
            //res.send("<b>File uploaded to "+targetPath+" ("+req.files.uploadfile.size +" bytes)</b>");
            var fileSize = req.file.size / 1024;
            var msg =
              "File uploaded to " +
              modifyPath +
              " (" +
              fileSize.toFixed(2) +
              " kb)";
            var type = "success";

            imagemin([`${modifyPath}`], {
              destination: "./public/assets/dist/img",
              plugins: [imageminWebp({ quality: 50 })],
            }).then(() => {
              console.log("Done!");
              db.Image.create({
                imagen_url: webpFile,
                imagen_alt: imagen_alt,
              })
                .then((data) => {
                  if (!data) {
                    res.send({
                      message: "El nombre del archivo ya esta dado de alta",
                      alert: "Error",
                    });
                  } else {
                    res.send({
                      message: "Imagen guardada correctamente",
                      alert: "Success",
                      data: modifyUrl,
                      image_alt: imagen_alt,
                    });
                  }
                })
                .catch((error) => {
                  /* fs.unlink(tempPath.replace(/\\/g, "/"),function(err) {
                    if(err) {
                     res.send("Error to delete file: "+err);
                     } else {
                      res.send({ message:error.errors[0].message , alert: "Error" });
                     }
                  })*/
                  if (error.errors[0].message == "imagen_url must be unique") {
                    res.send({
                      message: "Ya existe la imagen en la base de datos",
                      alert: "Error",
                    });
                  } else {
                    res.send({
                      message: error.errors[0].message,
                      alert: "Error",
                    });
                  }
                });
            });
          }
        });
      }
    }
  );

  //Get all images
  app.get("/get-images", (req, res) => {
    db.Image.findAll({
      order: [["createdAt", "ASC"]],
    })
      .then((imageStored) => {
        if (!imageStored) {
          res.send({
            message: "No se ha encontrado ninguna image",
            alert: "Error",
          });
        } else {
          res.send({
            data: imageStored,
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error" });
      });
  });

  //Delete Image by url
  app.get("/delete-image/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    //console.log(imagen_url)
    db.Image.findOne({
      where: {
        id: id,
      },
    })
      .then((imageData) => {
        //console.log(userDeleted);
        if (!imageData) {
          res.send({
            message: "Imagen no encontrada",
            alert: "Error",
          });
        } else {
          let targetPath = `./public${imageData.imagen_url}`;
          fs.unlink(targetPath, function (err) {
            if (err) {
              res.send({
                message: "No se pudo eliminar la imagen seleccionada",
                alert: "Error",
              });
            } else {
              db.Image.destroy({
                where: {
                  id: id,
                },
              })
                .then((imageDeleted) => {
                  if (!imageDeleted) {
                    res.send({
                      message: "No se pudo eliminar la imagen",
                      alert: "Error",
                    });
                  } else {
                    res.send({
                      message: "Imagen eliminada correctamente",
                      alert: "Success",
                    });
                  }
                })
                .catch((err) => {
                  res.send({ message: "Error de servidor", err: err });
                });
            }
          });
          /*res.send({
            message: "Imagen eliminada correctamente",
            data:imageDeleted,
            alert: "Success",
          });*/
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", err: err });
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

  //Get All Books
  app.get("/get-all-books", (req, res) => {
    db.Libro.findAndCountAll({
      order: [["createdAt", "ASC"]],
    })
      .then((libroStored) => {
        if (!libroStored) {
          res.send({
            message: "No se ha encontrado ningun libro",
            alert: "Error",
          });
        } else {
          res.send({
            total: libroStored.count,
            data: libroStored.rows,
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

  //Add Book
  app.post("/add-libro", isAuthenticated, (req, res) => {
    const { title, url, author, description, image, image_alt } = req.body;
    db.Libro.create({
      title: title,
      url: url,
      description: description,
      image: image,
      image_alt: image_alt,
      author: author,
    })
      .then((libroStored) => {
        if (!libroStored) {
          res.send({
            message: "No se ha podido crear el libro",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Libro Creado correctamente",
            alert: "Success",
            libro: libroStored,
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error", error: err });
      });
  });

  //Update Book
  app.put("/update-libro/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { title, url, author, description, image, image_alt, active } =
      req.body;
    db.Libro.update(
      {
        title: title,
        url: url,
        author: author,
        description: description,
        image: image,
        image_alt: image_alt,
        active: active,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((updateLibro) => {
        if (updateLibro[0] === 0) {
          res.send({
            message: "No se ha encontrado ningun libro",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Libro actualizado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error del servidor", alert: "Error", error: err });
      });
  });

  //Get Specific Book by id
  app.get("/get-libro-id/:id", (req, res) => {
    const { id } = req.params;
    db.Libro.findOne({
      where: {
        id: id,
      },
    })
      .then((libroStored) => {
        if (!libroStored) {
          res.send({
            message: "No se ha encontrado ningun libro",
            alert: "Error",
          });
        } else {
          res.send({
            libro: libroStored,
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

  //Upload Book Image
  app.post(
    "/bookupload",
    upload.single("imagenBook"),

    function (req, res, next) {
      //console.log(req.file)
      let originalName = req.file.originalname;
      let newName = req.file.filename;
      let path = req.file.destination;
      let tempPath = `${path}/${newName}`;
      let targetPath = `${path}/netzwerk-${originalName}`;
      let url = `/assets/dist/img/netzwerk-${originalName}`;
      let modifyUrl = url.replace(/\s+/g, "-").toLowerCase();
      let modifyPath = targetPath.replace(/\s+/g, "-").toLowerCase();
      let fileSplit = originalName.split(".");
      let fileExt = fileSplit[1];
      let modifyUrlSplit = modifyUrl.split(".");
      let webpFile = `${modifyUrlSplit[0]}.webp`;
      //console.log(req.file);
      console.log(webpFile);
      if (
        fileExt !== "png" &&
        fileExt !== "jpg" &&
        fileExt !== "JPG" &&
        fileExt !== "PNG" &&
        fileExt !== "JPEG" &&
        fileExt !== "jpeg"
      ) {
        res.send({
          message:
            "La extensión no es valida. Extensiones permtidas: .png y .jpg",
          alert: "Error",
        });
      } else {
        fs.rename(tempPath.replace(/\/\//g, "/"), modifyPath, function (err) {
          if (err) {
            res.send({
              message: "Error al subir el archivo, intentalo de nuevo",
              alert: "Error",
            });
            var msg = "Error found to upload file " + err;
            var type = "error";
          } else {
            //res.send("<b>File uploaded to "+targetPath+" ("+req.files.uploadfile.size +" bytes)</b>");
            var fileSize = req.file.size / 1024;
            var msg =
              "File uploaded to " +
              modifyPath +
              " (" +
              fileSize.toFixed(2) +
              " kb)";
            var type = "success";

            imagemin([`${modifyPath}`], {
              destination: "./public/assets/dist/img",
              plugins: [imageminWebp({ quality: 50 })],
            }).then(() => {
              console.log("Done!");
              db.Image.create({
                imagen_url: webpFile,
              })
                .then((data) => {
                  if (!data) {
                    res.send({
                      message: "El nombre del archivo ya esta dado de alta",
                      alert: "Error",
                    });
                  } else {
                    res.send({
                      message: "Imagen guardada correctamente",
                      alert: "Success",
                      data: modifyUrl,
                    });
                  }
                })
                .catch((error) => {
                  /* fs.unlink(tempPath.replace(/\\/g, "/"),function(err) {
                    if(err) {
                     res.send("Error to delete file: "+err);
                     } else {
                      res.send({ message:error.errors[0].message , alert: "Error" });
                     }
                  })*/
                  if (error.errors[0].message == "imagen_url must be unique") {
                    res.send({
                      message: "Ya existe la imagen en la base de datos",
                      alert: "Error",
                    });
                  } else {
                    res.send({
                      message: error.errors[0].message,
                      alert: "Error",
                    });
                  }
                });
            });
          }
        });
      }
    }
  );

  //Delete Libro
  app.delete("/delete-libro/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.Libro.destroy({
      where: {
        id: id,
      },
    })
      .then((libroDeleted) => {
        //console.log(userDeleted);
        if (!libroDeleted) {
          res.send({
            message: "Libro no encontrado",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Libro eliminado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error", err: err });
      });
  });

  //Add Tweet
  app.post("/add-tweet", isAuthenticated, (req, res) => {
    const { title, tweet, schedule_date } = req.body;
    let fecha = moment.tz(schedule_date, "Europe/Warsaw");
    //console.log(schedule_date);
    db.Tweet.create({
      title: title,
      tweet: tweet,
      schedule_date: fecha,
    })
      .then((tweetStored) => {
        if (!tweetStored) {
          res.send({
            message: "No se ha podido crear el tweet",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Tweet Creado correctamente",
            alert: "Success",
            tweet: tweetStored,
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error", error: err });
        console.log(err);
      });
  });

  //Get All Tweets
  app.get("/get-all-tweets", isAuthenticated, (req, res) => {
    db.Tweet.findAndCountAll({
      order: [["schedule_date", "DESC"]],
    })
      .then((tweetStored) => {
        if (!tweetStored) {
          res.send({
            message: "No se ha encontrado ningun tweet",
            alert: "Error",
          });
        } else {
          res.send({
            total: tweetStored.count,
            data: tweetStored.rows,
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
          error: err,
        });
        console.log(err);
      });
  });

  //Get Tweets before the hour
  app.get("/to-send-tweets/:startinghour", (req, res) => {
    const { startinghour } = req.params;
    let fechaInicial = moment.unix(startinghour).format("YYYY-MM-DD HH:mm");
    db.Tweet.findAll({
      where: {
        [Op.and]: {
          schedule_date: {
            [Op.lte]: fechaInicial,
          },
          complete: {
            [Op.eq]: false,
          },
        },
      },
    })
      .then((data) => {
        console.log(data);
        if (data.length <= 0) {
          res.send({ data: "No se ha encontrado ningun Tweet para mandar" });
        } else {
          res.json(data);
          console.log(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Update Tweet
  app.put("/update-tweet/:id", (req, res) => {
    const { id } = req.params;
    const { title, tweet, schedule_date, complete } = req.body;
    let fecha = moment.tz(schedule_date, "Europe/Warsaw");
    db.Tweet.update(
      {
        title: title,
        tweet: tweet,
        schedule_date: fecha,
        complete: complete,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((updateTweet) => {
        if (updateTweet[0] === 0) {
          res.send({
            message: "No se ha encontrado ningun tweet",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Tweet actualizado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error del servidor", alert: "Error", error: err });
        console.log(err);
      });
  });

  //Delete Tweeet
  app.delete("/delete-tweet/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.Tweet.destroy({
      where: {
        id: id,
      },
    })
      .then((tweetDeleted) => {
        //console.log(userDeleted);
        if (!tweetDeleted) {
          res.send({
            message: "Tweet no encontrado",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Tweet eliminado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error", err: err });
        console.log(err);
      });
  });

  //Get Specific Tweet by id
  app.get("/get-tweet-id/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.Tweet.findOne({
      where: {
        id: id,
      },
    })
      .then((tweetStored) => {
        if (!tweetStored) {
          res.send({
            message: "No se ha encontrado ningun libro",
            alert: "Error",
          });
        } else {
          res.send({
            tweet: tweetStored,
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
        console.log(err);
      });
  });

  //Add tracking
  app.post(
    "/add-tracking",
    isAuthenticated,
    check("phone")
      .isMobilePhone("", { strictMode: true })
      .withMessage("No es un telefono valido"),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        //console.log(errors)
        let errores = errors.array();
        return res.send({
          message: errores[0].msg,
          alert: "Error",
        });
      }
      const { description, tracking, carrier, phone } = req.body;
      //console.log(schedule_date);
      const tracker = new api.Tracker({
        tracking_code: tracking,
        carrier: carrier,
      });

      tracker
        .save()
        .then((Tracker) => {
          //console.log(Tracker);
          db.Pack.create({
            description: description,
            tracking: tracking,
            carrier: carrier,
            phone: phone,
            status: Tracker.status,
            eta: Tracker.est_delivery_date,
            easypost_id: Tracker.id,
          })
            .then((trackStored) => {
              if (!trackStored) {
                res.send({
                  message: "No se ha podido crear el tracking",
                  alert: "Error",
                });
              } else {
                res.send({
                  message: "Tracking Creado correctamente",
                  alert: "Success",
                  track: trackStored,
                });
              }
            })
            .catch((err) => {
              res.send({
                message: "Error de servidor",
                alert: "Error",
                error: err,
              });
              console.log(err);
            });
        })
        .catch((err) => {
          //console.log(err);
          const { error } = err;
          let message = error.error.message;
          res.send({
            message: message,
            alert: "Error",
          });
        });
    }
  );

  //List of all trackings
  app.get("/get-all-tracking", isAuthenticated, (req, res) => {
    db.Pack.findAll({
      order: [["createdAt", "DESC"]],
    })
      .then((trackStored) => {
        if (!trackStored) {
          res.send({
            message: "No se ha encontrado ningun paquete",
            alert: "Error",
          });
        } else {
          res.send({
            data: trackStored,
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
          error: err,
        });
        console.log(err);
      });
  });

  //Get a Tracking by id
  app.get("/get-tracking-id/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.Pack.findOne({
      where: {
        id: id,
      },
    })
      .then((trackStored) => {
        if (!trackStored) {
          res.send({
            message: "No se ha encontrado ningun paquete",
            alert: "Error",
          });
        } else {
          res.send({
            tracking: trackStored,
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
        console.log(err);
      });
  });

  //Delete Tracking by id
  app.delete("/delete-tracking/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.Pack.destroy({
      where: {
        id: id,
      },
    })
      .then((trackDeleted) => {
        //console.log(userDeleted);
        if (!trackDeleted) {
          res.send({
            message: "Paquete no encontrado",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Tracking eliminado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error de servidor", alert: "Error", err: err });
        console.log(err);
      });
  });

  //Update Tweet
  app.put("/update-tracking/:id", (req, res) => {
    const { id } = req.params;
    const { description, tracking, carrier, phone, status } = req.body;
    db.Pack.update(
      {
        description: description,
        tracking: tracking,
        carrier: carrier,
        phone: phone,
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then((updateTrack) => {
        if (updateTrack[0] === 0) {
          res.send({
            message: "No se ha encontrado ningun tracking",
            alert: "Error",
          });
        } else {
          res.send({
            message: "Tracking actualizado correctamente",
            alert: "Success",
          });
        }
      })
      .catch((err) => {
        res.send({ message: "Error del servidor", alert: "Error", error: err });
        console.log(err);
      });
  });

  //Get tracking per carrier
  app.get("/get-tracking-of/:carrier", (req, res) => {
    const { carrier } = req.params;
    db.Pack.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        status: {
          [Op.ne]: "delivered",
        },
      },
    })
      .then((trackStored) => {
        if (!trackStored) {
          res.send({
            message: "No se ha encontrado ningun paquete",
            alert: "Error",
          });
        } else {
          res.send({
            data: trackStored,
          });
        }
      })
      .catch((err) => {
        res.send({
          message: "Error del servidor",
          alert: "Error",
          error: err,
        });
        console.log(err);
      });
  });

  //Send update of tracking by Whatsapp
  app.post("/status-tracking", (req, res) => {
    const { telephone, description, status } = req.body;
    client.messages
      .create({
        from: `whatsapp:${process.env.TWILIO_PHONE}`,
        body: `The status of your tracking ${description} is: ${status}.`,
        to: `whatsapp:${telephone}`,
      })
      .then((message) => {
        res.send({
          message: message,
        });
      })
      .catch((err) => {
        res.json(err);
      });
  });

  //Webhook of easy post.
  app.post("/easypost-webhook", (req, res) => {
    const { result } = req.body;
    if (result) {
      updateTracking(result);
      res.status(200).json({
        message: "Tracking data received succesfully",
      });
    }
  });
};

//Function to updateTracking
async function updateTracking(result) {
  console.log(result.id);
  await db.Pack.update(
    {
      status: result.status,
      eta: result.est_delivery_date,
    },
    {
      where: {
        easypost_id: {
          [Op.eq]: result.id,
        },
      },
    }
  )
    .then((updateTrack) => {
      console.log(updateTrack);
      if (updateTrack[0] === 0) {
        return ({
          message: "No se ha encontrado ningun tracking",
          alert: "Error",
        });
      } else {
        notificationTracking(result);
        return ({
          message: "Tracking actualizado correctamente",
          alert: "Success",
        });
      }
    })
    .catch((err) => {
      return ({
        message: "Error del servidor",
        alert: "Error",
        error: err,
      });
      console.log(err);
    });
}

//Function to send the whatsapp message
async function notificationTracking(result) {
  await db.Pack.findOne({
    where: {
      easypost_id: result.id,
    },
  })
    .then((data) => {
      const { phone, description, status } = data;
      client.messages
        .create({
          from: `whatsapp:${process.env.TWILIO_PHONE}`,
          body: `The status of your tracking ${description} is: ${status}.`,
          to: `whatsapp:${phone}`,
        })
        .then((message) => {
          console.log(message.sid);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}
