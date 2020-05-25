import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    reservationsRestrictions: [ReservationRestriction]!
    reservationsRestrictionsFromRoom(id: ID!): [ReservationRestriction]!
  }

  extend type Mutation {
    createReservationRestriction(input: createReserveRestrictionInput!): ReservationRestriction!
    updateReservationRestriction(input: updateReserveRestrictionInput!): Boolean!
    deleteReserveRestriction(input: deleteReserveRestrictionInput!): Boolean!
  }

  type ReservationRestriction{
    id: ID!
    createdAt: Date!
    start: Date!
    end: Date!
    room: Room!
  }

  input updateReserveRestrictionInput {
    id: ID!
    start: Date!
    end: Date!
    roomId: ID!
  }

  input createReserveRestrictionInput {
    start: Date!
    end: Date!
    roomId: ID!
  }

  input deleteReserveRestrictionInput {
    id: ID!
  }
`