const connectToMongo = require('./db')

const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000

app.use(express.json())

const corsOptions = {
  origin: 'http://localhost:3000', //Dev
  // origin: 'https://chatine.vercel.app/', //Production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// app.use(function (req, res, next) {
//   //Enabling CORS
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization'
//   )
//   next()
// })

// Available Routes

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', require('./routes/auth'))

app.listen(port, () => {
  console.log(`Chatine - AI chat app listening on port ${port}`)
})
connectToMongo()
