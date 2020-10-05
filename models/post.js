module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define("Post", {
        tema:DataTypes.STRING,
        titulo: DataTypes.TEXT,
        url: DataTypes.STRING,
        url_id: DataTypes.STRING,

        imagen:DataTypes.STRING,
        autor:DataTypes.STRING,
        post:{
            type:DataTypes.TEXT,
            length:"long",
        },
        imagen_autor:DataTypes.STRING,
        imagen_post:DataTypes.STRING,
       
    });

    return Post;
}