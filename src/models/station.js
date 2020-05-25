const station = (sequelize, DataTypes) => {
  const Station = sequelize.define('station', {
    name:{
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true, 
          msg: "No se permite un nombre vacio"
        },
      }
    },
    available:{
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    longitude: DataTypes.STRING,
    latitude: DataTypes.STRING,
    capacity: DataTypes.INTEGER
  })

  Station.associate = models => {
    Station.hasMany (models.Bike)
    Station.belongsToMany(models.Trip, { through: 'departures', as: 'departure'})
    Station.belongsToMany(models.Trip, { through: 'arrivals', as: 'arrival'})
  }

  return Station
}

export default station