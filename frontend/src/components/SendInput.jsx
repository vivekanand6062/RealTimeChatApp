import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';

const SendInput = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || !selectedUser?._id) return;

    setIsSending(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser._id}`,
        { message: cleanMessage },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      if (res?.data?.newMessage) {
        dispatch(setMessages([...(messages || []), res.data.newMessage]));
      }
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
      <div className="w-full relative flex items-center">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type your message..."
          disabled={isSending}
          className="w-full pl-4 pr-12 py-3 text-sm rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          aria-label="Send message"
          className="absolute right-2 p-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-600/30"
        >
          <IoSend className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default SendInput;