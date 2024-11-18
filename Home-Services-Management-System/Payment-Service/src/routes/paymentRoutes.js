const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/payments', paymentController.createPayment);
router.post('/payments/:paymentId/confirm', paymentController.confirmPayment);
router.get('/payments/user/:userId', paymentController.getPaymentHistory);

module.exports = router;

// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

mongoose.connect(config.mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.json());
app.use('/api', paymentRoutes);

app.listen