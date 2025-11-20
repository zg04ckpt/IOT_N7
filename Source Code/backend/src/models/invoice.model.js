export const InvoiceSource = Object.freeze({
    SESSION: 'session',
    MONTHLY_CARD: 'monthly_card'
});

export const PricingConfig = Object.freeze({
    HOURLY_RATE: 2000,      // 2,000 VNĐ/giờ cho vé lượt
    MONTHLY_RATE: 100000    // 100,000 VNĐ/tháng cho vé tháng
});

export class Invoice {
    constructor(data = {}) {
        this.id = data?.id ?? null;
        this.amount = data?.amount ?? null;
        this.from = data?.from ?? null;
        this.user_id = data?.user_id ?? null;
        this.session_id = data?.session_id ?? null;
        this.created_at = data?.created_at ?? null;
        this.updated_at = data?.updated_at ?? null;
    }

    static calculateSessionFee(checkInTime, checkOutTime) {
        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);
        
        const diffMs = checkOut - checkIn;
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Làm tròn lên
        
        return diffHours * PricingConfig.HOURLY_RATE;
    }

    static calculateMonthlyFee(months) {
        return months * PricingConfig.MONTHLY_RATE;
    }

    toModel() {
        return {
            id: this.id,
            amount: this.amount,
            from: this.from,
            user_id: this.user_id,
            session_id: this.session_id,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
