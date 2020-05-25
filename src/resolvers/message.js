import Sequelize from 'sequelize'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authorization'
import pubsub, { EVENTS } from '../subscription'
const toCursorHash = string => Buffer.from(string).toString('base64')

const fromCursorHash = string => Buffer.from(string, 'base64').toString('ascii')

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
      ?
      {
        createdAt: {
          [Sequelize.Op.lt]: fromCursorHash(cursor)
        }
      } 
      : {}
      try {
        const messages = await models.Message.findAll({ 
          order: [['createdAt', 'DESC']],
          where: {...cursorOptions},
          limit: limit + 1, 
        })

        const hasNextPage = messages.length > limit
        const edges = hasNextPage ? messages.slice(0, -1) : messages

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString())
          }
        }
      } catch(err) {
        throw new Error('No se pudo recuperar la información solicitada ', err)
      }
      
    },
    message: (parent, { id }, { models }) => {
      return models.Message.findByPk(id)
    }
  },
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { me, models }) => {
        try {
          const message = await models.Message.create({
            text,
            userId: me.id
          })

          pubsub.publish(EVENTS.MESSAGE.CREATED, {
            messageCreated: { message }
          })

          return message
        } catch (err) {
          throw new Error(err)
        }
      }),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
        return await models.Message.destroy({
          where: {
            id
          }
        })
      })
  },
  Message: {
    user: async (message, args, { models }) => {
      return await models.User.findByPk(message.userId)
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
    }
  }
}