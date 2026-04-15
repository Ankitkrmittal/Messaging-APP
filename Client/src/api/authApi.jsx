import axios from './axios'
import auth from '../lib/auth';

async function signup({name,email,password}) {
    const {
        data:{data},
    }= await axios({
        method:"post",
        url:"/api/auth/signup",
        data:{
            name,
            email,
            password,
        },
    });
    return data;
}

async function signin({email,password}) {
    const {
        data:{data},
    } = await axios({
        method:"post",
        url:"/api/auth/signin",
        data:{
            email,
            password,
        },
    });
    return data;
}

async function verifyOtp({ email, otp }) {
    const {
        data: { data },
    } = await axios({
        method: "post",
        url: "/api/auth/verify-otp",
        data: {
            email,
            otp,
        },
    });
    return data;
}

async function resendOtp({ email }) {
    const {
        data: { data },
    } = await axios({
        method: "post",
        url: "/api/auth/resend-otp",
        data: {
            email,
        },
    });
    return data;
}

async function me() {
    const {data:{data}} = await axios({
        method:"get",
        url:"api/auth/me",
        headers:{
            Authorization:`Bearer ${auth.token || " "}`
        },
    });
    return data
}
export const authApi = {
   signin,
   signup,
   verifyOtp,
   resendOtp,
   me
}
