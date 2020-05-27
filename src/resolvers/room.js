import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'
import Sequelize from 'sequelize'

const checkInvalidDates = ({end, start}) => {
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

const lookForConcurrentDates = async (start, end, modelsmysql, roomsIds, t) => {
  const reservationRestrictions = await modelsmysql.ReservationRestriction.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId: {
              [Sequelize.Op.or]: roomsIds
            }
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
      attributes:  ['roomId'],
      raw: true
    },
    {
      transaction: t
    }
  )
  return reservationRestrictions
}

const lookForConcurrentReservations = async (start, end, models, roomsIds, t) => {
  const concurrentReservations = await models.Reservation.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId: {
              [Sequelize.Op.or]: roomsIds
            }
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
      attributes: ['roomId'],
      raw: true
    },
    { transaction: t }
  )
  return concurrentReservations
}


const roomConcurrencyFilter = (room, roomsConcurrent) => {
  if (roomsConcurrent.includes(room.id)) {
    return false
  } else {
    return true
  }
}

export default {
  Query: {
    rooms: async (parent, args, { models, me }) => {
      return await models.Room.findAll()
    },
    room: async (parent, { id }, { models, me }) => {
      return await models.Room.findByPk(id)
    },
    bookableRooms: async (
      parent,
      { filter },
      {
        models,
        me,
        sequelize,
        modelsmysql
      }
    ) => {
      const t = await sequelize.transaction()
      try {
        const role = await models.Role.findByPk(me.roleId, { include: models.Room })

        let rooms = await role.getRooms(
          {
            where: {
              [Sequelize.Op.and]: [
                filter && filter.capacity && { capacity: { [Sequelize.Op.gte]: filter.capacity } },
                filter && filter.building && !filter.campus && { buildingId: filter.building },
                filter && filter.campus && !filter.building && { campusId: filter.campus },
                filter && filter.name && { name: { [Sequelize.Op.regexp]: filter.name } }
              ]
            },
          }
        )

        const roomsIds = rooms.map(room => room.id)

        const notAvailableRooms = []


        if (filter.dates) {
          for (let i = 0; i < filter.dates.length; i++) {
            if (checkInvalidDates(filter.dates[i])) {
              throw new Error('Dates must belong to same day')
            }
            Array.prototype.push.apply(notAvailableRooms, await lookForConcurrentDates(filter.dates[i].start, filter.dates[i].end, modelsmysql, roomsIds,t))  

            Array.prototype.push.apply(notAvailableRooms,
              await lookForConcurrentReservations(
                filter.dates[i].start,
                filter.dates[i].end,
                models,
                roomsIds,
                t
              )
            )
          }
        }

        const notAvailableRoomsIds = notAvailableRooms.map(room => room.roomId)

        rooms = rooms.filter( room => roomConcurrencyFilter(room, notAvailableRoomsIds) );

        t.commit()
        return rooms
      } catch (err) {
        t.rollback()

        return err
      }
    }
  },
  Mutation: {
    createRoom: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models, sequelize }
      ) => {
        const { buildingId, ...rest } = input
        const t = await sequelize.transaction()
        try {
          const building = await models.Building.findByPk(buildingId)

          if (!building) {
            throw new Error('Building was not found')
          }

          const room = await models.Room.create(
            {
              ...input,
            },
            {
              transaction: t
            }
          )
          t.commit()

          return room
        } catch (err) {
          await t.rollback()

          return err
        }
      }
    ),
    updateRoom: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models, sequelize }
      ) => {
        const { id, buildingId, ...rest } = input
        const t = await sequelize.transaction()

        try {
          const room = await models.Room.findByPk(id)
          const building = await models.Building.findByPk(buildingId)

          if (!room) {
            throw new Error('Room was not found')
          }

          if (!building) {
            throw new Error('Building was not found')
          }

          await room.update(
            {
              ...rest,
            },
            {
              transaction: t
            }
          )
          t.commit()

          return true
        } catch (err) {
          t.rollback()

          return err
        }
      }
    ),
  },
  Room: {
    building: async (room, args, { models }) => {
      return await models.Building.findByPk(room.buildingId)
    },
    campus: async (room, args, { models }) => {
      const building = await models.Building.findByPk(room.buildingId)
      return await models.Campus.findByPk(building.campusId)
    }
  }
}
