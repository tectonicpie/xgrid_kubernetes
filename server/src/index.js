const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const logs = require('./log.controller.js');
// // Automatically allow cross-origin requests

const app = express();
app.use(cors({ origin: true }));
const port = 5000;
console.log(process.env.MONGODB_URL);
const mongo_uri = process.env.MONGODB_URL || "mongodb://log-mongo-service:27017/log-k8s";
mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.post('/create_log', logs.create);
app.get('/get_logs', logs.findAll);
app.get('/', function (req, res) {
    res.status(200).send({connected: true});
  })

app.listen(port, () => {
    console.log('Log server is up on port ' + port)
})