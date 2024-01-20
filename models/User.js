const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  about: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    required: false,
  },
})
const User = mongoose.model('user', UserSchema)
module.exports = User
