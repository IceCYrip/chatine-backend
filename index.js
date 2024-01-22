const connectToMongo = require('./db')

const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000

app.use(express.json())

// app.use(cors())

// Configure CORS
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// Available Routes

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(
  '/api/auth',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
  },
  require('./routes/auth')
)

app.listen(port, () => {
  console.log(`Chatine - AI chat app listening on port ${port}`)
})
connectToMongo()
