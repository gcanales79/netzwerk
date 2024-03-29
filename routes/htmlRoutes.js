var db = require("../models");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var ensureTotp = require("../config/middleware/ensureTotp");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const queryString = require("query-string");

module.exports = function (app) {
  // Load index page main page with list of limited post
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
      limit: 5,
    }).then((data) => {
      let datos = data.map((data) => data.toJSON());
      //console.log(datos);
      let scriptInicial = [
        {
          jsfile: "https://code.jquery.com/jquery.js",
        },
      ];
      let jsfile = [{ jsfile: "/assets/dist/js/index.js" }];
      let style = [{ style: "/assets/dist/css/main.css" }];
      res.render("index", {
        msg: "Welcome!",
        jsfile: jsfile,
        url: "/",
        style: style,
        scriptInicial: scriptInicial,
        //Solucion al problema de handlebars
        datos: data.map((data) => data.toJSON()),
      });
    });
  });

  //Load Books Page
  app.get("/libros", function (req, res) {
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
    db.Libro.findAll({
      where: {
        active: true,
      },
      order: [["createdAt", "DESC"]],
    }).then((data) => {
      let datos = data.map((data) => data.toJSON());
      //console.log(datos);
      let scriptInicial = [
        {
          jsfile: "https://code.jquery.com/jquery.js",
        },
      ];
      let jsfile = [{ jsfile: "/assets/dist/js/libros.js" }];
      let style = [{ style: "/assets/dist/css/libros.css" }];
      res.render("libros", {
        msg: "Welcome!",
        jsfile: jsfile,
        url: "/libros",
        style: style,
        scriptInicial: scriptInicial,
        //Solucion al problema de handlebars
        datos: data.map((data) => data.toJSON()),
      });
    });
  });

  // Load index page main page with list of all posts
  app.get("/todos-los-post", function (req, res) {
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
      let scriptInicial = [
        {
          jsfile: "https://code.jquery.com/jquery.js",
        },
      ];
      let jsfile = [{ jsfile: "/assets/dist/js/index.js" }];
      let style = [{ style: "/assets/dist/css/main.css" }];
      res.render("index", {
        msg: "Welcome!",
        jsfile: jsfile,
        url: "/",
        style: style,
        btnMas: "display: none",
        scriptInicial: scriptInicial,
        //Solucion al problema de handlebars
        datos: data.map((data) => data.toJSON()),
      });
    });
  });

  //Admin Page page
  app.get("/admin", isAuthenticated, ensureTotp, (req, res) => {
    console.log(req.user);
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      {
        style:
          "https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css",
      },
      { style: "/assets/dist/css/sidemenu.css" },
      { style: "/assets/dist/css/toogle.css" },
      { style: "/assets/dist/css/toastr.css" },
    ];
    let tiny = [
      {
        src: "https://cdn.tiny.cloud/1/q2wc0wvoeizxrqmq7o9ev0r9zms41ac4rb5eihoawlsh3na0/tinymce/5/tinymce.min.js",
        referrerpolicy: "origin",
      },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];

    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      {
        jsfile:
          "https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js",
      },
      { jsfile: "/assets/dist/js/toastr.js" },
      { jsfile: "/assets/dist/js/admin.js" },
      { jsfile: "/assets/dist/js/pagination.js" },
      { jsfile: "/assets/dist/js/bootstrap-notify.js" },
    ];
    res.render("admin", {
      style: style,
      userAdmin: true,
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      url: "/admin",
      scriptInicial: scriptInicial,
      bootStyle: bootStyle,
      menu: true,
      tiny: tiny,
    });
  });

  //Blog Creation Page
  app.get("/admin/blog", isAuthenticated, ensureTotp, (req, res) => {
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
      //console.log(page);
      let bootStyle = [
        {
          href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
        },
      ];
      let style = [
        {
          style:
            "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
        },
        { style: "/assets/dist/css/sidemenu.css" },
        { style: "/assets/dist/css/toastr.css" },
      ];
      let scriptInicial = [
        {
          jsfile: "https://code.jquery.com/jquery.js",
        },
      ];
      let tiny = [
        {
          src: "https://cdn.tiny.cloud/1/q2wc0wvoeizxrqmq7o9ev0r9zms41ac4rb5eihoawlsh3na0/tinymce/5/tinymce.min.js",
          referrerpolicy: "origin",
        },
      ];
      let jsarchivo = [
        {
          jsfile:
            "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
          integrity:
            "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
          crossorigin: "anonymous",
        },
        {
          jsfile:
            "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
          integrity:
            "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
          crossorigin: "anonymous",
        },
      ];
      let jsfile = [
        { jsfile: "/assets/dist/js/pagination.js" },
        { jsfile: "/assets/dist/js/toastr.js" },
        { jsfile: "/assets/dist/js/admin_blog.js" },
      ];
      res.render("admin", {
        style: style,
        postAdmin: true,
        page: page,
        limit: limit,
        total: postStored.count,
        data: datos,
        jsfile: jsfile,
        jsarchivo: jsarchivo,
        url: "/admin/blog",
        tiny: tiny,
        scriptInicial: scriptInicial,
        menu: true,
        bootStyle: bootStyle,
      });
    });
  });

  //Create Book Recomendation
  app.get("/admin/libros", isAuthenticated, ensureTotp, (req, res) => {
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
      //console.log(page);
      let bootStyle = [
        {
          href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
        },
      ];
      let style = [
        {
          style:
            "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
        },
        { style: "/assets/dist/css/sidemenu.css" },
        { style: "/assets/dist/css/toastr.css" },
      ];
      let scriptInicial = [
        {
          jsfile: "https://code.jquery.com/jquery.js",
        },
      ];
      let tiny = [
        {
          src: "https://cdn.tiny.cloud/1/q2wc0wvoeizxrqmq7o9ev0r9zms41ac4rb5eihoawlsh3na0/tinymce/5/tinymce.min.js",
          referrerpolicy: "origin",
        },
      ];
      let jsarchivo = [
        {
          jsfile:
            "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
          integrity:
            "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
          crossorigin: "anonymous",
        },
        {
          jsfile:
            "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
          integrity:
            "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
          crossorigin: "anonymous",
        },
      ];
      let jsfile = [
        { jsfile: "/assets/dist/js/pagination.js" },
        { jsfile: "/assets/dist/js/toastr.js" },
        { jsfile: "/assets/dist/js/admin_book.js" },
      ];
      res.render("admin", {
        style: style,
        libroAdmin: true,
        page: page,
        limit: limit,
        total: postStored.count,
        data: datos,
        jsfile: jsfile,
        jsarchivo: jsarchivo,
        url: "/admin/libros",
        tiny: tiny,
        scriptInicial: scriptInicial,
        menu: true,
        bootStyle: bootStyle,
      });
    });
  });

  //Create Tweet Schedule
  app.get("/admin/tweet", isAuthenticated, ensureTotp, (req, res) => {
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/sidemenu.css" },
      { style: "/assets/dist/css/toastr.css" },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let tiny = [
      {
        src: "https://cdn.tiny.cloud/1/q2wc0wvoeizxrqmq7o9ev0r9zms41ac4rb5eihoawlsh3na0/tinymce/5/tinymce.min.js",
        referrerpolicy: "origin",
      },
    ];
    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/pagination.js" },
      { jsfile: "/assets/dist/js/toastr.js" },
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js",
      },
      { jsfile: "/assets/dist/js/admin_tweet.js" },
    ];
    res.render("admin", {
      style: style,
      tweetAdmin: true,
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      url: "/admin/tweet",
      tiny: tiny,
      scriptInicial: scriptInicial,
      menu: true,
      bootStyle: bootStyle,
    });
  });

  //Track packages and get notifications
  //Create Tweet Schedule
  app.get("/admin/tracking", isAuthenticated, ensureTotp, (req, res) => {
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/sidemenu.css" },
      { style: "/assets/dist/css/track.css" },
      { style: "/assets/dist/css/toastr.css" },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let tiny = [
      {
        src: "https://cdn.tiny.cloud/1/q2wc0wvoeizxrqmq7o9ev0r9zms41ac4rb5eihoawlsh3na0/tinymce/5/tinymce.min.js",
        referrerpolicy: "origin",
      },
    ];
    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/pagination.js" },
      { jsfile: "/assets/dist/js/toastr.js" },
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js",
      },
      { jsfile: "/assets/dist/js/admin_track.js" },
    ];
    res.render("admin", {
      style: style,
      trackAdmin: true,
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      url: "/admin/tracking",
      scriptInicial: scriptInicial,
      menu: true,
      bootStyle: bootStyle,
    });
  });

  //Image Upload Page

  app.get("/admin/images", isAuthenticated, ensureTotp, (req, res) => {
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/sidemenu.css" },
    ];
    let tiny = [
      {
        src: "https://cdn.tiny.cloud/1/q2wc0wvoeizxrqmq7o9ev0r9zms41ac4rb5eihoawlsh3na0/tinymce/5/tinymce.min.js",
        referrerpolicy: "origin",
      },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/pagination.js" },
      { jsfile: "/assets/dist/js/bootstrap-notify.js" },
      { jsfile: "/assets/dist/js/admin_image.js" },
    ];
    res.render("admin", {
      style: style,
      imageAdmin: true,
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      scriptInicial: scriptInicial,
      tiny: tiny,
      menu: true,
      bootStyle: bootStyle,
    });
  });

  //Login Page
  app.get("/login", (req, res) => {
    let alert = req.flash("error");
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/toastr.css" },
      { style: "/assets/dist/css/login.css" },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/toastr.js" },
      {
        jsfile: "/assets/dist/js/bootstrap-notify.js",
      },
      {
        jsfile:
          "https://www.google.com/recaptcha/api.js?render=6LcP6XYaAAAAAB0SXo9Dmt7n2xuuB1VJaD6QJ2Hf",
      },
      { jsfile: "/assets/dist/js/login.js" },
    ];
    console.log(alert);
    res.render("login", {
      style: style,
      alerta: alert,
      title: "Sign in",
      title2: "Sign up",
      link: "/signup",
      buttonTitle: "Login",
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      url: "/admin/images",
      scriptInicial: scriptInicial,
      menu: true,
      bootStyle: bootStyle,
    });
  });

  //2FA Page
  app.get("/verification", isAuthenticated, (req, res) => {
    let alert = req.flash("error");
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/login.css" },
      { style: "/assets/dist/css/verification.css" },
      { style: "/assets/dist/css/toastr.css" },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/toastr.js" },
      {
        jsfile:
          "https://www.google.com/recaptcha/api.js?render=6LcP6XYaAAAAAB0SXo9Dmt7n2xuuB1VJaD6QJ2Hf",
      },
      { jsfile: "/assets/dist/js/verification.js" },
    ];
    console.log(alert);
    res.render("verification", {
      style: style,
      alerta: alert,
      title: "Sign in",
      title2: "Sign up",
      link: "/signup",
      buttonTitle: "Login",
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      url: "/admin/images",
      scriptInicial: scriptInicial,
      menu: true,
      bootStyle: bootStyle,
      userId: req.user.id,
    });
  });

  //Signup Page
  app.get("/signup", (req, res) => {
    let alert = req.flash("error");
    //console.log(alert);
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/login.css" },
      { style: "/assets/dist/css/toastr.css" },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let jsarchivo = [
      {
        jsfile:
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js",
        integrity:
          "sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut",
        crossorigin: "anonymous",
      },
      {
        jsfile:
          "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js",
        integrity:
          "sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k",
        crossorigin: "anonymous",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/login.js" },
      { jsfile: "/assets/dist/js/toastr.js" },
    ];
    res.render("signup", {
      style: style,
      alerta: alert,
      title: "Sign up",
      title2: "Sign in",
      link: "/login",
      buttonTitle: "Signup",
      jsfile: jsfile,
      jsarchivo: jsarchivo,
      url: "/signup",
      scriptInicial: scriptInicial,
      menu: true,
      bootStyle: bootStyle,
    });
  });

  //Reset Password
  app.get("/recover-password/:token", (req, res) => {
    const { token } = req.params;
    let bootStyle = [
      {
        href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
      },
    ];
    let style = [
      {
        style:
          "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      },
      { style: "/assets/dist/css/reset.css" },
      { style: "/assets/dist/css/toastr.css" },
    ];
    let scriptInicial = [
      {
        jsfile: "https://code.jquery.com/jquery.js",
      },
    ];
    let jsfile = [
      { jsfile: "/assets/dist/js/reset.js" },
      { jsfile: "/assets/dist/js/toastr.js" },
    ];
    res.render("reset", {
      style: style,
      jsfile: jsfile,
      token: token,
      scriptInicial: scriptInicial,
      bootStyle: bootStyle,
    });
  });

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
        //console.log(data.dataValues.Metatag.dataValues);
        //console.log(data.dataValues);
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
          date:data.dataValues.Metatag.dataValues.createdAt,
        };
        let bootStyle = [
          {
            href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
          },
        ];
        let style = [{ style: "/assets/dist/css/blog.css" }];
        let jsfile = [{ jsfile: "/assets/dist/js/blog.js" }];
        let ampDatos = [
          {
            headline: data.dataValues.Metatag.dataValues.twitterTitle,
            image: data.dataValues.Metatag.dataValues.image,
            datePublished: data.dataValues.createdAt,
          },
        ];

        res.render("singlePost", {
          msg: "Welcome!",
          style: style,
          datos: data.dataValues,
          metaTag: data.dataValues.Metatag.dataValues,
          jsfile: jsfile,
          ampDatos: ampDatos,
          bootStyle: bootStyle,
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
  app.get("/admin/:url", isAuthenticated, ensureTotp, (req, res) => {
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
        let bootStyle = [
          {
            href: "https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css",
          },
        ];
        let style = [{ style: "/assets/dist/css/blog.css" }];
        let jsfile = [{ jsfile: "/assets/dist/js/admin.js" }];
        res.render("singlePost", {
          msg: "Welcome!",
          style: style,
          datos: data.dataValues,
          metaTag: data.dataValues.Metatag.dataValues,
          jsfile: jsfile,
          bootStyle: bootStyle,
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
