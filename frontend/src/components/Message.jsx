import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Avatar from './Avatar';

const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '';
  }
};

const Message = ({ message }) => {
  const scroll = useRef();
  const { authUser, selectedUser } = useSelector((store) => store.user);

  const isSender = message?.senderId === authUser?._id;
  const messageUser = isSender ? authUser : selectedUser;

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  const formattedTime = formatTime(message?.createdAt);

  return (
    <div
      ref={scroll}
      className={`chat ${isSender ? 'chat-end' : 'chat-start'} my-2.5 transition-all duration-200`}
    >
      <div className="chat-image">
        <Avatar
          user={messageUser}
          size="sm"
          className="shadow-sm ring-1 ring-black/5 dark:ring-white/10"
        />
      </div>

      <div className="chat-header mb-1">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {formattedTime || (isSender ? 'You' : messageUser?.fullName?.split(' ')[0] || 'User')}
        </span>
      </div>

      <div
        className={`chat-bubble text-sm leading-relaxed max-w-[85%] sm:max-w-md break-words rounded-2xl px-4 py-2.5 ${
          isSender
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 shadow-sm'
        }`}
      >
        {message?.message}
      </div>
    </div>
  );
};

export default Message;