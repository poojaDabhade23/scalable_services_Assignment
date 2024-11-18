const stripe = require('stripe')(require('../config/config').stripe.secretKey);

class StripeService {
    async createPaymentIntent(amount, currency = 'USD') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency
            });
            return paymentIntent;
        } catch (error) {
            console.error('Stripe payment intent creation failed:', error);
            throw error;
        }
    }

    async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Stripe payment confirmation failed:', error);
            throw error;
        }
    }
}

module.exports = new StripeService();