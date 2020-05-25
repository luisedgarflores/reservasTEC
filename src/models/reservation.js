import User from './user'
import Room from './room'

const reservation = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('reservation', {
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
        },
        isFromSameDate(end) {
          if (
            !(start.getFullYear() === end.getFullYear()) ||
            !(start.getMonth() === end.getMonth()) ||
            !(start.getDate() === end.getDate())
          ) {
            throw new Error ('End and Start must be from same date')
          }
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User, // 'Movies' would also work
        key: 'id'
      }
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: Room, // 'Actors' would also work
        key: 'id'
      }
    },
  })

  return Reservation
}

export default reservation