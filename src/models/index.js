import Sequelize from 'sequelize'

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: '127.0.0.1',
    port: '5434',
    dialect: 'postgres'
  }
)

const models = {
  User: sequelize.import('./user'),
  //Message: sequelize.import('./message'),
  //TrashCan: sequelize.import('./trashCan'),
  //Bike: sequelize.import('./bike'),
  //Station: sequelize.import('./station'),
  //Trip: sequelize.import('./trip'),
  Otp: sequelize.import('./otp'),
  Role: sequelize.import('./role'),
  Campus: sequelize.import('./campus'),
  Building: sequelize.import('./building'),
  Room: sequelize.import('./room'),
  ReservesPermissions: sequelize.import('./reservesPermissions'),
  Reservation: sequelize.import('./reservation')
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

export { sequelize }
export default models 