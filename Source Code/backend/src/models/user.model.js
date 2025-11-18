class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.role = data.role;
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

    toModel() {
        return {
            id: this.id,
            role: this.role,
            email: this.email,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default User;
