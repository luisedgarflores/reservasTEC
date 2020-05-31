import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'

export default {
  Query: {
    CSVS: async (parent, args, { modelsMongoDB, me }) => {
      const records = await modelsMongoDB.csvModel.find().exec()
      console.log(records)
      return records
    },
    CSV: async (parent, { id }, { modelsMongoDB, me }) => {
      return await modelsMongoDB.csvModel.findById({_id: id}).exec()
    }
  },
  Mutation: {
    createCSV: combineResolvers(
      isAdmin,
      async (
        parent,
        { input },
        { modelsMongoDB }
      ) => {
        const csv = await modelsMongoDB.csvModel.create({information: input.information})
        return csv
      }
    )
  }
}
