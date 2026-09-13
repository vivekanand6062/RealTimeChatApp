import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoClose, IoCameraOutline, IoCheckmarkCircle, IoWarningOutline } from 'react-icons/io5';
import Avatar from './Avatar';
import DeleteAccountModal from './DeleteAccountModal';
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '..';

const PRESET_SEEDS = ['Felix', 'Aneka', 'Oliver', 'Milo', 'Luna', 'Zoe', 'Leo', 'Maya'];

const ProfileModal = ({ isOpen, onClose }) => {
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [photoUrl, setPhotoUrl] = useState(authUser?.avatar || authUser?.profilePhoto || '');
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (seed) => {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setPhotoUrl(url);
  };

  const handleUseInitials = () => {
    setPhotoUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.put(`${BASE_URL}/api/v1/user/profile`, {
        fullName,
        profilePhoto: photoUrl,
        avatar: photoUrl,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Profile updated successfully!');
        dispatch(setAuthUser(res.data.user));
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div
          className="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex-shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Account Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your profile and account
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Avatar Preview Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <Avatar
                    src={photoUrl}
                    name={fullName || authUser?.fullName}
                    size="xl"
                    isOnline={true}
                    className="ring-4 ring-indigo-500/20 shadow-lg"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    @{authUser?.username}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active Now</span>
                  </div>
                </div>
              </div>

              {/* Preset Avatar Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Choose an Avatar Preset
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_SEEDS.slice(0, 4).map((seed) => {
                    const seedUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    const isSelected = photoUrl === seedUrl;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => handlePresetSelect(seed)}
                        className={`relative p-1 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <img src={seedUrl} alt={seed} className="w-9 h-9 rounded-full mx-auto" />
                        {isSelected && (
                          <IoCheckmarkCircle className="absolute -top-1 -right-1 w-4 h-4 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleUseInitials}
                    title="Use Clean Initials Badge"
                    className={`flex flex-col items-center justify-center p-1 rounded-xl border text-xs font-medium transition-all ${
                      photoUrl === ''
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      Aa
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Custom Avatar URL Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Custom Avatar Image URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <IoCameraOutline className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Leave blank to automatically use your clean initials badge.
                </p>
              </div>

              {/* Profile Save Button */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>

            {/* Danger Zone Section */}
            <div className="pt-5 border-t border-rose-200/80 dark:border-rose-900/60">
              <div className="flex items-center gap-1.5 mb-2.5 text-rose-600 dark:text-rose-400">
                <IoWarningOutline className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-rose-950 dark:text-rose-200">
                    Delete Account
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                    Permanently delete your account, credentials, and settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-600/25 flex-shrink-0"
                >
                  Delete Account...
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Password Re-authentication Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default ProfileModal;
