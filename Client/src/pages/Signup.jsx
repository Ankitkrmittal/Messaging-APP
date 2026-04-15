import React,{ useState } from "react"
import useAuth from "../context/authContext";
import { useNavigate } from "react-router";

const Signup=()=>{
    const [name,setName] = useState("");
    const [password,setPassword] = useState("");
    const [email,setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {signup} = useAuth();
    const navigate = useNavigate();

    const formSubmitHandler = async (e) =>{
        e.preventDefault();
        setError("");
        setMessage("");
        setIsSubmitting(true);

        try {
            const data = await signup({name,email,password});
            setMessage(data.message || "Signup successful");
            navigate("/verify-otp", {
                state: { email: data.email || email }
            });
        } catch (err) {
            setError(err.response?.data?.message || "Unable to signup");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="auth-shell">
         <form className="auth-card" onSubmit={formSubmitHandler}>
            <div className="auth-copy">
                <p className="eyebrow">Email OTP Auth</p>
                <h1>Create your account</h1>
                <p>Sign up first. You will verify your email before the app logs you in.</p>
            </div>
            {message ? <div className="auth-notice success">{message}</div> : null}
            {error ? <div className="auth-notice error">{error}</div> : null}
            <input 
             onChange={(e)=>setEmail(e.target.value)}
             value={email}
             type="email"
             placeholder="Enter Email"
            />
            <input 
             onChange={(e)=>setName(e.target.value)}
             value={name}
             type="text"
             placeholder="Enter Name"
            />
            <input 
             onChange={(e)=>setPassword(e.target.value)}
             value={password}
             type="password"
             placeholder="Enter Password"
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending OTP..." : "Signup"}
            </button>
            <button
                type="button"
                className="text-link"
                onClick={()=>navigate('/signin')}
            >
                Already have an account? Sign in
            </button>
         </form>
        </div>
    )
}
export default Signup;
