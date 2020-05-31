import { gql } from 'apollo-server-express';
import userSchema from './user';
import messageSchema from './message';
import trashCanSchema from './trashCan'
import bikeSchema from './bike'
import stationSchema from './station'
import tripSchema from './trip'
import otpSchema from './otp'
import campusSchema from './campus'
import buildingSchema from './building'
import roomSchema from './room'
import reservationsRestrictionSchema from './reservesRestrictions'
import reservationSchema from './reservation'
import csvSchema from './csv'

const linkSchema = gql`
  scalar Date

  scalar JSON

  scalar Schedule

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`

export default [
  linkSchema, 
  userSchema, 
  otpSchema,
  campusSchema,
  buildingSchema,
  roomSchema,
  reservationsRestrictionSchema,
  reservationSchema,
  csvSchema
];