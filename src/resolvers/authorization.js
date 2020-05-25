import { ForbiddenError } from 'apollo-server'
import { skip, combineResolvers } from 'graphql-resolvers'

export const isAuthenticated = (parent, args, { me }) => {
  me ? skip : new ForbiddenError('No se ha autenticado como usuario.')
}

export const isMessageOwner = async (
  parent,
  { id },
  { models, me }
) => {
  const message = await models.Message.findByPk(id, { raw: true })

  if (message.userId !== me.id) {
    throw new ForbiddenError('No autenticado como dueno.')
  }

  return skip
}

export const isAdmin = combineResolvers(isAuthenticated, async (
  parent,
  args,
  { models, me }
) => {
  const userRole = await models.Role.findByPk(me.roleId)
  if (userRole.role !== 'ADMIN') {
    throw new ForbiddenError('No autenticado como administrador')
  }
  return skip
})

export const canReserve = combineResolvers(isAuthenticated, async (
  parent,
  args,
  { models, me }
) => {
  const userRole = await models.Role.findByPk(me.roleId)
  if (
    userRole.role !== 'ADMIN' ||
    userRole.role !== 'TEACHER' ||
    userRole.role !== 'COLLABORATOR' ||
    userRole.role !== 'EVENTS'
  ) {
    throw new ForbiddenError('No puedes hacer reservaciones')
  }
  return skip
})

