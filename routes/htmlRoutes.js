var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = function (app) {

    // Load index page
    app.get("/", function (req, res) {
        res.locals.metaTags = {
            title: "Netzwerk - Blog Acerca de Liderazgo y Administración",
            description: "Profesional de la Industria Automotriz que busca compartir sus experiencias",
            keywords: "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo",
            cardType: "summary_large_image",
            site: "@netzwerk13",
            creator: "@netzwerk13",
            url: "https://netzwerk.mx/",
            twitterTitle: "Blog acerca de temas de liderazgo y desarrollo de equipos",
            twitterDescription: "Blog donde quisiera compartir mis experiencias, lo que voy aprendiendo en el camino y me gustaria escuchar de ti.",
            image: "https://netzwerk.mx/assets/dist/img/Logo_netzwerk.png"

        }
        db.Post.findAll({
            order: [["createdAt", "DESC"]],
        }).then((data)=>{
            //console.log(data)
            res.render("index", {
                msg: "Welcome!",
                datos:data.map(data=>data.toJSON())
                
            });
        })
       
    });

    //Load Blog Post
    app.get("/api",(req,res)=>{
        console.log(req.query.post)
        db.Post.findOne({
            where:{
                url_id: req.query.post
            }
        }).then((data)=>{
            console.log(data.dataValues)
            res.render("singlePost",{
                msg:"Welcome!",
                datos:data.dataValues,
            })
            
        })
       

    })

    // Cookies
    app.get("/cookies", function (req, res) {
        res.locals.metaTags = {
            title: "Declaración de Cookies - Netzwerk",
            description: "Por favor acepta nuestras cookies",
            keywords: "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo"

        }
        res.render("cookies", {
            msg: "Welcome!",
        });

    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.locals.metaTags = {
            title: "404 No se encontro la página - Netzwerk",
            description: "This is a 404 Page, please try again",
            keywords: "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo"

        }
        res.render("404");
    });


}