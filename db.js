const mongoose = require('mongoose')

const mongoURI =
  'mongodb+srv://chatine322519:chatineUser123@chatine.ff8y0tk.mongodb.net/chatine'
const connectToMongo = () => {
  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 300000, // Set a longer timeout value
  })
}

module.exports = connectToMongo
