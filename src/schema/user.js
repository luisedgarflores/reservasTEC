import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    me: User
    user(id: ID!): User
    users: [User!]
  }

  extend type Mutation {
    signUp(
      username: String!
      email: String!
      password: String!
    ): Token!
    signIn(
      login: String!
      password: String!
    ): Token!
    deleteUser(
      id: ID!
    ): Boolean!
    assignPermission(
      roomId: ID!
      roleId: ID!
    ): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String!
    name: String
    role: String
    age: Int
    country: String
    email: String!
  }
`