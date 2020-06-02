import { combineResolvers } from "graphql-resolvers";
import { isAdmin, isAuthenticated } from "./authorization";
import Sequelize from "sequelize";
import { sendEmail } from './emailSender'

const dayFrmDt =  {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

const fmtTime = (date) => {
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

const monthFrmDt = {
  0: 'Enero',
  1: 'Ferero',
  2: 'Marzo',
  3: 'Abril',
  4: 'Mayo',
  5: 'Junio',
  6: 'Julio',
  7: 'Agosto',
  8: 'Septiembre',
  9:  'Octubre',
  10: 'Noviembre',
  11: 'Diciembre',
}

const fmtDt = (date) => {
  return `${dayFrmDt[date.getDay()]} ${date.getDate()} de ${monthFrmDt[date.getMonth()]} del ${date.getFullYear()}`
}



const checkInvalidDates = ({ end, start }) => {
  end = new Date(end);
  start = new Date(start);

  if (!(start instanceof Date) || isNaN(start)) {
    return true;
  }

  if (!(end instanceof Date) || isNaN(end)) {
    return true;
  }

  if (
    !(start.getFullYear() === end.getFullYear()) ||
    !(start.getMonth() === end.getMonth()) ||
    !(start.getDate() === end.getDate())
  ) {
    return true;
  } else {
    return false;
  }
};

const lookForConcurrentDates = async (start, end, modelsmysql, roomId, t) => {
  const reservationRestrictions = await modelsmysql.ReservationRestriction.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId,
          },
          {
            [Sequelize.Op.or]: [
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: end,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: end,
                    },
                  },
                ],
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: start,
                    },
                  },
                ],
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: end,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      attributes: ["start", "end"],
      raw: true,
    },
    { transaction: t }
  );
  return reservationRestrictions;
};

const lookForConcurrentReservations = async (start, end, models, roomId, t) => {
  const concurrentReservations = await models.Reservation.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId,
          },
          {
            [Sequelize.Op.or]: [
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: end,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: end,
                    },
                  },
                ],
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: start,
                    },
                  },
                ],
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: end,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      attributes: ["start", "end"],
      raw: true,
    },
    { transaction: t }
  );
  return concurrentReservations;
};

const lookForConcurrentReservationsUpdate = async (
  start,
  end,
  models,
  roomId,
  reservationId,
  t
) => {
  const concurrentReservations = await models.Reservation.findAll(
    {
      where: {
        [Sequelize.Op.and]: [
          {
            roomId,
          },
          {
            [Sequelize.Op.or]: [
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: end,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: end,
                    },
                  },
                ],
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.lte]: start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.gte]: start,
                    },
                  },
                ],
              },
              {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: end,
                    },
                  },
                ],
              },
            ],
          },
          {
            id: {
              [Sequelize.Op.not]: reservationId,
            },
          },
        ],
      },
      attributes: ["start", "end"],
      raw: true,
    },
    { transaction: t }
  );
  return concurrentReservations;
};

const ckCncrDtsFrmIn = (inDts, start, end, currIdx) => {
  for (let i = 0; i < inDts.length; i++) {
    const old = inDts[i];
    if (i !== currIdx) {
      if (
        (end >= old.start && end <= old.end) ||
        (start >= old.start && start <= old.end) ||
        (start <= old.start && end >= old.end)
      ) {
        return true;
      }
    }
  }
  return false;
};

