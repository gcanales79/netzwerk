module.exports = function (sequelize, DataTypes) {
    var Libro = sequelize.define("Libro", {
        title:DataTypes.STRING,
        author: {
            type:DataTypes.STRING,
        },
        url: {
            type:DataTypes.TEXT,
        },
        description: DataTypes.TEXT,
        image:DataTypes.STRING,
        image_alt:DataTypes.STRING,
        active:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
        },
    
    });


    return Libro;
}