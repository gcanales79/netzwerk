module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define("Post", {
        tema:DataTypes.STRING,
        titulo: DataTypes.TEXT,
        url: {
            type:DataTypes.STRING,
            unique:true,
        },
        url_id: DataTypes.STRING,

        imagen:DataTypes.STRING,
        imagen_alt:DataTypes.STRING,
        autor:DataTypes.STRING,
        post:{
            type:DataTypes.TEXT,
            length:"long",
        },
        imagen_autor:DataTypes.STRING,
        imagen_post:DataTypes.STRING,
        imagen_post_alt:DataTypes.STRING,
       
    });

    Post.associate=function(models){
        Post.hasOne(models.Tag,{
            onDelete:"cascade"
        })
    }

    return Post;
}