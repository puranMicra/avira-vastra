/**
 * Login Page
 * Simplified: Only Google OAuth login
 */

import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';
import '../styles/auth.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await authAPI.googleAuth({
                credential: credentialResponse.credential
            });

            if (response.token) {
                const { token, ...userData } = response;
                login(userData, token);
                toast.success('Welcome to Avira Vastra!');
                navigate('/');
            }
        } catch (err) {
            toast.error('Google login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed. Please try again.');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    {/* Header */}
                    <div className="auth-header">
                        <h1 className="auth-title">Welcome</h1>
                        <p className="auth-subtitle">Sign in with Google to continue</p>
                    </div>

                    {/* Google Login Only */}
                    <div className="auth-google auth-google--standalone">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                        />
                    </div>

                    <p className="auth-trust-text">
                        By continuing, you agree to our Terms and Privacy Policy.
                    </p>

                    {/* Footer Links */}
                    <div className="auth-footer">
                        <a href="/" className="auth-back">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
