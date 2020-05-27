import { combineResolvers } from "graphql-resolvers";
import { isAdmin, isAuthenticated } from "./authorization";
import Sequelize from 'sequelize'

const checkInvalidDates = ({ end, start }) => {
  end = new Date(end)
  start = new Date(start)

  if (!(start instanceof Date) || isNaN(start)) {
    return true
  }


  if (!(end instanceof Date) || isNaN(end)) {
    return true
  }

  if (
    !(start.getFullYear() === end.getFullYear()) ||
    !(start.getMonth() === end.getMonth()) ||
    !(start.getDate() === end.getDate())
  ) {
    return true
  } else {
    return false
  }
}

const lookForConcurrentDates = async (start, end, modelsmysql, roomId, t) => {
  const reservationRestrictions = await modelsmysql.ReservationRestriction.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId
          },
          {
            [Sequelize.Op.or]: [
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: end
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: end
                    }
                  }
                ]
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: start
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: start
                    }
                  }
                ]
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: start
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: end
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      attributes: ['start', 'end'],
      raw: true
    },
    { transaction: t }
  )
  return reservationRestrictions
}

const lookForConcurrentReservations = async (start, end, models, roomId, t) => {
  const concurrentReservations = await models.Reservation.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId
          },
          {
            [Sequelize.Op.or]: [
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: end
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: end
                    }
                  }
                ]
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: start
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: start
                    }
                  }
                ]
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: start
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: end
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      attributes: ['start', 'end'],
      raw: true
    },
    { transaction: t }
  )
  return concurrentReservations
}

const lookForConcurrentReservationsUpdate = async (start, end, models, roomId, reservationId, t) => {
  const concurrentReservations = await models.Reservation.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId
          },
          {
            [Sequelize.Op.or]: [
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: end
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: end
                    }
                  }
                ]
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: start
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: start
                    }
                  }
                ]
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: start
                    }
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: end
                    }
                  }
                ]
              }
            ]
          },
          {
            id: {
              [Sequelize.Op.not]: reservationId
            }
          }
        ]
      },
      attributes: ['start', 'end'],
      raw: true
    },
    { transaction: t }
  )
  return concurrentReservations
}

const ckCncrDtsFrmIn =(inDts, start, end, currIdx) => {
  for (let i = 0; i < inDts.length; i++) {
    const old = inDts[i];
    if (i !== currIdx) {
      if (
        (end >= old.start && end <= old.end) || 
        (start >= old.start && start<= old.end) ||
        (start <= old.start && end>= old.end)
      ) {
        return true
      }
    }
  }
  return false
}

