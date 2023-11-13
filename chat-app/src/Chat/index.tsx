import React, { useEffect, useRef } from 'react';
import ChatSidebar from './chatSidebar';
import ChatMessages from './chatMessage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateGroupChat from './chatSidebar/createGroupChat';
import { setInfo } from '../state/reducers/screen';
import { RootState } from '../state/reducers';
import axios, { AxiosRequestConfig } from 'axios';
import { BACKEND_API } from '../config/chatLogics';

function Chats() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { info } = useSelector((state: RootState) => state.screen);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { smallScreen } = useSelector((state: RootState) => state.screen);
  const { newGroup } = useSelector((state: RootState) => state.screen);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user]);

  const updateSelectedChat = () => {
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const selectedChatId = selectedChat ? selectedChat._id : null;

    axios
      .put(
        `${BACKEND_API}/api/user/updateselectedchat`,
        { selectedChatId },
        config,
      )
      .catch((error) => {
        if (error.response) {
          console.error('Server error:', error.response.data.error);
        } else if (error.request) {
          alert(
            'Cannot reach the server. Please check your internet connection.',
          );
        } else {
          console.error('Error:', error.message);
        }
      });
  };

  useEffect(() => {
    updateSelectedChat();
  }, [selectedChat]);

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

  return (
    <div className="flex w-full h-full m-0 p-0">
      <div
        className={`${
          smallScreen ? 'block h-full w-full' : 'hidden'
        } sm:block sm:w-1/4 sm:min-w-[300px] `}
      >
        <ChatSidebar />
      </div>
      <div
        ref={ref}
        className={`${
          smallScreen ? 'hidden ' : 'block h-full w-full'
        } sm:block sm:w-3/4 flex-1  h-full`}
      >
        <ChatMessages />
      </div>
      {newGroup && <CreateGroupChat />}
    </div>
  );
}

export default Chats;
