module.exports = function (sequelize, DataTypes) {
  var Image = sequelize.define("Image", {
    imagen_url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    imagen_alt:{
      type: DataTypes.STRING,
    }
  });

  return Image;
};
