module.exports = function (sequelize, DataTypes) {
    var Tweet = sequelize.define("Tweet", {
        title:DataTypes.STRING,
        tweet:DataTypes.TEXT,
        schedule_date: {
            type:DataTypes.DATE,
        },
        complete:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
        },
    
    });


    return Tweet;
}