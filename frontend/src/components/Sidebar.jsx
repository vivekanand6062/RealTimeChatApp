import React, { useState } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi';
import { IoLogOutOutline, IoPersonOutline } from 'react-icons/io5';
import OtherUsers from './OtherUsers';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';

const Sidebar = () => {
  const [search, setSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { otherUsers, authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
      navigate('/login');
      toast.success(res.data?.message || 'Logged out successfully');
      dispatch(setAuthUser(null));
      dispatch(setMessages(null));
      dispatch(setOtherUsers(null));
      dispatch(setSelectedUser(null));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
      console.error(error);
    }
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;
    const conversationUser = otherUsers?.find((user) =>
      user.fullName?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
    if (conversationUser) {
      dispatch(setSelectedUser(conversationUser));
      setSearch('');
    } else {
      toast.error('User not found!');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <>
      <div className="w-full flex flex-col h-full border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-colors duration-200">
        {/* Current User Header with Avatar, ThemeToggle, and Profile Edit */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3">
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
            title="Edit Profile"
          >
            <Avatar
              user={authUser}
              size="md"
              isOnline={true}
              showIndicator={true}
              className="ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold truncate text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {authUser?.fullName}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Online (You)</span>
              </div>
            </div>
          </div>

          {/* Action buttons: Profile & ThemeToggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsProfileOpen(true)}
              type="button"
              title="Profile Settings"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              <IoPersonOutline className="w-4 h-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <form onSubmit={searchSubmitHandler} className="relative flex items-center">
            <input
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="text"
              placeholder="Search contacts..."
            />
            <BiSearchAlt2 className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </form>
        </div>

        {/* User List Header */}
        <div className="px-4 py-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>Direct Messages</span>
          {otherUsers && <span>{otherUsers.length}</span>}
        </div>

        {/* Other Users List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <OtherUsers search={search} />
        </div>

        {/* Bottom Bar: Logout */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <button
            onClick={logoutHandler}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200"
          >
            <IoLogOutOutline className="w-4 h-4" />
            <span>Logout</span>
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            RealTime Chat
          </span>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Sidebar;