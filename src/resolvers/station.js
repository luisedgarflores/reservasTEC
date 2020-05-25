import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'

export default {
  Query: {
    stations: async (parent, args, { models, me }) => {
      return await models.Station.findAll()
    },
    station: async (parent, { id }, { models, me }) => {
      return await models.Station.findByPk( id )
    }
  },
  Mutation: {
    createStation: combineResolvers(
      isAdmin, 
      async(
        parent,
        { input },
        { models }
      ) => {
        return models.Station.create({...input})
      }
    )
  },
}
