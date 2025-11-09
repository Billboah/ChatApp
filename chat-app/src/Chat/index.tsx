import React, { useEffect, useRef } from 'react';
import ChatSidebar from './chatSidebar';
import ChatMessages from './chatMessage';
import { useDispatch, useSelector } from 'react-redux';
import CreateGroupChat from './chatSidebar/createGroupChat';
import { RootState } from '../state/reducers';
import {
  setError,
  setSelectedChat,
  setSocketConnected,
} from '../state/reducers/chat';
import socket from '../socket/socket';
import { useNavigate } from 'react-router-dom';

function Chats() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { generalError } = useSelector((state: RootState) => state.chat);
  const { newGroup } = useSelector((state: RootState) => state.screen);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { smallScreen } = useSelector((state: RootState) => state.screen);
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ If no user → clean up and redirect
    if (!user) {
      socket.emit('leave chat', null);
      socket.emit('user disconnected');
      socket.disconnect();

      dispatch(setSelectedChat(null));
      dispatch(setSocketConnected(false));

      navigate('/signin');
      return;
    }

    // 2️⃣ Connect socket with authentication
    if (!socket.connected) {
      socket.auth = { token: user?.token }; // Set auth token
      socket.connect();
    }

    // 3️⃣ Once connected → identify the user
    socket.on('connect', () => {
      socket.emit('user connected', user?._id);
      dispatch(setSocketConnected(true));
    });

    // 4️⃣ Handle disconnection
    socket.on('disconnect', () => {
      dispatch(setSocketConnected(false));
    });

    // 5️⃣ Online/offline feedback
    const handleOnline = () => dispatch(setError(''));
    const handleOffline = () =>
      dispatch(setError('Check your internet connection'));

    // 6️⃣ Before closing or leaving the page
    const handleBeforeUnload = () => {
      if (user?._id) {
        socket.emit('user disconnected', user._id);
      }
      socket.emit('leave chat', null); // Leave any joined chat room
      socket.disconnect();

      dispatch(setSelectedChat(null));
    };

    // 7️⃣ Register browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 8️⃣ Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  //handle error disappearing
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setError(''));
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, [generalError]);

  return (
    <div className="w-full h-screen m-0 p-0">
      {user && (
        <div className="flex w-full h-full m-0 p-0">
          <div
            className={`${
              smallScreen ? 'block h-full w-full' : 'hidden'
            } md:block md:w-[350px] `}
          >
            <ChatSidebar />
          </div>
          <div
            ref={ref}
            className={`${
              smallScreen ? 'hidden ' : 'block h-full w-full'
            } md:block md:w-3/4 flex-1  h-full`}
          >
            <ChatMessages />
          </div>
          {newGroup && <CreateGroupChat />}
        </div>
      )}
      {generalError && (
        <div
          className={` animate__fadeInUp animate__animated animate__delay-300ms absolute  bottom-[20px] flex h-fit w-full items-center justify-center p-[10px] `}
        >
          <button
            className="flex h-fit w-full max-w-[500px] items-center justify-center rounded border border-inherit bg-red-500 px-1 py-2 text-white shadow-lg font-semibold"
            onClick={() => dispatch(setError(''))}
          >
            {generalError}
          </button>
        </div>
      )}
    </div>
  );
}

export default Chats;
