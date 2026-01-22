import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Globe } from '@/components/Globe';
import logoDark from '@/components/assets/logo_dark.png';
import googleIcon from '@/components/assets/playstore.svg';
import nfksIcon from '@/components/assets/nfks_logo.png';

export function LoginPage() {
    const { user, signInWithGitHub, signInWithGoogle, signInWithEmail, loading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [error, setError] = useState('');

    const from = (location.state as any)?.from?.pathname || '/feed';

    useEffect(() => {
        if (user && !loading) {
            navigate(from, { replace: true });
        }
    }, [user, loading, navigate, from]);

    const handleGitHubLogin = async () => {
        try {
            await signInWithGitHub();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            // Error handled by store
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setError('');
        setEmailLoading(true);

        try {
            await signInWithEmail(email, password);
            setEmailLoading(false);
            // Navigation handled by useEffect
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please check your credentials.');
            setEmailLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-black">
            {/* Left Side - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Logo - Vertically stacked with Login */}
                    <div className="mb-12">
                        {/* Logo */}
                        <div className="mb-8 flex items-center justify-center">
                            <img src={logoDark} alt="HashTribe" className="h-24 -ml-8" />
                            <span className="text-white text-4xl font-bold -ml-5">HashTribe</span>
                        </div>

                        {/* Login Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-3">
                                Login
                            </h1>
                            <p className="text-grey-400 text-base">
                                Step into the world of developer collaboration and verified credibility.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 text-sm rounded-lg">
                                {error}
                            </div>
                        )}
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

                        {/* Password Input */}
                        <div className="mb-4">
                            <PasswordInput
                                value={password}
                                onChange={setPassword}
                                label="Password"
                                placeholder="Enter your password"
                                disabled={emailLoading || loading}
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between mb-6">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-grey-700 bg-charcoal-900 text-white focus:ring-0 focus:ring-offset-0" />
                                <span className="ml-2 text-sm text-grey-400 select-none">Remember me?</span>
                            </label>
                            <a href="#" className="text-sm text-grey-400 hover:text-white transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={emailLoading || loading}
                            className="w-full bg-white hover:bg-grey-200 text-black font-bold py-3.5 px-4 rounded-lg mb-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {emailLoading ? (
                                <svg className="animate-spin h-5 w-5 mr-3 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {emailLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-grey-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-black text-grey-500">or sign in with</span>
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
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            type="button"
                            className="bg-charcoal-900 border border-grey-800 hover:bg-grey-900 text-white rounded-lg p-3 flex items-center justify-center transition-all duration-200 hover:border-grey-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img src={googleIcon} alt="Google" className="w-6 h-6" />
                        </button>

                        {/* nFKs ID */}
                        <button className="bg-charcoal-900 border border-grey-800 hover:bg-grey-900 text-white rounded-lg p-3 flex items-center justify-center transition-all duration-200 hover:border-grey-600">
                            <img src={nfksIcon} alt="nFKs ID" className="w-6 h-6 object-contain" />
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-grey-500">
                        Not registered yet?{' '}
                        <Link to="/signup" className="text-white hover:text-grey-200 transition-colors">
                            Create an account
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
