'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Globe } from '@/components/Globe';
import logoDark from '@/components/assets/logo_dark.png';
import googleIcon from '@/components/assets/playstore.svg';
import nfksIcon from '@/components/assets/nfks_logo.png';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export function SignupPage() {
    const { user, signInWithGitHub, signUpWithEmail, loading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [error, setError] = useState('');

    // Password Strength State
    const [strength, setStrength] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('');

    const from = (location.state as any)?.from?.pathname || '/tribes';

    useEffect(() => {
        if (user && !loading) {
            navigate(from, { replace: true });
        }
    }, [user, loading, navigate, from]);

    // Password strength calculation logic
    useEffect(() => {
        let score = 0;
        if (!password) {
            setStrength(0);
            setStrengthLabel('');
            return;
        }

        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        setStrength(score);

        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        setStrengthLabel(labels[score - 1] || 'Weak');
    }, [password]);

    const handleGitHubLogin = async () => {
        try {
            await signInWithGitHub();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !username || !email || !password) return;

        setError('');
        setSignupLoading(true);

        try {
            await signUpWithEmail(email, password, username, name);
            setSignupLoading(false);

            if (!user) {
                setError('Account created! Please check your email to verify your account.');
                setName('');
                setUsername('');
                setEmail('');
                setPassword('');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Failed to sign up. Please try again.');
            setSignupLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-black">
            {/* Left Side - Signup Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Logo - Vertically stacked with Header */}
                    <div className="mb-12">
                        {/* Logo */}
                        <div className="mb-8 flex items-center justify-center">
                            <img src={logoDark} alt="HashTribe" className="h-24 -ml-8" />
                            <span className="text-white text-4xl font-bold -ml-5">HashTribe</span>
                        </div>

                        {/* Signup Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-3">
                                Create an account.
                            </h1>
                            <p className="text-grey-400 text-base">
                                Join the world of developer collaboration and verified credibility.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignup}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 text-sm rounded-lg">
                                {error}
                            </div>
                        )}
                        {/* Name Input */}
                        <div className="mb-4">
                            <label className="block text-grey-400 text-sm mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-charcoal-900 border border-grey-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-grey-600 transition-colors placeholder-grey-600"
                                required
                            />
                        </div>

                        {/* Username Input */}
                        <div className="mb-4">
                            <label className="block text-grey-400 text-sm mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                className="w-full bg-charcoal-900 border border-grey-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-grey-600 transition-colors placeholder-grey-600"
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-grey-400 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="mail@example.com"
                                className="w-full bg-charcoal-900 border border-grey-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-grey-600 transition-colors placeholder-grey-600"
                                required
                            />
                        </div>

                        {/* Password Input with Strength Meter */}
                        <div className="mb-6">
                            <PasswordInput
                                value={password}
                                onChange={setPassword}
                                label="Password"
                                placeholder="Create a password"
                                disabled={signupLoading || loading}
                                autoComplete="new-password"
                            />
                            
                            {/* Strength Meter UI */}
                            {password && (
                                <div className="mt-3 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex gap-1.5 flex-1 mr-4">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                                        strength >= level
                                                            ? strength <= 2 
                                                                ? 'bg-red-500' 
                                                                : strength === 3 
                                                                    ? 'bg-yellow-500' 
                                                                    : 'bg-green-500'
                                                            : 'bg-grey-800'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${
                                            strength <= 2 ? 'text-red-400' : strength === 3 ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                            {strengthLabel}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <div className={`text-[10px] flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-400' : 'text-grey-600'}`}>
                                            <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-grey-600'}`} />
                                            8+ Characters
                                        </div>
                                        <div className={`text-[10px] flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-grey-600'}`}>
                                            <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-400' : 'bg-grey-600'}`} />
                                            Uppercase Letter
                                        </div>
                                        <div className={`text-[10px] flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-grey-600'}`}>
                                            <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-green-400' : 'bg-grey-600'}`} />
                                            Number
                                        </div>
                                        <div className={`text-[10px] flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : 'text-grey-600'}`}>
                                            <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-400' : 'bg-grey-600'}`} />
                                            Special Character
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={signupLoading || loading || (password.length > 0 && strength < 3)}
                            className="w-full bg-white hover:bg-grey-200 text-black font-bold py-3.5 px-4 rounded-lg mb-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {signupLoading ? (
                                <svg className="animate-spin h-5 w-5 mr-3 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {signupLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-grey-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-black text-grey-500">or sign up with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* GitHub */}
                        <button
                            onClick={handleGitHubLogin}
                            disabled={loading}
                            className="bg-charcoal-900 border border-grey-800 hover:bg-grey-900 text-white rounded-lg p-3 flex items-center justify-center transition-all duration-200 hover:border-grey-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>

                        {/* Google */}
                        <button className="bg-charcoal-900 border border-grey-800 hover:bg-grey-900 text-white rounded-lg p-3 flex items-center justify-center transition-all duration-200 hover:border-grey-600">
                            <img src={googleIcon} alt="Google" className="w-6 h-6" />
                        </button>

                        {/* nFKs ID */}
                        <button className="bg-charcoal-900 border border-grey-800 hover:bg-grey-900 text-white rounded-lg p-3 flex items-center justify-center transition-all duration-200 hover:border-grey-600">
                            <img src={nfksIcon} alt="nFKs ID" className="w-6 h-6 object-contain" />
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-sm text-grey-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white hover:text-grey-200 transition-colors">
                            Login
                        </Link>
                    </p>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-grey-600 text-xs">
                            © HashTribe. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Globe Visualization */}
            <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-black">
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent z-10 pointer-events-none"></div>

                {/* Globe */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[900px] h-[900px]">
                        <Globe />
                    </div>
                </div>

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none z-20"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px'
                    }}
                ></div>
            </div>
        </div>
    );
}