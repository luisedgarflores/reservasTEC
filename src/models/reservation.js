import User from './user'
import Room from './room'

const reservation = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('reservation', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    start: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          args: true,
          msg: "Not empty start allowed"
        },
      }
    },
    end: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          args: true,
          msg: "Not empty end allowed"
        },
        isGreaterThanStart(value) {
          if (new Date(value) <= new Date(this.start)) {
            throw new Error('End must be greater than start.');
          }
        },
        isFromSameDate(value) {
          if (
            !(this.start.getFullYear() === value.getFullYear()) ||
            !(this.start.getMonth() === value.getMonth()) ||
            !(this.start.getDate() === value.getDate())
          ) {
            throw new Error('End and Start must be from same date')
          }
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User, // 'Movies' would also work
        key: 'id'
      },
      unique: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: Room, // 'Actors' would also work
        key: 'id'
      },
      unique: false,
    },
  })

  return Reservation
}

export default reservation