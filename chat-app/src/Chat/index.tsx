import React, { useCallback, useEffect, useRef } from 'react';
import ChatSidebar from './chatSidebar';
import ChatMessages from './chatMessage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateGroupChat from './chatSidebar/createGroupChat';
import { setInfo } from '../state/reducers/screen';
import { RootState } from '../state/reducers';
import { AxiosRequestConfig } from 'axios';
import { socket } from '../config/chatLogics';
import {
  setError,
  setSelectedChat,
  setSocketConnected,
} from '../state/reducers/chat';
import { apiPut } from '../utils/api';

function Chats() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { socketConnection } = useSelector((state: RootState) => state.chat);
  const { generalError } = useSelector((state: RootState) => state.chat);
  const { newGroup } = useSelector((state: RootState) => state.screen);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { smallScreen } = useSelector((state: RootState) => state.screen);

  // Socket connection effect
  useEffect(() => {
    if (!user) {
      socket.disconnect();
      dispatch(setSocketConnected(false));
      return;
    }

    socket.connect();
    socket.off('connected');
    socket.on('connected', () => dispatch(setSocketConnected(true)));
    socket.emit('user connected', user._id);

    return () => {
      socket.emit('user disconnected', user._id);
      socket.disconnect();
      dispatch(setSocketConnected(false));
      socket.off('connected');
    };
  }, [user]);

  // changeSelectedChat callback
  const changeSelectedChat = useCallback(
    async (selectedChatId: string | null) => {
      if (!user?.token) return;

      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (selectedChatId) {
        await apiPut(
          '/api/user/updateselectedchat',
          { selectedChatId },
          config,
          undefined,
          dispatch,
        );
        socketConnection && socket.emit('join chat', selectedChatId);
      } else {
        socketConnection && socket.emit('leave chat');
      }
    },
    [user?.token, dispatch],
  );

  //  changeSelectedChat on selectedChat change
  useEffect(() => {
    const selectedChatId = selectedChat ? selectedChat._id : null;
    changeSelectedChat(selectedChatId);
  }, [selectedChat]);

  // If not logged in, redirect to sign-in
  useEffect(() => {
    if (!user) {
      changeSelectedChat(null);
      dispatch(setSelectedChat(null));
      navigate('/signin');
    }
  }, [user]);

  //Online/offline and unload events
  useEffect(() => {
    const handleOnline = () => dispatch(setError(''));
    const handleOffline = () =>
      dispatch(setError('Check your internet connection'));

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      changeSelectedChat(null);
      event.preventDefault();
      event.returnValue = 'You are closing the app';
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(setInfo(false));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <ChatSidebar changeSelectedChat={changeSelectedChat} />
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
