import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '..';
import ThemeToggle from './ThemeToggle';
import { IoPersonAdd } from 'react-icons/io5';

const Signup = () => {
  const [user, setUser] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenderSelect = (gender) => {
    setUser({ ...user, gender });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!user.gender) {
      toast.error('Please select your gender');
      return;
    }
    if (user.password !== user.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, user, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Account created successfully!');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Check server connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto px-4 py-4">
      {/* Floating Theme Toggle */}
      <div className="absolute -top-6 right-4 sm:-top-8">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="w-full p-6 sm:p-8 rounded-3xl shadow-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/50 dark:border-slate-800/80 transition-all duration-300">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-2">
            <IoPersonAdd className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Join the RealTime chat community
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="text"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="text"
              placeholder="Unique username"
              autoComplete="username"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Confirm
              </label>
              <input
                value={user.confirmPassword}
                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                type="password"
                placeholder="Confirm"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Gender
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="gender"
                  checked={user.gender === 'male'}
                  onChange={() => handleGenderSelect('male')}
                  className="radio radio-primary radio-sm"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="gender"
                  checked={user.gender === 'female'}
                  onChange={() => handleGenderSelect('female')}
                  className="radio radio-primary radio-sm"
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Log in
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;