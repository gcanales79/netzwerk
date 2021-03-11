var db = require("../models");
var isAuthenticated = require("../config/middleware/isAuthenticated");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const queryString = require("query-string");

module.exports = function (app) {
  // Load index page main page with list of all posts
  app.get("/", function (req, res) {
    res.locals.metaTags = {
      title: "Netzwerk - Blog Acerca de Liderazgo y Administración",
      description:
        "Blog donde hablo de liderazgo y trabajo en equipo. Si quieres mejorar el desempeño de tu equipo de trabajo o si buscas mejorar en tu trabajo te recomiendo que me visites regularmente.",
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
      where: {
        active: true,
      },
      order: [["createdAt", "DESC"]],
      include: [db.Metatag],
    }).then((data) => {
      let datos = data.map((data) => data.toJSON());
      console.log(datos);
      let jsfile = [{ jsfile: "/assets/dist/js/index.js" }];
      res.render("index", {
        msg: "Welcome!",
        jsfile: jsfile,
        url: "/",
        style: "main.css",
        //Solucion al problema de handlebars
        datos: data.map((data) => data.toJSON()),
      });
    });
  });

  //Admin Page page
  app.get("/admin", isAuthenticated, (req, res) => {
    let jsfile = [{ jsfile: "/assets/dist/js/admin.js" }];
    res.render("admin", {
      style: "sidemenu.css",
      userAdmin: true,
      jsfile: jsfile,
      url: "/admin",
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
      let jsfile = [{ jsfile: "/assets/dist/js/admin.js" }];
      res.render("admin", {
        style: "sidemenu.css",
        postAdmin: true,
        page: page,
        limit: limit,
        total: postStored.count,
        data: datos,
        jsfile: jsfile,
        url: "/admin/blog",
      });
    });
  });

  //Image Upload Page

  app.get("/admin/images", isAuthenticated, (req, res) => {
    let jsfile = [{ jsfile: "/assets/dist/js/admin.js" }];
    res.render("admin", {
      style: "sidemenu.css",
      imageAdmin: true,
      jsfile: jsfile,
    });
  });

  //Login Page
  app.get("/login", (req, res) => {
    let alert = req.flash("error");
    let jsfile = [
      { jsfile: "/assets/dist/js/login.js" },
      {
        jsfile:
          "https://www.google.com/recaptcha/api.js?render=6LcP6XYaAAAAAB0SXo9Dmt7n2xuuB1VJaD6QJ2Hf",
      },
    ];
    console.log(alert);
    res.render("login", {
      style: "login.css",
      alerta: alert,
      title: "Sign in",
      title2: "Sign up",
      link: "/signup",
      buttonTitle: "Login",
      jsfile: jsfile,
      url: "/admin/images",
    });
  });

  //Signup Page
  app.get("/signup", (req, res) => {
    let alert = req.flash("error");
    console.log(alert);
    let jsfile = [{ jsfile: "/assets/dist/js/login.js" }];
    res.render("signup", {
      style: "login.css",
      alerta: alert,
      title: "Sign up",
      title2: "Sign in",
      link: "/login",
      buttonTitle: "Signup",
      jsfile: jsfile,
      url: "/signup",
    });
  });

  //Reset Password
  app.get("/recover-password/:token",(req,res)=>{
    let jsfile=[{jsfile:"/assets/dist/js/reset.js"}]
    res.render("reset",{
      style:"reset.css",
      jsfile:jsfile,
    })
  })

  //Load Blog Post
  app.get("/blog/:url", (req, res) => {
    const { url } = req.params;
    db.Blog.findOne({
      where: {
        url: url,
        active: true,
      },
      include: [db.Metatag],
    })
      .then((data) => {
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
          twitterDescription:
            data.dataValues.Metatag.dataValues.twitterDescription,
          image: data.dataValues.Metatag.dataValues.image,
          pageIdentifier: data.dataValues.url,
        };
        let jsfile = [{ jsfile: "/assets/dist/js/blog.js" }];

        res.render("singlePost", {
          msg: "Welcome!",
          datos: data.dataValues,
          metaTag: data.dataValues.Metatag.dataValues,
          jsfile: jsfile,
          url: `/blog/${url}`,
        });
      })
      .catch((err) => {
        res.render("404", {
          jsfile: "404.js",
        });
      });
  });

  //Preview Post Test
  app.get("/admin/:url", isAuthenticated, (req, res) => {
    const { url } = req.params;
    db.Blog.findOne({
      where: {
        url: url,
      },
      include: [db.Metatag],
    })
      .then((data) => {
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
          twitterDescription:
            data.dataValues.Metatag.dataValues.twitterDescription,
          image: data.dataValues.Metatag.dataValues.image,
          pageIdentifier: data.dataValues.url,
        };
        let jsfile = [{ jsfile: "/assets/dist/js/admin.js" }];
        res.render("singlePost", {
          msg: "Welcome!",
          datos: data.dataValues,
          metaTag: data.dataValues.Metatag.dataValues,
          jsfile: jsfile,
          url: `/admin/${url}`,
        });
      })
      .catch((err) => {
        res.render("404", {
          jsfile: "404.js",
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
    let jsfile = [{ jsfile: "/assets/dist/js/404.js" }];
    res.locals.metaTags = {
      title: "404 No se encontro la página - Netzwerk",
      description: "This is a 404 Page, please try again",
      keywords:
        "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo",
    };
    res.render("404", {
      jsfile: jsfile,
    });
  });
};
