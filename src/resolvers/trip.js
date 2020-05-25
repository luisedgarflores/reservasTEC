import { combineResolvers } from 'graphql-resolvers'
import { isAdmin, isAuthenticated } from './authorization'

export default {
  Query: {
    trips: async (parent, args, { models, me }) => {
      return await models.Trip.findAll()
    },
    trip: async (parent, { id }, { models, me }) => {
      return await models.Trip.findByPk(id)
    }
  },
  Mutation: {
    createTrip: combineResolvers(
      isAuthenticated,
      async (
        parent,
        { input },
        { models, me, sequelize },
      ) => {
        const { bike, departure, arrival, ...rest } = input
        const departure_station = await models.Station.findByPk(departure)
        const arrival_station = await models.Station.findByPk(arrival)
        const bike_for_trip = await models.Bike.findByPk(bike)

        if (departure_station && arrival_station && bike_for_trip) {
          const t = await sequelize.transaction();
          try{
            const trip = await models.Trip.create(
              {
                ...rest,
                userId: me.id
              },
              {
                transaction: t
              }
            )
            await trip.setDeparture(departure_station, { transaction: t })
            await trip.setArrival(arrival_station, { transaction: t })
            await trip.setBike(bike_for_trip, { transaction: t })
            await t.commit()
            return trip
          } catch (err) {
            await t.rollback()
            throw new Error ('No se pudo registrar el viaje')
          }
        }
        throw new Error('No se pudo registrar el viaje')
      }
    )
  },
  Trip: {
    departure: async (
      trip,
      args,
      { models }
    ) => {
      const departure = await trip.getDeparture({ raw: true })
      return departure[0]
    },
    arrival: async (
      trip,
      args,
      { models }
    ) => {
      const arrival = await trip.getArrival({ raw: true })
      return arrival[0]
    },
    user: async (
      trip,
      args,
      { models }
    ) => {
      return models.User.findByPk(trip.userId, { raw: true })
    },
    bike: async (
      trip,
      args,
      { models }
    ) => {
      return await trip.getBike({ raw: true })
    }
  }
}
