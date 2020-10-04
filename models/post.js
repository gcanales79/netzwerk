module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define("Post", {
        tema:DataTypes.STRING,
        titulo: DataTypes.TEXT,
        url: DataTypes.STRING,
        imagen:DataTypes.STRING,
       
    });

    return Post;
}