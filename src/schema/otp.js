import { gql } from 'apollo-server-express'

export default gql `
  extend type Mutation{
    createOtp(input: createOtpInput!): Otp!
    deleteExpiredOtps: Boolean!
  }

  type Otp {
    id: ID!
    otp: String!
    createdAt: Date!
  }

  input createOtpInput {
    otp: String!
  }
`