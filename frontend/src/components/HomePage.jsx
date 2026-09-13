import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import MessageContainer from './MessageContainer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { authUser, selectedUser } = useSelector((store) => store.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  return (
    <div className="w-full max-w-5xl h-[92vh] max-h-[800px] flex rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/70 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-300">
      {/* Sidebar: Always visible on md+, conditionally visible on mobile if no conversation selected */}
      <div
        className={`h-full flex-shrink-0 flex-col ${
          selectedUser ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-88`}
      >
        <Sidebar />
      </div>

      {/* Message Area: Always visible on md+, conditionally visible on mobile if conversation selected */}
      <div
        className={`flex-1 h-full min-w-0 flex-col ${
          !selectedUser ? 'hidden md:flex' : 'flex'
        }`}
      >
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;