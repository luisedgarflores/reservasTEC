import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    bikes: [Bike!]!
    bike(id: ID!): Bike
  }

  extend type Mutation {
    createBike(input: createBikeInput!): Bike!
  }

  type Bike{
    id: ID!
    createdAt: Date!
    latitude: String
    longitude: String
    name: String!
    locked: Boolean!
    speed: Float
    available: Boolean!
    station: Station
  }

  input createBikeInput {
    latitude: String
    longitude: String
    name: String!
    locked: Boolean!
    speed: Float
    available: Boolean!
  }
`