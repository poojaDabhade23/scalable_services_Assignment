const sgMail = require('@sendgrid/mail');
const config = require('../config/config');

sgMail.setApiKey(config.sendgrid.apiKey);

class EmailService {
    async sendEmail(to, subject, content) {
        const msg = {
            to,
            from: config.sendgrid.fromEmail,
            subject,
            html: content,
        };

        try {
            await sgMail.send(msg);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }

    async sendServiceBookingConfirmation(userEmail, bookingDetails) {
        const subject = 'Service Booking Confirmation';
        const content = `
            <h1>Booking Confirmation</h1>
            <p>Your service has been booked successfully!</p>
            <p>Service: ${bookingDetails.serviceName}</p>
            <p>Date: ${bookingDetails.date}</p>
            <p>Time: ${bookingDetails.time}</p>
            <p>Provider: ${bookingDetails.providerName}</p>
        `;
        
        return this.sendEmail(userEmail, subject, content);
    }

    async sendPaymentConfirmation(userEmail, paymentDetails) {
        const subject = 'Payment Confirmation';
        const content = `
            <h1>Payment Successful</h1>
            <p>Your payment has been processed successfully!</p>
			<p>Service: ${paymentDetails.serviceName}</p>
            <p>Amount: $${paymentDetails.amount}</p>
            <p>Transaction ID: ${paymentDetails.transactionId}</p>
            <p>Date: ${paymentDetails.date}</p>
        `;
        
        return this.sendEmail(userEmail, subject, content);
    }
}

module.exports = new EmailService();