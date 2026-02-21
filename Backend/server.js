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

const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://cybersecureaware.netlify.app'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())

// Public Routes
app.use('/register', require('./route/register'))
app.use('/login', require('./route/login'))

app.use(verifyJWT) 
// 3. Protected Routes go below here
app.use('/user-stats',require('./route/user-stats'))
app.use('/module',require('./route/module'))
app.use('/questions',require('./route/question'))
app.use('/submit-quiz',require('./route/submit'))
app.use('/leaderboard',require('./route/leaderboard'))

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(serverPort, () => {
        console.log(`Server running on port ${serverPort}`)
    })
})