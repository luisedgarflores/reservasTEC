import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'
import Sequelize from 'sequelize'
export default {
  Mutation: {
    deleteExpiredOtps: async (
      parent,
      args,
      { models }
    ) => {
      const current_date = new Date()
      current_date.setTime(current_date.getTime() - 600000)
      return await models.Otp.destroy(
        {
          where: {
            createdAt: {
              [Sequelize.Op.lt]: current_date
            }
          }
        }
      )
    },
    createOtp: async (
      parent,
      { input }, 
      { models, sequelize }
    ) => {
      return await models.Otp.create({...input})
    }
  }
}