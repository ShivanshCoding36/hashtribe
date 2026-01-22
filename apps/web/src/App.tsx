import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { TribesPage } from './pages/TribesPage';
import { CreateTribePage } from './pages/CreateTribePage';
import { TribeDetailPage } from './pages/TribeDetailPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { HomePage } from './pages/HomePage';

function App() {
    const { initialize, initialized } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-400">Initializing HashTribe...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={<Navigate to="/feed" replace />}
                />
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

                {/* Placeholder Routes for Phase 1 */}
                <Route
                    path="/competitions"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <div className="card text-center py-12">
                                    <h1 className="text-3xl font-bold text-white mb-4">Competitions</h1>
                                    <p className="text-dark-400">Coming soon in Phase 1!</p>
                                </div>
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
                                    <p className="text-dark-400">Coming soon in Phase 1!</p>
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
                                    <p className="text-dark-400">Coming soon in Phase 1!</p>
                                </div>
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <Layout>
                            <div className="card text-center py-12">
                                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                                <p className="text-dark-400 mb-6">Page not found</p>
                                <a href="/feed" className="btn-primary">
                                    Go to Feed
                                </a>
                            </div>
                        </Layout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
