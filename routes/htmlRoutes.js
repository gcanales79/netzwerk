var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = function (app) {

    // Load index page
    app.get("/", function (req, res) {
        res.locals.metaTags = {
            title: "Bites of the World - Blog About Food and Travel",
            description: "A lover of food and great places to enjoy with the family",
            keywords: "food, restaurant, restaurants, place to go, Warsaw, Monterrey, place to eat, place to drink",
            cardType: "summary_large_image",
            site: "@bitesworld_mx",
            creator: "@bitesworld_mx",
            url: "https://bitesoftheworld.mx/",
            twitterTitle: "Blog about food and places to visit.",
            twitterDescription: "Blog with plenty of ideas of restaurants or places to go mainly of Warsaw and Monterrey.",
            image: "https://bitesoftheworld.mx/assets/images/Logoblanco.jpg"

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

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.locals.metaTags = {
            title: "404 Page Ups Something Went Wrong- Bites of the World",
            description: "This is a 404 Page, please try again",
            keywords: "food, restaurant, restaurants, place to go, Warsaw, Konstancin, Monterrey, place to eat, place to drink"

        }
        res.render("404");
    });


}