import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'

export default {
  Query: {
    campuses: async (parent, args, { models, me }) => {
      return await models.Campus.findAll()
    },
    campus: async (parent, { id }, { models, me }) => {
      return await models.Campus.findByPk(id)
    }
  },
  Mutation: {
    createCampus: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models, sequelize }
      ) => {
        const t = await sequelize.transaction()
        try {
          const campus = await models.Campus.create(
            {
              ...input,
            },
            {
              transaction: t
            }
          )
          t.commit()
          return campus
        } catch (err) {
          await t.rollback()
          return err
        }
      }
    ),
    updateCampus: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models, sequelize }
      ) => {
        const { id, ...rest } = input
        const t = await sequelize.transaction()
        try {
          const campus = await models.Campus.findByPk(id)
          if (!campus) {
            throw new Error('Campus was not found')
          }
          await campus.update(
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
