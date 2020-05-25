import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    trips: [Trip!]!
    trip(id: ID!): Trip
  }

  extend type Mutation {
    createTrip(input: createTripInput!): Trip!
  }

  type Trip{
    id: ID!
    createdAt: Date!
    duration: Float!
    bike: Bike
    departure: Station
    arrival: Station
    user: User!
  }

  input createTripInput {
    duration: Float!
    bike: ID
    departure: ID!
    arrival: ID!
  }
`