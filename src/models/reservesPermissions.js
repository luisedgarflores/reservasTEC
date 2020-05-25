import Role from './role'
import Room from './room'

const reservespermissions = (sequelize, DataTypes) => {
  const Reservespermissions = sequelize.define('reservespermissions', {
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role, // 'Movies' would also work
        key: 'id'
      }
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: Room, // 'Actors' would also work
        key: 'id'
      }
    },
  });

  return Reservespermissions
}

export default reservespermissions