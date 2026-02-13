require('dotenv').config()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const verifyJWT = require('./middleware/verifyJWT')
const mongoose = require('mongoose')
const cors = require('cors')
const connectDb = require('./config/dbConfig')
const serverPort = process.env.PORT || 3500

// Connect to Database
connectDb()

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true 
}))

app.use(express.json())
app.use(cookieParser())

// Public Routes
app.use('/register', require('./route/register'))
app.use('/login', require('./route/login'))

app.use(verifyJWT) 

// 3. Protected Routes go below here
// app.use('/dashboard', require('./route/dashboard'))

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(serverPort, () => {
        console.log(`Server running on port ${serverPort}`)
    })
})