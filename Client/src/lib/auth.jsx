export default {
    get token() {
        return localStorage.getItem("token")
    },
    set token(v) {
        v? localStorage.setItem("token",v):localStorage.removeItem("token");
    },
    get user() {
        const user = localStorage.getItem("user");
        return user?JSON.parse(user):null;
    },
    set user(u) {
        u? localStorage.setItem("user",JSON.stringify(u))
        :localStorage.removeItem("user");
    },
    get pendingVerificationEmail() {
        return sessionStorage.getItem("pendingVerificationEmail");
    },
    set pendingVerificationEmail(email) {
        email
            ? sessionStorage.setItem("pendingVerificationEmail", email)
            : sessionStorage.removeItem("pendingVerificationEmail");
    },
    logout() {
        this.token = null;
        this.user = null;
        this.pendingVerificationEmail = null;
    },
};
