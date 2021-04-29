const mongoose = require('mongoose')

const quoteSchema = mongoose.Schema({
  quote: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})

const Quote = mongoose.model('Quote', quoteSchema)
module.exports = Quote