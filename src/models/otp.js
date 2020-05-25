const otp = (sequelize, DataTypes) => {
  const OTP = sequelize.define('otp', {
    otp:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: ["^[0-9]+$"],
          msg: "No se puede generar un otp que no sea numérico"
        },
        len: {
          args: [4,4],
          msg: "El otp debe tener una longitud de 4 caracteres"
        },
      }
    }
  })
  return OTP
}

export default otp