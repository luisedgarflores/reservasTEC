import moongose from 'mongoose'

const csvSchema = new moongose.Schema({
  information: {
    type: String,
  },
  createdAt: {
    type: Date
  }
})

const csv = moongose.model('csv', csvSchema)

export default csv