const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if(!validator.isEmail(value)) {
        throw new Error('Please provide a valid email')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if(value.toLowerCase().includes('password')) {
        throw new Error('Password must be stronger')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
})

// Create connection between users and quotes
userSchema.virtual('quotes', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'userId'
})

// Create jwt for authorisation
userSchema.methods.generateAuthToken = async function() {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1 year' })

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

// Hide user password and jwt
userSchema.methods.toJSON = function() {
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}

// Logging in users
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if(!user) {
    throw new Error('Unable to find user')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch) {
    throw new Error('Unable to log in')
  }

  return user
}

// Middleware for password hashing
userSchema.pre('save', async function(next) {
  const user = this

  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// Remove users quotes when user is deleted
userSchema.pre('delete', async function(next) {
  const user = this
  await Quote.deleteMany({ userId: user._id })

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User