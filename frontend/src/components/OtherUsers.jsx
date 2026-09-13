import React from 'react';
import OtherUser from './OtherUser';
import useGetOtherUsers from '../hooks/useGetOtherUsers';
import { useSelector } from 'react-redux';

const OtherUsers = ({ search = '' }) => {
  useGetOtherUsers();
  const { otherUsers } = useSelector((store) => store.user);

  if (!otherUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-xs">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading contacts...</span>
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const displayedUsers = query
    ? otherUsers.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query)
      )
    : otherUsers;

  if (displayedUsers.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
        {query ? 'No matching contacts found' : 'No contacts available'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {displayedUsers.map((user) => (
        <OtherUser key={user._id} user={user} />
      ))}
    </div>
  );
};

export default OtherUsers;