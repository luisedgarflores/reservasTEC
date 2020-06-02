import { gql } from 'apollo-server-express'


export default gql`
  extend type Query {
    CSVS: [Csv!]!
    CSV(id: ID!): Csv
  }

  extend type Mutation {
    createCSV(input: createCSVInput!): Csv!
  }

  type Csv{
    id: ID!
    createdAt: Date!
    information: String!
  }

  input createCSVInput {
    information: String!
  }
`