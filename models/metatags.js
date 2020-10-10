module.exports = function (sequelize, DataTypes) {
    var Tag = sequelize.define("Tag", {
        title:DataTypes.TEXT,
        description:DataTypes.TEXT,
        keywords: DataTypes.STRING,
        cardType: DataTypes.STRING,

        site:DataTypes.STRING,
        creator:DataTypes.STRING,
        url:DataTypes.STRING,
        twitterTitle:DataTypes.TEXT,
        twitterDescription:DataTypes.TEXT,
        image:DataTypes.STRING
       
    });

    Tag.associate=function(models){
        Tag.belongsTo(models.Post,{
            onDelete:"cascade",
            foreignKey:{
                allowNull:false,
            }
        })
    }

    return Tag;
}



