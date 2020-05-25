import jwt from 'jsonwebtoken'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authorization'
import { sendEmail } from './emailSender'

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, roleId } = user
  return await jwt.sign({ id, email, username, roleId }, secret, {
    expiresIn
  })
}

export default {
  Query: {
    me: async (parent, args, { models, me }) => {
      if (!me)
        return null
      return await models.User.findByPk(me.id)
    },
    user: async (parent, { id }, { models }) => {
      return await models.User.findByPk(id)
    },
    users: async (parent, args, { models }) => {
      return await models.User.findAll()
    }
  },
  Mutation: {
    signUp: async (
      parent,
      { email, password, username },
      { models, secret }
    ) => {
      const user = await models.User.create({
        username,
        email,
        password
      })
      return { token: createToken(user, secret, '30m') }
    },
    signIn: async (
      parent,
      { login, password },
      { models, secret, transporter }
    ) => {
      const user = await models.User.findByLogin(login)
      //const mail = await sendEmail('Este es un mensaje de prueba de una reserva', 'Prueba de servidor correo', 'a01328387@itesm.mx', transporter)
      //console.log(mail)
      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials'
        )
      }

      const isValid = await user.validatePassword(password)

      if (!isValid) {
        throw new AuthenticationError('Invalid password')
      }

      return {token: createToken(user, secret, '600m')}
    },
    deleteUser: combineResolvers(isAdmin, async (
      parent, 
      { id }, 
      { models, me }
    ) => {
      return await models.User.destroy({ 
        where: { 
          id 
        } 
      })
    }),
    assignPermission: combineResolvers(
      isAdmin,
      async(
        parent, 
        { roomId, roleId },
        { models, me, sequelize }
      ) => {
        const t = await sequelize.transaction()
        try {
          await models.ReservesPermissions.create(
            {
              roomId,
              roleId
            }
          )
          await t.commit()
          
          return true
        } catch (err) {
          await t.rollback()
          return err
        }
      }
    )
  },
}
