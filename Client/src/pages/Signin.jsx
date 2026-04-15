import { useState } from "react"
import {useNavigate} from "react-router"
import useAuth from "../context/authContext";

const Signin=() =>{
    const [password,setPassword] = useState("");
    const [email,setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const {signin} = useAuth();

    const formSubmitHandler = async (e) =>{
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await signin({email,password});
            navigate("/dashboard");
        } catch (err) {
            const message = err.response?.data?.message || "Unable to sign in";
            setError(message);

            if (err.response?.status === 403) {
                navigate("/verify-otp", {
                    state: { email }
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="auth-shell">
        <form className="auth-card" onSubmit={formSubmitHandler}>
            <div className="auth-copy">
                <p className="eyebrow">Welcome back</p>
                <h1>Sign in</h1>
                <p>Use your password if your email has already been verified.</p>
            </div>
            {error ? <div className="auth-notice error">{error}</div> : null}
            <input 
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Enter email"></input>
            <input
            onChange={(e)=>setPassword(e.target.value)}
            value={password}
            type="password" 
            placeholder="Enter password"
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Signin"}
            </button>
            <button
                type="button"
                className="text-link"
                onClick={()=>navigate("/signup")}
            >
                Need an account? Signup
            </button>
        </form>
        </div>
    )
} 
export default Signin;
