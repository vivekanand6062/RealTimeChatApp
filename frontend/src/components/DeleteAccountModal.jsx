import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoWarningOutline, IoClose, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { setAuthUser, setSelectedUser, setOtherUsers } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { setSocket } from '../redux/socketSlice';
import { BASE_URL } from '..';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { socket } = useSelector((store) => store.socket);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setPassword('');
    setConfirmed(false);
    setErrorMessage('');
    onClose();
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your current password to continue.');
      return;
    }
    if (!confirmed) {
      setErrorMessage('Please confirm that you understand this action is permanent.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      axios.defaults.withCredentials = true;
      const res = await axios.delete(`${BASE_URL}/api/v1/user/delete-account`, {
        data: { password: password.trim() },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        // Disconnect socket cleanly
        if (socket) {
          socket.close();
          dispatch(setSocket(null));
        }

        // Invalidate all client-side authentication and chat state
        dispatch(setAuthUser(null));
        dispatch(setSelectedUser(null));
        dispatch(setOtherUsers(null));
        dispatch(setMessages(null));

        toast.success(res.data.message || 'Your account has been permanently deleted.');
        handleClose();
        navigate('/login');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'Unable to delete your account right now. Please try again later.';
      setErrorMessage(msg);
      toast.error(msg);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-300/60 dark:border-rose-900/60 shadow-2xl overflow-hidden transition-all duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/70 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40">
              <IoWarningOutline className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-950 dark:text-rose-200">
                Delete Account
              </h2>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                Permanent and irreversible action
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
            <p className="font-semibold mb-1">Are you absolutely sure?</p>
            <p>
              This will permanently delete your profile, credentials, and account settings. You will be immediately logged out and will not be able to log in with these credentials again.
            </p>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <IoWarningOutline className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Password Re-authentication Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Enter Your Current Password to Continue
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={loading}
                autoComplete="current-password"
                placeholder="Current password"
                required
                className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <IoEyeOffOutline className="w-4 h-4" />
                ) : (
                  <IoEyeOutline className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Explicit Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (errorMessage) setErrorMessage('');
              }}
              disabled={loading}
              className="checkbox checkbox-error checkbox-sm mt-0.5 rounded"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
              I understand that this action cannot be undone and my account will be permanently deleted.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim() || !confirmed}
              className="px-5 py-2 text-sm font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-rose-600/30 flex items-center gap-2"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Deleting Account...' : 'Delete My Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
