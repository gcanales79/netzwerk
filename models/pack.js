module.exports = function (sequelize, DataTypes) {
  var Pack = sequelize.define("Pack", {
    carrier: DataTypes.STRING,
    tracking: {
      type: DataTypes.STRING,
    },
    easypost_id:{
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.TEXT,
      defaultValue:"Created",
      length:"long",
    },
    eta: {
      type: DataTypes.DATE,
    },
    phone: {
      type: DataTypes.STRING,
    },
  });

  return Pack;
};
