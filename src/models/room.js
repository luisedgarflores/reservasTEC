const room = (sequelize, DataTypes) => {
  const Room = sequelize.define('room', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "Name cannot be null"
        },
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        notEmpty: {
          args: true,
          msg: "Capacity cannot be null"
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
    }
  })

  Room.associate = models => {
    Room.belongsTo(models.Building)
    Room.belongsToMany(models.Role, { through: models.ReservesPermissions })
    Room.belongsToMany(models.User, {
      through: {
        model: models.Reservation,
        unique: false
      }
    })
  }

  return Room
}

export default room