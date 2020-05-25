const trip = (sequelize, DataTypes) => {
  const Trip = sequelize.define('trip', {
    duration: {
      type: DataTypes.FLOAT,
      allowNull: {
        args: false, 
        msg: 'No se puede crear un viaje sin duración'
      },
      validate: {
        min: 0
      }
    }
  })

  Trip.associate = models => {
    Trip.belongsTo (models.User)
    Trip.belongsToMany(models.Station, { through: 'departures', as: 'departure'})
    Trip.belongsToMany(models.Station, { through: 'arrivals', as: 'arrival'})
    Trip.belongsTo(models.Bike)
  }

  return Trip
}

export default trip