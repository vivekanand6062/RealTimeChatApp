import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice';
import Avatar from './Avatar';

const OtherUser = ({ user }) => {
  const dispatch = useDispatch();
  const { selectedUser, onlineUsers } = useSelector((store) => store.user);

  const isOnline = Boolean(onlineUsers && onlineUsers.includes(user?._id));
  const isSelected = selectedUser?._id === user?._id;

  const selectedUserHandler = () => {
    dispatch(setSelectedUser(user));
  };

  return (
    <div
      onClick={selectedUserHandler}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectedUserHandler()}
      className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 select-none mb-1 ${
        isSelected
          ? 'bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-900 dark:text-white ring-1 ring-indigo-500/30 shadow-sm'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
      }`}
    >
      <Avatar
        user={user}
        size="md"
        isOnline={isOnline}
        showIndicator={true}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">
            {user?.fullName || user?.username}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isOnline
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                : 'bg-slate-400 dark:bg-slate-500'
            }`}
          />
          <span
            className={`text-xs font-medium truncate ${
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
  );
};

export default OtherUser;