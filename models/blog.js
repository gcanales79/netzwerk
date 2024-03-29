module.exports = function (sequelize, DataTypes) {
    var Blog = sequelize.define("Blog", {
        title:DataTypes.STRING,
        url: {
            type:DataTypes.STRING,
            unique:true,
        },
        description: DataTypes.TEXT,
        image:DataTypes.STRING,
        image_alt:DataTypes.STRING,
        tema:{
            type:DataTypes.STRING,
            defaultValue:"Liderazgo"
        },
        active:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
        },
        favorite:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
        }
    
    });

    Blog.associate=function(models){
        Blog.hasOne(models.Metatag,{
            onDelete:"cascade"
        })
    }
    

    return Blog;
}