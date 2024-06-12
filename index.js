const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const userRoutes = require('./routes/user')
const jobRoutes = require('./routes/jobs');
const cors = require('cors');


dotenv.config();

const app = express();

app.use(bodyParser.urlencoded())
app.use(express.json())
app.use(cors())
app.use(userRoutes)
app.use(jobRoutes)

app.get('/', (req, res) => {
   res.send('Server is running...');
})

app.listen(process.env.PORT, (req, res) => {
    mongoose.connect(process.env.Mongo_Url)
    .then(() => {
        console.log('Database is connected!')
    })
    .catch((err) => {
        console.log('There is an error connecting database: ', err);
    })
})