const prueba = (sequelize, DataTypes) => {
  const Prueba = sequelize.define('prueba', {
    prueba:{
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true, 
          msg: "Not empty text allowed"
        },
      }
    }
  })

  return Prueba
}

export default prueba