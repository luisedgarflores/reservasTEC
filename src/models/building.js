const building = (sequelize, DataTypes) => {
  const Building = sequelize.define('building', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "Not empty name allowed"
        },
      }
    },
    description: {
      type: DataTypes.STRING,
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
    floors: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  })
  Building.associate = models => {
    Building.belongsTo(models.Campus)
    Building.hasMany(models.Room)
  }

return Building
}

export default building