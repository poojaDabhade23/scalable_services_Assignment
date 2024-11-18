const NotificationModel = require('../models/notification');
const emailService = require('../services/emailService');
const Redis = require('ioredis');
const config = require('../config/config');

const redis = new Redis(config.redis);

class NotificationController {
    async createNotification(req, res) {
        try {
            const { userId, type, content } = req.body;
            
            const notification = new NotificationModel({
                userId,
                type,
                content
            });

            await notification.save();

            // Process notification based on type
            switch (type) {
                case 'BOOKING_CONFIRMATION':
                    await emailService.sendServiceBookingConfirmation(
                        content.userEmail,
                        content.bookingDetails
                    );
                    break;
                case 'PAYMENT_CONFIRMATION':
                    await emailService.sendPaymentConfirmation(
                        content.userEmail,
                        content.paymentDetails
                    );
                    break;
            }

            notification.status = 'SENT';
            await notification.save();

            res.status(201).json(notification);
        } catch (error) {
            console.error('Notification creation failed:', error);
            res.status(500).json({ error: 'Failed to create notification' });
        }
    }

    async getNotifications(req, res) {
        try {
            const { userId } = req.params;
            const cacheKey = `notifications:${userId}`;
            
            // Try to get from cache
            const cachedNotifications = await redis.get(cacheKey);
            if (cachedNotifications) {
                return res.json(JSON.parse(cachedNotifications));
            }

            // Get from database
            const notifications = await NotificationModel.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50);

            // Cache the results
            await redis.setex(cacheKey, 300, JSON.stringify(notifications));

            res.json(notifications);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }
}

module.exports = new NotificationController();