export default {
  Query: {
    reservations: combineResolvers(
      isAuthenticated,
      async (parent, { filter }, { models, me }) => {
        return await models.Reservation.findAll({
          where: {
            [Sequelize.Op.and]: [
              filter && filter.roomId && { roomId: filter.roomId },
              filter && filter.id && { id: filter.id },
              filter &&
              filter.period && {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: filter.period.start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: filter.period.end,
                    },
                  },
                ],
              },
            ],
          },
        });
      }
    ),
    reservation: combineResolvers(
      isAuthenticated,
      async (parent, { id }, { models, me }) => {
        const reservation = await models.Reservation.findAll({
          where: {
            id,
          },
          raw: true,
        });
        return reservation;
      }
    ),
    myReservations: combineResolvers(
      isAuthenticated,
      async (
        parent,
        { filter },
        { models, me, modelsmysql, sequelizemysql }
      ) => {
        const reservations = await models.Reservation.findAll({
          where: {
            [Sequelize.Op.and]: [
              filter && filter.roomId && { roomId: filter.roomId },
              filter && filter.id && { id: filter.id },
              filter &&
              filter.period && {
                [Sequelize.Op.and]: [
                  {
                    start: {
                      [Sequelize.Op.gte]: filter.period.start,
                    },
                  },
                  {
                    end: {
                      [Sequelize.Op.lte]: filter.period.end,
                    },
                  },
                ],
              },
              {
                userId: me.id,
              },
            ],
          },
          raw: true,
        });
        return reservations;
      }
    ),
  },
  Mutation: {
    createReservation: combineResolvers(
      isAuthenticated,
      async (
        parent,
        { input },
        { models, sequelize, modelsmysql, sequelizemysql, me, transporter }
      ) => {
        const t = await sequelize.transaction();
        try {
          const room = await models.Room.findByPk(input.roomId, {
            transaction: t,
          });
          if (input.dates.lenght <= 0) {
            throw new Error("Cannot make a reservation without dates");
          }

          if (!room) {
            throw new Error("The room was not found");
          }

          const notAvailableDates = [];

          for (let i = 0; i < input.dates.length; i++) {
            if (checkInvalidDates(input.dates[i])) {
              throw new Error("Dates must belong to same day");
            }

            if (
              ckCncrDtsFrmIn(
                input.dates,
                input.dates[i].start,
                input.dates[i].end,
                i
              )
            ) {
              throw new Error("Input dates cannot be concurrent");
            }

            Array.prototype.push.apply(
              notAvailableDates,
              await lookForConcurrentDates(
                input.dates[i].start,
                input.dates[i].end,
                modelsmysql,
                input.roomId,
                t
              )
            );

            Array.prototype.push.apply(
              notAvailableDates,
              await lookForConcurrentReservations(
                input.dates[i].start,
                input.dates[i].end,
                models,
                input.roomId,
                t
              )
            );
          }

          if (notAvailableDates.length > 0) {
            throw new Error(
              `The following dates are not current available for room ${
              room.name
              }: ${JSON.stringify(notAvailableDates)}`
            );
          }

          const reservations = [];

          for (let i = 0; i < input.dates.length; i++) {
            reservations.push(
              await models.Reservation.create(
                {
                  userId: me.id,
                  roomId: input.roomId,
                  start: new Date(input.dates[i].start),
                  end: new Date(input.dates[i].end),
                },
                {
                  transaction: t,
                }
              )
            );
          }

          await t.commit();

          let reservationsDatesString = ''

          try {
            for (let i = 0; i < reservations.length; i++) {
              const element = reservations[i];
              const start = new Date(element.start)
              const end = new Date(element.end)
              reservationsDatesString = reservationsDatesString.concat(`${fmtDt(start)} de ${fmtTime(start)} a ${fmtTime(end)}\n`)
            }
          } catch (err) {
            console.log(err)
          }

          try {
            await sendEmail (`La reserva para ${room.name} en las siguientes fechas: \n${reservationsDatesString}ha sido confirmada.`,'Tu reserva ha sido confirmada.' , me.email, transporter)
          } catch (err) {
            console.log(err)
            console.log('The mail was not sent')
          }

          return reservations;
        } catch (err) {
          await t.rollback();
          return err;
        }
      }
    ),
    updateReservation: combineResolvers(
      isAuthenticated,
      async (parent, { input }, { models, modelsmysql, sequelize, me }) => {
        const t = await sequelize.transaction();
        try {
          const room = await models.Room.findByPk(input.roomId, {
            transaction: t,
          });
          const reservation = await models.Reservation.findByPk(input.id, {
            transaction: t,
          });

          if (!input.start || !input.end) {
            throw new Error("Cannot make a reservation without dates");
          }

          if (checkInvalidDates(input)) {
            throw new Error("Dates must belong to same day");
          }

          if (!room) {
            throw new Error("The room was not found");
          }

          if (!reservation) {
            throw new Error("The reservation was not found");
          }

          const notAvailableDates = [];

          Array.prototype.push.apply(
            notAvailableDates,
            await lookForConcurrentDates(
              input.start,
              input.end,
              modelsmysql,
              input.roomId,
              t
            )
          );

          Array.prototype.push.apply(
            notAvailableDates,
            await lookForConcurrentReservationsUpdate(
              input.start,
              input.end,
              models,
              input.roomId,
              input.id,
              t
            )
          );

          if (notAvailableDates.length > 0) {
            throw new Error(
              `The following dates are not current available for room ${
              room.name
              }: ${JSON.stringify(notAvailableDates)}`
            );
          }

          const updatedReservation = await models.Reservation.update(
            {
              userId: me.id,
              roomId: input.roomId,
              start: new Date(input.start),
              end: new Date(input.end),
            },
            {
              where: {
                id: input.id,
              },
            },
            { transaction: t }
          );

          return true;
        } catch (err) {
          await t.rollback();
          return err;
        }
      }
    ),
    deleteReservation: combineResolvers(
      isAuthenticated,
      async (parent, { input }, { models, sequelizemysql, me }) => {
        const t = await sequelizemysql.transaction();
        try {
          const myReservation = await models.Reservation.findOne({
            where: {
              [Sequelize.Op.and]: [{ id: input.id }, { userId: me.id }],
            },
          });

          if (!myReservation) {
            throw new Error("The reservation was not found");
          }

          await models.Reservation.destroy(
            {
              where: {
                id: input.id,
              },
            },
            {
              transaction: t,
            }
          );
          return true;
        } catch (err) {
          await t.rollback();
          return err;
        }
      }
    ),
  },
  Reservation: {
    user: async (reservation, args, { models }) => {
      if (Array.isArray(reservation) && reservation.length > 0) {
        return await models.User.findOne({
          where: { id: parseInt(reservation[0].userId) },
        });
      } else if (typeof reservation === "object") {
        return await models.User.findOne({
          where: { id: parseInt(reservation.userId) },
        });
      }
    },
    room: async (reservation, args, { models }) => {
      if (Array.isArray(reservation) && reservation.length > 0) {
        return await models.Room.findOne({
          where: { id: parseInt(reservation[0].roomId) },
        });
      } else if (typeof reservation === "object") {
        return await models.Room.findOne({
          where: { id: parseInt(reservation.roomId) },
        });
      }
    },
  },
};
