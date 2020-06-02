import 'dotenv/config'
import http from 'http'
import cors from 'cors';
import express from 'express'
import { ApolloServer, UserInputError, AuthenticationError } from 'apollo-server-express'
import mongoose from 'mongoose';
import csvModel from './mongoDBModels/csv'
import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'
import modelsmysql, { sequelizemysql } from './modelsMySQL'
import jwt from 'jsonwebtoken'
const nodemailer = require('nodemailer');
import bodyParser from 'body-parser'
const port = process.env.PORT;
const app = express()
const erase_database_on_restart = true
app.use(cors(), bodyParser.json({ limit: '50mb' }))

async function createTransporter() {
  const transporter = await nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'ReservasTecPuebla@gmail.com',
      pass: 'TecCampusPuebla-2020'
    }
  });
  return transporter
}

mongoose.connect('mongodb+srv://luisflores:DeaYFvdMYHCUk4fr@reservas-urneb.mongodb.net/test?retryWrites=true&w=majority');

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        modelsmysql
      }
    }

    if (req) {
      const me = await getMe(req);
      const transporter = await createTransporter()
      return {
        models,
        modelsmysql,
        sequelizemysql,
        me,
        secret: process.env.SECRET,
        sequelize,
        transporter,
        modelsMongoDB: {
          csvModel
        }
      }
    }
  }
})

server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)


sequelizemysql.sync({ force: erase_database_on_restart, alter: true }).then(async () => {
  return
}).then()


sequelize.sync({ force: erase_database_on_restart, alter: true }).then(async () => {
  if (erase_database_on_restart) {
    await csvModel.deleteMany()
    create_user_with_messages(new Date())
  }
    
  httpServer.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
});

const create_user_with_messages = async (date) => {
  const userRole = await models.Role.create({
    role: "ADMIN"
  })
  await models.User.create(
    {
      username: 'luisflores',
      name: 'Luis Edgar Flores',
      role: 'ADMIN',
      age: 20,
      email: 'luisedgarflorescarpinteyro@gmail.com',
      password: '1234567',
      roleId: userRole.id,
    },
  )
  await models.Campus.create(
    {
      name: "campus 1",
      active: true,
    },
  )
  await models.Building.create(
    {
      name: 'nuevo edificio',
      active: true,
      campusId: 1
    },
  )
  await models.Room.create(
    {
      buildingId: 1,
      name: 'salon 1',
      capacity: 50,
      active: true
    }
  )
  await models.ReservesPermissions.create(
    {
      roomId: 1,
      roleId: 1,
    }
  )

  await modelsmysql.ReservationRestriction.create(
    {
      roomId: 1,
      start: new Date ("2020-05-27T20:30:00.521Z"),
      end: new Date ("2020-05-27T20:45:00.521Z")
    }
  )
}

const getMe = async (req) => {
  const token = req.headers['x-token']
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET)
    } catch (err) {
      throw new AuthenticationError('Your session expired. Sign in again')
    }
  }
}