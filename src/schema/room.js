import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    rooms: [Room!]
    bookableRooms(filter: roomsFilter): [Room!]
    room(id: ID!): Room
  }

  extend type Mutation {
    createRoom(input: createRoomInput!): Room!
    updateRoom(input: updateRoomInput!): Boolean!
  }

  type Room {
    id: ID!
    createdAt: Date!
    name: String!
    active: Boolean!
    description: String
    capacity: Int!
    building: Building!
    campus: Campus!
  }

  input createRoomInput {
    name: String!
    active: Boolean!
    description: String
    buildingId: ID!
    capacity: Int!
  }

  input updateRoomInput {
    id: ID!
    name: String
    buildingId: ID
    active: Boolean
    description: String
    capacity: Int
  }

  input roomsFilter {
    id: ID
    name: String
    active: Boolean
    description: String
    capacity: Int
    building: ID
    campus: ID
    dates: [Schedule!]
  }

`