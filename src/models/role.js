const role = (sequelize, DataTypes) => {
  const Role = sequelize.define('role', {
    role:{
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true, 
          msg: "Not empty text allowed"
        },
      }
    }
  })

  Role.associate = models => {
    Role.hasMany (models.User)
    Role.belongsToMany(models.Room, { through: models.ReservesPermissions })
  }

  return Role
}

export default role