const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

mongoose.connect(config.mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.json());
app.use('/api', notificationRoutes);

app.listen(config.port, () => {
    console.log(`Notification Service running on port ${config.port}`);
});