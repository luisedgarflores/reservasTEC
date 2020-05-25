import Sequelize from 'sequelize'

const sequelizemysql = new Sequelize(
  'reservas',
  'root',
  '',
  {
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql'
  }
)

const models = {
  Prueba: sequelizemysql.import('./prueba'),
  ReservationRestriction: sequelizemysql.import('./reservesRestrictions')
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

export { sequelizemysql }
export default models 