const DiscountModel = require('../models/discount');

class DiscountService {
    async validateDiscount(code, amount) {
        const discount = await DiscountModel.findOne({
            code,
            active: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() },
            minAmount: { $lte: amount }
        });

        if (!discount) {
            throw new Error('Invalid discount code');
        }

        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            throw new Error('Discount code usage limit exceeded');
        }

        return discount;
    }

    calculateDiscountAmount(amount, discount) {
        let discountAmount = 0;

        if (discount.type === 'PERCENTAGE') {
            discountAmount = (amount * discount.value) / 100;
        } else {
            discountAmount = discount.value;
        }

        if (discount.maxDiscount) {
            discountAmount = Math.min(discountAmount, discount.maxDiscount);
        }

        return discountAmount;
    }

    async applyDiscount(code, amount) {
        const discount = await this.validateDiscount(code, amount);
        const discountAmount = this.calculateDiscountAmount(amount, discount);

        // Update usage count
        await DiscountModel.updateOne(
            { _id: discount._id },
            { $inc: { usageCount: 1 } }
        );

        return {
            originalAmount: amount,
            discountAmount,
            finalAmount: amount - discountAmount
        };
    }
}

module.exports = new DiscountService();
