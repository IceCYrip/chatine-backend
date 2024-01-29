const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  username: {
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
    default: "This is about section. Add your bio here.",
  },
  verified: {
    type: Boolean,
    required: false,
  },
});
const User = mongoose.model("user", UserSchema);
module.exports = User;
