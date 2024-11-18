require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3002,
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/payment-service'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY
    },
    notificationService: {
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3001/api'
    }
};