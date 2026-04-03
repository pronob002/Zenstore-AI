import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import api from '../services/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSignup) {
                await api.post('/signup', { username, password });
                alert("Signup successful! Please login.");
                setIsSignup(false);
            } else {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);
                const res = await api.post('/login', formData);
                localStorage.setItem('token', res.data.access_token);
                navigate('/dashboard');
            }
        } catch (error) {
            alert(error.response?.data?.detail || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-md mb-4 flex items-center justify-center">
                        <Layers className="text-white w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ZenStore</h1>
                    <p className="text-slate-500 mt-2 font-medium">Automated Catalog Management</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50">
                    <h2 className="text-xl font-bold mb-6 text-slate-800 text-center">
                        {isSignup ? 'Create your account' : 'Sign in to your account'}
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Username</label>
                            <input 
                                type="text" placeholder="Enter username" required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                value={username} onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                            <input 
                                type="password" placeholder="••••••••" required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-md flex justify-center items-center"
                    >
                        {isLoading ? <span className="animate-pulse">Processing...</span> : (isSignup ? 'Sign Up' : 'Sign In')}
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors font-medium" onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </p>
                </form>
            </div>
        </div>
    );
}