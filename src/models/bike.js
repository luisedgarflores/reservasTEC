const bike = (sequelize, DataTypes) => {
  const Bike = sequelize.define('bike', {
    name: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: "Se debe agregar un nombre único"
      },
      allowNull: false,
      notEmpty: {
        args: true, 
        msg: "No se permite un nombre vacio"
      },
    },
    available:{
      type: DataTypes.BOOLEAN,
    },
    longitude: DataTypes.STRING,
    locked: DataTypes.BOOLEAN,
    speed: DataTypes.FLOAT,
    latitude: DataTypes.STRING
  })

  Bike.associate = models => {
    Bike.belongsToMany (models.Station, { through: 'bikesinstations'})
    Bike.hasMany (models.Trip)
  }

  return Bike
}

export default bike