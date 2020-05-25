const trashCan = (sequelize, DataTypes) => {
  const TrashCan = sequelize.define('trashcan', {
    name:{
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true, 
          msg: "No se permite un nombre vacio"
        },
      }
    },
    longitude: DataTypes.STRING,
    latitude: DataTypes.STRING
  })

  return TrashCan
}

export default trashCan