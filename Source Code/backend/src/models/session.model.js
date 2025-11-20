export const SessionStatus = Object.freeze({
    PAKING: 'packing',
    END: 'end'
});

export class Session {
    constructor(data) {
        this.id = data.id;
        this.card_id = data.card_id;
        this.plate = data.plate;
        this.check_in_image_url = data.check_in_image_url;
        this.check_out_image_url = data.check_out_image_url;
        this.check_in = data.check_in;
        this.check_out = data.check_out;
        this.user_id = data.user_id; // id của nhân viên bảo vệ khi checkout
        this.status = data.status;
    }

    static isValidPlate(plate) {
        return plate && /^[A-Z0-9\-]+$/.test(plate);
    }

    toModel() {
        console.log(this);
        return {
            id: this.id,
            card_id: this.card_id,
            plate: this.plate,
            check_in_image_url: this.check_in_image_url,
            check_out_image_url: this.check_out_image_url,
            check_in: this.check_in,
            check_out: this.check_out,
            user_id: this.user_id,
            status: this.status
        };
    }
}
