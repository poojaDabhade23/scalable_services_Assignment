const PaymentModel = require('../models/payment');
const stripeService = require('../services/stripeService');
const discountService = require('../services/discountService');
const axios = require('axios');
const config = require('../config/config');

class PaymentController {
    async createPayment(req, res) {
        try {
            const { userId, bookingId, amount, currency, discountCode } = req.body;

            let finalAmount = amount;
            let discountAmount = 0;

            if (discountCode) {
                const discountResult = await discountService.applyDiscount(discountCode, amount);
                finalAmount = discountResult.finalAmount;
                discountAmount = discountResult.discountAmount;
            }

            const paymentIntent = await stripeService.createPaymentIntent(finalAmount, currency);

            const payment = new PaymentModel({
                userId,
                bookingId,
                amount: finalAmount,
                currency,
                stripePaymentId: paymentIntent.id,
                discountApplied: discountAmount
            });

            await payment.save();

            res.status(201).json({
                paymentId: payment._id,
                clientSecret: paymentIntent.client_secret,
                amount: finalAmount,
                discountApplied: discountAmount
            });
        } catch (error) {
            console.error('Payment creation failed:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async confirmPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const payment = await PaymentModel.findById(paymentId);

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            const paymentIntent = await stripeService.confirmPayment(payment.stripePaymentId);

            if (paymentIntent.status === 'succeeded') {
                payment.status = 'COMPLETED';
                await payment.save();

                // Send notification
                await axios.post(`${config.notificationService.url}/notifications`, {
                    userId: payment.userId,
                    type: 'PAYMENT_CONFIRMATION',
                    content: {
                        userEmail: req.body.userEmail,
                        paymentDetails: {
                            amount: payment.amount,
                            transactionId: payment._id,
                            date: new Date()
                        }
                    }
                });

                res.json({ status: 'success', payment });
            } else {
                payment.status = 'FAILED';
                await payment.save();
                res.status(400).json({ error: 'Payment confirmation failed' });
            }
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getPaymentHistory(req, res) {
        try {
            const { userId } = req.params;
            const payments = await PaymentModel.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50);

            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch payment history' });
        }
    }
}

module.exports = new PaymentController();