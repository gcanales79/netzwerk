var db = require("../models");
var isAuthenticated = require("../config/middleware/isAuthenticated");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const queryString = require("query-string");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    res.locals.metaTags = {
      title: "Netzwerk - Blog Acerca de Liderazgo y Administración",
      description:
        "Profesional de la Industria Automotriz que busca compartir sus experiencias",
      keywords:
        "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo, proactividad",
      cardType: "summary_large_image",
      site: "@netzwerk13",
      creator: "@netzwerk13",
      url: "https://netzwerk.mx/",
      twitterTitle: "Blog acerca de temas de liderazgo y desarrollo de equipos",
      twitterDescription:
        "Blog donde quisiera compartir mis experiencias, lo que voy aprendiendo en el camino y me gustaria escuchar de ti.",
      image: "https://netzwerk.mx/assets/dist/img/Logo_netzwerk.png",
    };
    db.Post.findAll({
      order: [["createdAt", "DESC"]],
    }).then((data) => {
      //console.log(data)
      res.render("index", {
        msg: "Welcome!",
        //Solucion al problema de handlebars
        datos: data.map((data) => data.toJSON()),
      });
    });
  });

  //Admin Page page
  app.get("/admin", isAuthenticated, (req, res) => {
    res.render("admin", {
      style: "sidemenu.css",
      userAdmin: true,
    });
  });

  //Blog Page
  app.get("/admin/blog", isAuthenticated, (req, res) => {
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    let limit = 12;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    db.Blog.findAndCountAll({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "ASC"]],
    }).then((postStored) => {
      //console.log(`Page: ${page}`);
      let data = postStored.rows;
      let datos = data.map((data) => data.toJSON());
      //console.log(datos)
      console.log(page);
      res.render("admin", {
        style: "sidemenu.css",
        postAdmin: true,
        page: page,
        limit: limit,
        total: postStored.count,
        data: datos,
      });
    });
  });

  //Image Upload Page

  app.get("/admin/images", isAuthenticated, (req, res) => {
    res.render("admin", {
      style: "sidemenu.css",
      imageAdmin: true,
    });
  });

  //Login Page
  app.get("/login", (req, res) => {
    let alert = req.flash("error");
    console.log(alert);
    res.render("login", {
      style: "login.css",
      alerta: alert,
      title: "Sign in",
      title2: "Sign up",
      link: "/signup",
      buttonTitle: "Login",
    });
  });

  //Signup Page
  app.get("/signup", (req, res) => {
    let alert = req.flash("error");
    console.log(alert);
    res.render("signup", {
      style: "login.css",
      alerta: alert,
      title: "Sign up",
      title2: "Sign in",
      link: "/login",
      buttonTitle: "Signup",
    });
  });

  //Load Blog Post
  app.get("/api", (req, res) => {
    console.log(req.query.post);
    db.Post.findOne({
      where: {
        url_id: req.query.post,
      },
      include: [db.Tag],
    }).then((data) => {
      console.log(data.dataValues);
      res.locals.metaTags = {
        title: data.dataValues.titulo,
        description: data.dataValues.description,
        keywords: data.dataValues.keywords,
        cardType: data.dataValues.Tag.dataValues.cardType,
        site: data.dataValues.Tag.dataValues.site,
        creator: data.dataValues.Tag.dataValues.creator,
        url: data.dataValues.Tag.dataValues.url,
        twitterTitle: data.dataValues.Tag.dataValues.twitterTitle,
        twitterDescription: data.dataValues.Tag.dataValues.twitterDescription,
        image: data.dataValues.Tag.dataValues.image,
      };

      res.render("singlePost", {
        msg: "Welcome!",
        datos: data.dataValues,
      });
    });
  });

  // Cookies
  app.get("/cookies", function (req, res) {
    res.locals.metaTags = {
      title: "Declaración de Cookies - Netzwerk",
      description: "Por favor acepta nuestras cookies",
      keywords:
        "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo",
    };
    res.render("cookies", {
      msg: "Welcome!",
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.locals.metaTags = {
      title: "404 No se encontro la página - Netzwerk",
      description: "This is a 404 Page, please try again",
      keywords:
        "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo",
    };
    res.render("404");
  });
};
