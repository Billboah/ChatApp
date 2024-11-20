import React, { useCallback, useEffect, useRef } from 'react';
import ChatSidebar from './chatSidebar';
import ChatMessages from './chatMessage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateGroupChat from './chatSidebar/createGroupChat';
import { setInfo } from '../state/reducers/screen';
import { RootState } from '../state/reducers';
import axios, { AxiosRequestConfig } from 'axios';
import { BACKEND_API } from '../config/chatLogics';
import { setError } from '../state/reducers/chat';

function Chats() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { generalError } = useSelector((state: RootState) => state.chat);
  const { newGroup } = useSelector((state: RootState) => state.screen);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { smallScreen } = useSelector((state: RootState) => state.screen);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user]);

  const changeSelectedChat = useCallback(
    (selectedChatId: string | null) => {
      if (user?.token) {
        const config: AxiosRequestConfig<any> = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };

        axios
          .put(
            `${BACKEND_API}/api/user/updateselectedchat`,
            { selectedChatId },
            config,
          )
          .then(() => {
            console.log('This is right');
          })
          .catch((error) => {
            if (error.response) {
              dispatch(setError(error.response.data.message));
            } else if (error.request) {
              console.error('No response received:', error.request);
              dispatch(setError('Network error, please try again later.'));
            } else {
              console.error('Error:', error.message);
              dispatch(setError('An error occurred, please try again.'));
            }
          });
      }
    },
    [user?.token],
  );

  useEffect(() => {
    const selectedChatId = selectedChat ? selectedChat._id : null;

    changeSelectedChat(selectedChatId);
  }, [selectedChat]);

  //handle disconnection and tab close
  useEffect(() => {
    const selectedChatId = selectedChat ? selectedChat._id : null;

    const handleOnline = () => {
      dispatch(setError(''));
    };

    const handleOffline = () => {
      dispatch(setError('Check you internet connection'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect tab close or navigation away
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      changeSelectedChat(selectedChatId);
      event.preventDefault();
      event.returnValue = 'You are closing the app'; // Required to prompt the user
    };

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
