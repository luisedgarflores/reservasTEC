const reservervesrestrictions = (sequelize, DataTypes) => {
  const ReservesRestrictions = sequelize.define('reservervesrestrictions', {
    start:{
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          args: true, 
          msg: "Not empty start allowed"
        },
      }
    },
    end:{
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          args: true, 
          msg: "Not empty end allowed"
        },
        isGreaterThanStart(value) {
          if (new Date(value) <= new Date (this.start)) {
            throw new Error('End must be greater than start.');
          }
        }
      }
    },
    roomId: {
      type: DataTypes.INTEGER
    },
  })

  return ReservesRestrictions
}

export default reservervesrestrictions