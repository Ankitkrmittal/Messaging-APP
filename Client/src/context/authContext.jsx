import { useState, useContext, createContext } from "react";
import { authApi } from "../api/authApi";
import auth from "../lib/auth";

const context = createContext();

export const AuthProvider = ({ children }) => {
    const [user,setUser] = useState(auth.user||null);

    async function signin({email,password}) {
        const {user,token} = await authApi.signin({email,password});
        setUser(user);
        auth.token = token;
        auth.user = user;
        auth.pendingVerificationEmail = null;
        return {user,token};
    }

    async function signup({name,email,password}) {
        const data = await authApi.signup({name,email,password});
        if (data?.email) {
            auth.pendingVerificationEmail = data.email;
        }
        return data;
    }

    async function verifyOtp({ email, otp }) {
        const { user, token, message } = await authApi.verifyOtp({ email, otp });
        setUser(user);
        auth.token = token;
        auth.user = user;
        auth.pendingVerificationEmail = null;
        return { user, token, message };
    }

    async function resendOtp({ email }) {
        if (email) {
            auth.pendingVerificationEmail = email;
        }
        return authApi.resendOtp({ email });
    }

    function logout() {
        auth.logout();
        setUser(null);
    }
    return (
        <context.Provider
        value={{
            user,
            token:auth.token || "",
            signin,
            signup,
            verifyOtp,
            resendOtp,
            isLoggedIn:user?true:false,
            logout,
        }}
        >
            {children}
        </context.Provider>
    )
}

export default function useAuth() {
    return useContext(context);
}
