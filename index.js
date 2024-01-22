const connectToMongo = require('./db')

const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000

app.use(express.json())

// app.use(cors())

app.use(
  cors({
    origin: true,
    methods: 'GET,HEAD,OPTIONS,POST,PUT',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization',
  })
)

// Available Routes

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', require('./routes/auth'))

app.listen(port, () => {
  console.log(`Chatine - AI chat app listening on port ${port}`)
})
connectToMongo()
