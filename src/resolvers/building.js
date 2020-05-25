import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'

export default {
  Query: {
    buildings: async (parent, args, { models, me }) => {
      return await models.Building.findAll()
    },
    building: async (parent, { id }, { models, me }) => {
      return await models.Building.findByPk(id)
    }
  },
  Mutation: {
    createBuilding: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models, sequelize }
      ) => {
        const { campusId, ...rest } = input
        const t = await sequelize.transaction()
        try {
          const campus = await models.Campus.findByPk(campusId)

          if (!campus) {
            throw new Error('Campus was not found')
          }

          const building = await models.Building.create(
            {
              ...input,
            },
            {
              transaction: t
            }
          )
          t.commit()

          return building
        } catch (err) {
          await t.rollback()

          return err
        }
      }
    ),
    updateBuilding: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models, sequelize }
      ) => {
        const { id, campusId, ...rest } = input
        const t = await sequelize.transaction()

        try {
          const building = await models.Building.findByPk(id)
          const campus = await models.Campus.findByPk(campusId)

          if (!building) {
            throw new Error('Building was not found')
          }

          if (!campus) {
            throw new Error('Campus was not found')
          }

          await building.update(
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
  }
}
