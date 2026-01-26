import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { TribesPage } from './pages/TribesPage';
import About from './pages/About';
import Careers from './pages/CareersPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { CreateTribePage } from './pages/CreateTribePage';
import { TribeDetailPage } from './pages/TribeDetailPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { HomePage } from './pages/HomePage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { CompetitionDetailPage } from './pages/CompetitionDetailPage';

function App() {
    const { initialize, initialized } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-400 font-mono">Initializing HashTribe...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* --- Public Auth Routes --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* --- Root Redirect --- */}
            <Route path="/" element={<Navigate to="/feed" replace />} />

            {/* --- Protected App Routes --- */}
            <Route
                path="/feed"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <HomePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tribes"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <TribesPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tribes/create"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreateTribePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tribes/:slug"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <TribeDetailPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tribes/topics/:topicId"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <TopicDetailPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/competitions"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CompetitionsPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/competitions/:slug"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CompetitionDetailPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/leaderboard"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <div className="card text-center py-12">
                                <h1 className="text-3xl font-bold text-white mb-4">Leaderboard</h1>
                                <p className="text-dark-400 font-mono">Coming soon in Phase 1!</p>
                            </div>
                        </Layout>
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/profile/:username"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <div className="card text-center py-12">
                                <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
                                <p className="text-dark-400 font-mono">Coming soon in Phase 1!</p>
                            </div>
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* --- Public Informational Routes (Still within Layout) --- */}
            <Route
                path="/about"
                element={ 
                    <Layout>
                        <About />
                    </Layout>
                }
            />
            <Route
                path="/careers"
                element={ 
                    <Layout>
                        <Careers />
                    </Layout>
                }
            />
            <Route
                path="/privacy"
                element={ 
                    <Layout>
                        <Privacy /> 
                    </Layout>
                }
            />
            <Route
                path="/terms"       
                element={
                    <Layout>
                        <Terms />
                    </Layout>
                }
            />  

            {/* --- 404 Page --- */}
            <Route
                path="*"
                element={
                    <Layout>
                        <div className="card text-center py-24 border border-charcoal-800 bg-zinc-900/20">
                            <h1 className="text-6xl font-black text-white mb-4">404</h1>
                            <p className="text-dark-400 mb-8 font-mono tracking-widest uppercase text-sm">Signal Lost: Page Not Found</p>
                            <a href="/feed" className="bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-zinc-200 transition-colors">
                                Return to Feed
                            </a>
                        </div>
                    </Layout>
                }
            />
        </Routes>
    );
}

export default App;