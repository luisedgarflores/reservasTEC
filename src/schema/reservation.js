import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    reservation(id: ID!): [Reservation]!
    reservations(filter: reservationsFilter): [Reservation!]
    myReservations(filter: reservationsFilter): [Reservation!]
  }

  extend type Mutation {
    createReservation(input: createReservationInput!): [Reservation!]!
    updateReservation(input: updateReservationInput!): Boolean!
    deleteReservation(input: deleteReservationInput!): Boolean!
  }

  type Reservation{
    id: ID!
    createdAt: Date!
    start: Date!
    end: Date!
    room: Room!
    user: User!
  }

  input updateReservationInput {
    id: ID!
    start: Date!
    end: Date!
    roomId: ID!
  }

  input createReservationInput {
    dates: [Schedule!]!
    roomId: ID!
  }

  input deleteReservationInput {
    id: ID!
  }

  input reservationsFilter {
    id: ID
    roomId: ID!
    period: [Schedule!]
  }
`