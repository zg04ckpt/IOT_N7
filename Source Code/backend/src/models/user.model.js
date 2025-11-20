    class User {
        constructor(data) {
            this.id = data.id;
            this.email = data.email;
            this.role = data.role;
            this.phone = data.phone;
            this.password = data.password;
            this.created_at = data.created_at;
            this.updated_at = data.updated_at;
        }

        static isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        static isValidPassword(password) {
            return password && password.length >= 6;
        }

        static isValidPhone(phone) {
            return phone && phone.length <= 15 && /^[0-9]+$/.test(phone);
        }

        toModel() {
            return {
                id: this.id,
                role: this.role,
                email: this.email,
                phone: this.phone,
                created_at: this.created_at,
                updated_at: this.updated_at
            };
        }
    }

    export default User;
