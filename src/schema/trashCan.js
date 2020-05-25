import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    trashCans: [TrashCan!]!
    trashCan(id: ID!): TrashCan
  }

  extend type Mutation {
    createTrashCan(input: createTrashCanInput!): TrashCan!
  }

  type TrashCan{
    id: ID!
    createdAt: Date!
    latitude: String
    longitude: String
    name: String!
  }

  input createTrashCanInput {
    latitude: String
    longitude: String
    name: String!
  }
`