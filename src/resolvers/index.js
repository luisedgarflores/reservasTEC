import userResolvers from '../resolvers/user'
import messageResolvers from '../resolvers/message'
import trashCanRessolvers from '../resolvers/trashCan'
import bikeResolvers from '../resolvers/bike'
import stationResolvers from '../resolvers/station'
import tripResolvers from '../resolvers/trip'
import otpResolvers from '../resolvers/otp'
import campusResolvers from '../resolvers/campus'
import buildingResolvers from '../resolvers/building'
import roomResolvers from '../resolvers/room'
import reserveRestrictionResolvers from '../resolvers/reservesRestrictions'
import reservationResolvers from '../resolvers/reservation'
import csvResolvers from '../resolvers/csv'
import { GraphQLDateTime } from 'graphql-iso-date'
import GraphQLJSON from 'graphql-type-json';

const customScalarResolver = {
  Date: GraphQLDateTime,
  JSON: GraphQLJSON,
  Schedule: {
    start: Date,
    end: Date
  }
}


export default [
  customScalarResolver,
  userResolvers, 
  otpResolvers,
  buildingResolvers,
  campusResolvers,
  roomResolvers,
  reserveRestrictionResolvers,
  reservationResolvers,
  csvResolvers
]