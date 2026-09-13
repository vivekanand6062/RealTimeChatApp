import React, { useEffect } from 'react';
import Signup from './components/Signup';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { setSocket } from './redux/socketSlice';
import { setOnlineUsers, removeOtherUser } from './redux/userSlice';
import { BASE_URL } from '.';
import { ThemeProvider } from './context/ThemeContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

function App() {
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    let socketio = null;
    if (authUser?._id) {
      socketio = io(`${BASE_URL}`, {
        withCredentials: true,
      });

      dispatch(setSocket(socketio));

      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('userDeleted', (deletedUserId) => {
        dispatch(removeOtherUser(deletedUserId));
      });

      socketio.on('connect_error', (err) => {
        console.warn('Socket connection error:', err?.message);
      });

      return () => {
        socketio.off('getOnlineUsers');
        socketio.off('userDeleted');
        socketio.off('connect_error');
        socketio.close();
        dispatch(setSocket(null));
      };
    } else {
      dispatch(setOnlineUsers([]));
      dispatch(setSocket(null));
    }
  }, [authUser?._id, dispatch]);

  return (
    <ThemeProvider>
      <div className="app-bg-overlay flex items-center justify-center p-2 sm:p-4 min-h-screen overflow-x-hidden">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}

export default App;
