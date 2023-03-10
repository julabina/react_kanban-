const express = require('express');
const morgan = require('morgan');
const userRoute = require('./routes/user');
const projectRoute = require('./routes/project');
const taskRoute = require('./routes/task');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(morgan('dev'));

app.use('/api/user', userRoute);
app.use('/api/project', projectRoute);
app.use('/api/task', taskRoute);

module.exports = app;