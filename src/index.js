const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const corsOptions = {
  origin: 'https://crane-quotable.herokuapp.com',
  credentials: true
}

require('./db/mongoose')

const userRouter = require('./routers/user')
const quoteRouter = require('./routers/quote')

const port = process.env.PORT

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser('secret'))
app.use(session({ 
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

app.use(userRouter)
app.use(quoteRouter)

app.listen(port, () => {
  console.log(`App listening on ${port}`)
})