import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    stations: [Station!]!
    station(id: ID!): Station
  }

  extend type Mutation {
    createStation(input: createStationInput!): Station!
  }

  type Station{
    id: ID!
    createdAt: Date!
    latitude: String
    longitude: String
    name: String!
    capacity: Int
    available: Boolean!
  }

  input createStationInput {
    latitude: String
    longitude: String
    name: String!
    capacity: Int
    available: Boolean!
  }
`