export default {
  Query: {
    reservations: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, me }) => {
        return await models.Reservation.findAll();
      },
    ),
    reservation: combineResolvers(
      isAuthenticated,
      async (parent, { id }, { models, me }) => {
        const reservation = await models.Reservation.findAll(
          {
            where: {
              id,
            },
            raw: true
          },
        );
        return reservation;
      }
    ),
    myReservations: combineResolvers(
      isAuthenticated,
      async (parent, input, { models, me, modelsmysql, sequelizemysql }) => {
        const reservations = await models.Reservation.findAll(
          {
            where: {
              userId: me.id,
            },
            raw: true
          }
        );
        return reservations;
      }
    ),
  },
  Mutation: {
    createReservation: combineResolvers(
      isAuthenticated,
      async (parent, { input }, { models, sequelize, modelsmysql, sequelizemysql, me }) => {
        const t = await sequelize.transaction();
        try {
          const room = await models.Room.findByPk(input.roomId, { transaction: t })
          if (input.dates.lenght <= 0) {
            throw new Error('Cannot make a reservation without dates')
          }

          if (!room) {
            throw new Error('The room was not found')
          }

          const notAvailableDates = []

          for (let i = 0; i < input.dates.length; i++) {
            if (checkInvalidDates(input.dates[i])) {
              throw new Error('Dates must belong to same day')
            }

            if (ckCncrDtsFrmIn(input.dates, input.dates[i].start, input.dates[i].end, i)) {
              throw new Error('Input dates cannot be concurrent')
            }

            Array.prototype.push.apply(
              notAvailableDates,
              await lookForConcurrentDates(
                input.dates[i].start,
                input.dates[i].end,
                modelsmysql,
                input.roomId,
                t
              )
            )

            Array.prototype.push.apply(notAvailableDates,
              await lookForConcurrentReservations(
                input.dates[i].start,
                input.dates[i].end,
                models,
                input.roomId,
                t
              )
            )
          }

          if (notAvailableDates.length > 0) {
            throw new Error(`The following dates are not current available for room ${room.name}: ${JSON.stringify(notAvailableDates)}`)
          }


          const reservations = []

          for (let i = 0; i < input.dates.length; i++) {
            reservations.push(await models.Reservation.create(
              {
                userId: me.id,
                roomId: input.roomId,
                start: new Date(input.dates[i].start),
                end: new Date(input.dates[i].end)
              },
              {
                transaction: t
              }
            ))
          }

          await t.commit()

          return reservations

        } catch (err) {
          await t.rollback()
          return err
        }
      }
    ),
    updateReservation: combineResolvers(
      isAuthenticated,
      async (parent, { input }, { models, modelsmysql, sequelize, me }) => {
        const t = await sequelize.transaction();
        try {
          const room = await models.Room.findByPk(input.roomId, { transaction: t })
          const reservation = await models.Reservation.findByPk(input.id, { transaction: t })

          if (!input.start || !input.end) {
            throw new Error('Cannot make a reservation without dates')
          }

          if (checkInvalidDates(input)){
            throw new Error('Dates must belong to same day')
          }

          if (!room) {
            throw new Error('The room was not found')
          }

          if (!reservation) {
            throw new Error('The reservation was not found')
          }

          const notAvailableDates = []

          Array.prototype.push.apply(
            notAvailableDates,
            await lookForConcurrentDates(
              input.start,
              input.end,
              modelsmysql,
              input.roomId,
              t
            )
          )

          Array.prototype.push.apply(notAvailableDates,
            await lookForConcurrentReservationsUpdate(
              input.start,
              input.end,
              models,
              input.roomId,
              input.id,
              t
            )
          )

          if (notAvailableDates.length > 0) {
            throw new Error(`The following dates are not current available for room ${room.name}: ${JSON.stringify(notAvailableDates)}`)
          }

          const updatedReservation = await models.Reservation.update(
            {
              userId: me.id,
              roomId: input.roomId,
              start: new Date(input.start),
              end: new Date(input.end)
            },
            {
              where: {
                id: input.id
              }
            },
            { transaction: t }
          )

          return true
        } catch (err) {
          await t.rollback()
          return err
        }
      }
    ),
    deleteReservation: combineResolvers(
      isAuthenticated,
      async (parent, { input }, { models, sequelizemysql, me }) => {
        const t = await sequelizemysql.transaction()
        try {
          const myReservation = await models.Reservation.findOne({
            where: {
              [Sequelize.Op.and]: [
                { id: input.id },
                { userId: me.id }
              ]
            }
          })

          if (!myReservation) {
            throw new Error('The reservation was not found')
          }

          await models.Reservation.destroy(
            {
              where: {
                id: input.id
              }
            },
            {
              transaction: t
            }
          )
          return true
        } catch (err) {
          await t.rollback()
          return err
        }
      }
    ),
  },
  Reservation: {
    user: async (reservation, args, { models }) => {
      if (Array.isArray(reservation) && reservation.length > 0) {
        return await models.User.findOne({
          where: { id: parseInt(reservation[0].userId) },
        });
      } else if (typeof reservation === "object") {
        return await models.User.findOne({
          where: { id: parseInt(reservation.userId) },
        });
      }
    },
    room: async (reservation, args, { models }) => {
      if (Array.isArray(reservation) && reservation.length > 0) {
        return await models.Room.findOne({
          where: { id: parseInt(reservation[0].roomId) },
        });
      } else if (typeof reservation === "object") {
        return await models.Room.findOne({
          where: { id: parseInt(reservation.roomId) },
        });
      }
    },
  },
};
