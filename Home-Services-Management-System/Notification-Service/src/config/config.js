require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/notification-service'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL || 'noreply@homeservicesmanagementsystem.com'
    }
};