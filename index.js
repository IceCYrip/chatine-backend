const connectToMongo = require('./db')

const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000

app.use(express.json())

app.use(cors())

// Available Routes

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', require('./routes/auth'))

app.listen(port, () => {
  console.log(`Chatine - AI chat app listening on port ${port}`)
})
connectToMongo()
