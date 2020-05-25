import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'

export default {
  Query: {
    trashCans: async (parent, args, { models, me }) => {
      return await models.TrashCan.findAll()
    },
    trashCan: async (parent, { id }, { models, me }) => {
      return await models.TrashCan.findByPk( id )
    }
  },
  Mutation: {
    createTrashCan: combineResolvers(
      isAdmin, 
      async(
        parent,
        { input },
        { models }
      ) => {
        return models.TrashCan.create({...input})
      }
    )
  },
}
