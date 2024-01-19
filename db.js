const mongoose = require('mongoose')

const mongoURI =
  'mongodb+srv://karansable:karan123@counterfeitproductrecog.nlz2zsq.mongodb.net/counterfeit'

const connectToMongo = () => {
  mongoose.connect(mongoURI)
}

module.exports = connectToMongo
