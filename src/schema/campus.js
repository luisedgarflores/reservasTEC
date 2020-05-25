import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    campuses: [Campus!]!
    campus(id: ID!): Campus
  }

  extend type Mutation {
    createCampus(input: createCampusInput!): Campus!
    updateCampus(input: updateCampusInput!): Boolean!
  }

  type Campus{
    id: ID!
    createdAt: Date!
    name: String!
    active: Boolean!
    description: String
  }

  input createCampusInput {
    name: String!
    active: Boolean!
    address: String!
    description: String
  }

  input updateCampusInput {
    id: ID!
    address: String
    name: String
    active: Boolean
    description: String
  }
`