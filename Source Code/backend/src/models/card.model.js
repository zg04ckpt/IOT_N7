import { getDateAfferMonthsForSQL } from "../utils/time.util.js";

export const CardType = Object.freeze({
    NORMAL: 'normal',
    MONTHLY: 'monthly'
});

export class Card {
    constructor(cardData) {
        this.id = cardData.id;
        this.uid = cardData.uid;
        this.type = cardData.type;
        this.monthly_user_name = cardData.monthly_user_name;
        this.monthly_user_phone = cardData.monthly_user_phone;
        this.monthly_user_expiry = cardData.monthly_user_expiry;
        this.monthly_user_address = cardData.monthly_user_address;
        this.created_at = cardData.created_at;
        this.updated_at = cardData.updated_at;
    }

    static isValidMonthlyUserName(name) {
        return name && name.length <= 50 && /^[\p{L}\s]+$/u.test(name);
    }

    static isValidMonthlyUserPhone(phone) {
        return phone && phone.length <= 15 && /^[0-9]+$/.test(phone);
    }

    static isValidMonthlyUserExpiry(months) {
        return months && months > 0;
    }

    static isValidMonthlyUserAddress(address) {
        return address && address.length <= 20 && /^[\p{L}\s]+$/u.test(address);
    }

    setToMonthlyCard(info) {
        this.type = CardType.MONTHLY;
        this.monthly_user_name = info.monthly_user_name;
        this.monthly_user_phone = info.monthly_user_phone;
        this.monthly_user_address = info.monthly_user_address;
        this.monthly_user_expiry = getDateAfferMonthsForSQL(info.months);
    }

    setToNormalCard() {
        this.type = CardType.NORMAL;
        this.monthly_user_name = null;
        this.monthly_user_phone = null;
        this.monthly_user_expiry = null;
        this.monthly_user_address = null;
    }

    toModel() {
        return {
            id: this.id,
            uid: this.uid,
            type: this.type,
            monthly_user_name: this.monthly_user_name,
            monthly_user_phone: this.monthly_user_phone,
            monthly_user_expiry: this.monthly_user_expiry,
            monthly_user_address: this.monthly_user_address,
            created_at: this.created_at,
            updated_at: this.updated_at,
        }
    }
}