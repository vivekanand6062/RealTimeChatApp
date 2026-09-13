import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '..';
import ThemeToggle from './ThemeToggle';
import { IoChatbubbles } from 'react-icons/io5';

const Login = () => {
  const [user, setUser] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!user.username || !user.password) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      toast.success(`Welcome back, ${res.data?.fullName || user.username}!`);
      dispatch(setAuthUser(res.data));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Check server connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto px-4">
      {/* Floating Theme Toggle */}
      <div className="absolute -top-12 right-4">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="w-full p-8 rounded-3xl shadow-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/50 dark:border-slate-800/80 transition-all duration-300">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <IoChatbubbles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sign in to continue to RealTime Chat
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <input
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;