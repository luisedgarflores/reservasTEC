import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'

export default {
  Query: {
    bikes: async (parent, args, { models, me }) => {
      return await models.Bike.findAll()
    },
    bike: async (parent, { id }, { models, me }) => {
      return await models.Bike.findByPk(id)
    }
  },
  Mutation: {
    createBike: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { models }
      ) => {
        return models.Bike.create({
          ...input,
          idStation: input.station
        })
      }
    )
  },
  Bike: {
    station: async (
      bike,
      args,
      { models }
    ) => {
      return models.Station.findOne({ where: { id: bike.stationId } })
    }
  }
}
