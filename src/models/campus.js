const campus = (sequelize, DataTypes) => {
  const Campus = sequelize.define('campus', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "Not empty name allowed"
        },
      }
    },
    address: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      validate: {
        notEmpty: {
          args: true,
          msg: "Active cannot be null"
        },
      }
    },
  })

  Campus.associate = models => {
    Campus.hasMany(models.Building)
  }

return Campus
}

export default campus