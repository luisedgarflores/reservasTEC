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
import { GraphQLDateTime } from 'graphql-iso-date'

const customScalarResolver = {
  Date: GraphQLDateTime,
  Schedule: {
    start: Date,
    end: Date
  }
}


export default [
  customScalarResolver,
  userResolvers, 
  //messageResolvers, 
  //trashCanRessolvers, 
  //bikeResolvers,
  //stationResolvers,
  //tripResolvers,
  otpResolvers,
  buildingResolvers,
  campusResolvers,
  roomResolvers,
  reserveRestrictionResolvers,
]