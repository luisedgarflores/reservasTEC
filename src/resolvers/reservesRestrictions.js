import { combineResolvers } from "graphql-resolvers";
import { isAdmin, isAuthenticated } from "./authorization";

export default {
  Query: {
    reservationsRestrictions: async (parent, args, { modelsmysql, me }) => {
      return await modelsmysql.ReservationRestriction.findAll();
    },
    reservationsRestrictionsFromRoom: combineResolvers(
      isAuthenticated,
      async (parent, { id }, { modelsmysql, me }) => {
        const reservesRestrictions = await modelsmysql.ReservationRestriction.findAll(
          {
            where: {
              roomId: id,
            },
          },
          {
            raw: true,
          }
        );
        return reservesRestrictions;
      }
    ),
  },
  Mutation: {
    createReservationRestriction: combineResolvers(
      isAdmin,
      async (parent, { input }, { modelsmysql, sequelizemysql, models, sequelize }) => {
        const t = await sequelizemysql.transaction();
        const t2 = await sequelize.transaction();
        try {
          const room = models.Room.findByPk(input.roomId, { transaction: t2 })
          if (room) {
            const reserveRestriction = await modelsmysql.ReservationRestriction.create(
              {
                ...input,
              },
              {
                transaction: t
              }
            );
            await t.commit()
            await t2.commit()
            return reserveRestriction
          } else {
            throw new Error('Room was not found')
          }
        } catch (err) {
          await t.rollback()
          await t2.rollback()
          return err
        }
      }
    ),
    updateReservationRestriction: combineResolvers(
      isAdmin,
      async (parent, { input }, { modelsmysql, sequelizemysql, models, sequelize }) => {
        const t = await sequelizemysql.transaction();
        const t2 = await sequelize.transaction();
        try {
          if (input.roomId) {
            const room = models.Room.findByPk(input.roomId, { transaction: t2 })
            if (room) {
              const reserveRestrictionUpdated = await modelsmysql.ReservationRestriction.create(
                {
                  ...input,
                },
                {
                  transaction: t
                }
              );
              t.commit()
              t2.commit()
              return reserveRestrictionUpdated
            } else {
              throw new Error ('Room was not found')
            }
          } else {
            const reserveRestrictionUpdated = await modelsmysql.ReservationRestriction.create(
              {
                ...input,
              },
              {
                transaction: t
              }
            );
            await t.commit()
            await t2.commit()
            return reserveRestrictionUpdated
          }
        } catch (err) {
          await t.rollback()
          await t2.rollback()
          return err
        }
      }
    ),
    deleteReserveRestriction: combineResolvers(
      isAdmin,
      async (parent, { input }, { modelsmysql, sequelizemysql }) => {
        const t = await sequelizemysql.transaction()
        try {
          return await modelsmysql.ReservationRestriction.destroy({
            where: {
              id: input.id,
            },
          });
        } catch (err) {
          await t.rollback()
          return err
        }
      }
    ),
  },
  ReservationRestriction: {
    room: async (reserveRestriction, args, { models }) => {
      if (Array.isArray(reserveRestriction) && reserveRestriction.length > 0) {
        return await models.Room.findOne({
          where: { id: parseInt(reserveRestriction[0].roomId) },
        });
      } else if (typeof reserveRestriction === "object") {
        return await models.Room.findOne({
          where: { id: parseInt(reserveRestriction.roomId) },
        });
      }
    },
  },
};
