import React from 'react';
import SendInput from './SendInput';
import Messages from './Messages';
import Avatar from './Avatar';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice';
import { IoArrowBack, IoChatbubblesOutline } from 'react-icons/io5';

const MessageContainer = () => {
  const { selectedUser, authUser, onlineUsers } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const isOnline = Boolean(onlineUsers && selectedUser?._id && onlineUsers.includes(selectedUser._id));

  const handleBackToSidebar = () => {
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-colors duration-200">
      {selectedUser ? (
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Conversation Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
            {/* Mobile Back Button */}
            <button
              onClick={handleBackToSidebar}
              type="button"
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to contacts"
              aria-label="Back to contacts"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>

            {/* User Avatar with Presence Badge */}
            <Avatar
              user={selectedUser}
              size="md"
              isOnline={isOnline}
              showIndicator={true}
            />

            {/* User Details & Online/Offline status */}
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="font-bold text-sm sm:text-base truncate text-slate-900 dark:text-white">
                {selectedUser?.fullName || selectedUser?.username}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/60 animate-pulse'
                      : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    isOnline
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <Messages />

          {/* Message Input Box */}
          <SendInput />
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
            <IoChatbubblesOutline className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Welcome, {authUser?.fullName}!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-sm mb-4">
            Select a contact from the sidebar to start a real-time conversation.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected & Ready</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;