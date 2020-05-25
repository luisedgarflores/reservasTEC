import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'
import Sequelize from 'sequelize'

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
        const role = await models.Role.findByPk(me.roleId, {include: models.Room})

        const rooms = await role.getRooms(
          {
            where: {
              [Sequelize.Op.and]: [
                filter && filter.capacity && {capacity: {[Sequelize.Op.gte]: filter.capacity}},
                filter && filter.building && !filter.campus && {buildingId: filter.building},
                filter && filter.campus && !filter.building && {campusId: filter.campus},
                filter && filter.name && {name: {[Sequelize.Op.regexp]: filter.name}}
              ]
            },
          }
        )

        const roomsIds = rooms.map(room => {
          return {
            roomId: room.id
          }
        })

        const reservationRestrictions = await modelsmysql.ReservationRestriction.findAll(
          {
            where: {
              [Sequelize.Op.or]: roomsIds
            }
          }
        )

        console.log(reservationRestrictions)

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
