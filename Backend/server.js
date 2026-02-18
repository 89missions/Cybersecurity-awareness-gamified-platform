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
    origin: 'http://localhost:5500',//this is the exact frontend and not localhost:5500
    credentials: true 
}))

app.use(express.json())
app.use(cookieParser())

// app.use((req, res, next) => {
//     console.log('All cookies at request start:', req.cookies);
//     console.log('Raw cookie header:', req.headers.cookie);
//     next();
// });

// Public Routes
app.use('/register', require('./route/register'))
app.use('/login', require('./route/login'))


app.use(verifyJWT) 
// 3. Protected Routes go below here
app.use('/user-stats',require('./route/user-stats'))
app.use('/module',require('./route/module'))
app.use('/questions',require('./route/question'))
app.use('/submit-quiz',require('./route/submit'))

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(serverPort, () => {
        console.log(`Server running on port ${serverPort}`)
    })
})