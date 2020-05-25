import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    buildings: [Building!]!
    building(id: ID!): Building
  }

  extend type Mutation {
    createBuilding(input: createBuildingInput!): Building!
    updateBuilding(input: updateBuildingInput!): Boolean!
  }

  type Building{
    id: ID!
    createdAt: Date!
    name: String!
    active: Boolean!
    description: String
  }

  input createBuildingInput {
    name: String!
    active: Boolean!
    description: String
    campusId: ID!
    floors: Int
  }

  input updateBuildingInput {
    id: ID!
    name: String
    campusId: ID
    active: Boolean
    description: String
    floors: Int
  }
`