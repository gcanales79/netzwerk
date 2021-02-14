module.exports = function (sequelize, DataTypes) {
  var Metatag = sequelize.define("Metatag", {
    title: DataTypes.TEXT,
    description: DataTypes.TEXT,
    keywords: {
      type: DataTypes.STRING,
      defaultValue:
        "liderazgo, crisis, administración, equipo, disciplina, colaboración, persuasión, asertividad, resolución de problemas, confianza, inteligencia emocional, liderazgo participativo, proactividad",
    },
    cardType: {
      type: DataTypes.STRING,
      defaultValue: "summary_large_image",
    },

    site: {
      type: DataTypes.STRING,
      defaultValue: "@netzwerk13",
    },

    creator: {
      type: DataTypes.STRING,
      defaultValue: "@netzwerk13",
    },
    url: DataTypes.STRING,
    twitterTitle: DataTypes.TEXT,
    twitterDescription: DataTypes.TEXT,
    image: DataTypes.STRING,
  });

  Metatag.associate = function (models) {
    Metatag.belongsTo(models.Blog, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return Metatag;
};
