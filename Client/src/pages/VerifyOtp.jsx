import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import useAuth from "../context/authContext";
import auth from "../lib/auth";

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp, resendOtp } = useAuth();

    const initialEmail =
        location.state?.email || auth.pendingVerificationEmail || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsVerifying(true);

        try {
            await verifyOtp({ email, otp });
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to verify OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setMessage("");
        setIsResending(true);

        try {
            const data = await resendOtp({ email });
            setMessage(data.message || "OTP sent successfully");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-shell">
            <form className="auth-card" onSubmit={handleVerify}>
                <div className="auth-copy">
                    <p className="eyebrow">One more step</p>
                    <h1>Verify your email</h1>
                    <p>Enter the six-digit code sent to your inbox. If the code expired, request a new one.</p>
                </div>

                {message ? <div className="auth-notice success">{message}</div> : null}
                {error ? <div className="auth-notice error">{error}</div> : null}

                <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    placeholder="Enter email"
                />
                <input
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    value={otp}
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                />

                <button type="submit" disabled={isVerifying}>
                    {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleResend}
                    disabled={isResending}
                >
                    {isResending ? "Sending..." : "Resend OTP"}
                </button>
                <button
                    type="button"
                    className="text-link"
                    onClick={() => navigate("/signin")}
                >
                    Back to signin
                </button>
            </form>
        </div>
    );
};

export default VerifyOtp;
