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
      description: "Blog donde hablo de liderazgo y trabajo en equipo.",
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
    db.Blog.findAll({
      order: [["createdAt", "DESC"]],
      include: [db.Metatag],
    }).then((data) => {
      let datos=data.map((data) => data.toJSON())
      console.log(datos)
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
  app.get("/blog/:url", (req, res) => {
    const { url } = req.params;
    db.Blog.findOne({
      where: {
        url: url
      },
      include: [db.Metatag],
    }).then((data) => {
      console.log(data.dataValues.Metatag.dataValues);
      console.log(data.dataValues);
      res.locals.metaTags = {
        title: data.dataValues.title,
        description: data.dataValues.Metatag.dataValues.description,
        keywords: data.dataValues.Metatag.dataValues.keywords,
        cardType: data.dataValues.Metatag.dataValues.cardType,
        site: data.dataValues.Metatag.dataValues.site,
        creator: data.dataValues.Metatag.dataValues.creator,
        url: data.dataValues.Metatag.dataValues.url,
        twitterTitle: data.dataValues.Metatag.dataValues.twitterTitle,
        twitterDescription: data.dataValues.Metatag.dataValues.twitterDescription,
        image: data.dataValues.Metatag.dataValues.image,
        pageIdentifier:data.dataValues.url
      };

      res.render("singlePost", {
        msg: "Welcome!",
        datos: data.dataValues,
        metaTag:data.dataValues.Metatag.dataValues,
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
