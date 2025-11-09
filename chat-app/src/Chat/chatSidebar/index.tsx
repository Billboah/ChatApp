import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch, FaUser } from 'react-icons/fa';
import axios, { AxiosRequestConfig } from 'axios';
import {
  setChats,
  setError,
  setSelectedChat,
  updateChat,
} from '../../state/reducers/chat';
import {
  setNewGroup,
  setProfile,
  setSmallScreen,
} from '../../state/reducers/screen';
import Profile from './profile';
import { RootState } from '../../state/reducers';
import { BACKEND_API } from '../../config/chatLogics';
import SearchResult from '../../components/serchResult';
import ChatList from './chatList';
import { Chat, User } from '../../types';
import { SkeletonLoading } from '../../config/ChatLoading';

// Inform TypeScript that a global `window.socket` may exist.
declare global {
  interface Window {
    socket?: any;
  }
}

export default function chatSidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.screen);
  const { chats } = useSelector((state: RootState) => state.chat);
  const [selectLoading, setSelectLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [search, setSearch] = useState('');
  const [chatsLoading, setChatsLoading] = useState(false);

  // Initialize socket listeners and fetch chats
  useEffect(() => {
    setChatsLoading(true);
    const socket = window.socket;
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    // Initial chat fetch
    axios
      .get(`${BACKEND_API}/api/chat`, config)
      .then((response) => {
        dispatch(setChats(response.data));
        setChatsLoading(false);
      })
      .catch((error) => {
        setChatsLoading(false);
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

    // Listen for new chats
    if (socket) {
      const handleNewChat = (chat: Chat) => {
        dispatch(updateChat(chat));
      };

      socket.on('new chat', handleNewChat);

      // Cleanup
      return () => {
        socket.off('new chat', handleNewChat);
      };
    }
  }, []);

  //select or create individual chat
  const accessChat = (userInfo: User) => {
    const userId = userInfo._id;
    setSelectLoading((prevSelectLoading) => ({
      ...prevSelectLoading,
      [userId]: true,
    }));

    // Get socket instance
    const socket = window.socket;

    if (!socket) {
      dispatch(setError('Socket connection not available'));
      setSelectLoading((prevSelectLoading) => ({
        ...prevSelectLoading,
        [userId]: false,
      }));
      return;
    }

    // Request chat access through socket
    socket.emit('access chat', userId);

    // Handle chat access response
    const handleChatAccess = (chat: Chat) => {
      dispatch(setSelectedChat(chat));
      dispatch(updateChat(chat));
      dispatch(setSmallScreen(false));
      setSelectLoading((prevSelectLoading) => ({
        ...prevSelectLoading,
        [userId]: false,
      }));
      setSearch('');
      // Remove these event listeners after handling
      socket.off('chat accessed', handleChatAccess);
      socket.off('error', handleError);
    };

    // Handle any errors
    const handleError = (error: string) => {
      dispatch(setError(error));
      setSelectLoading((prevSelectLoading) => ({
        ...prevSelectLoading,
        [userId]: false,
      }));
      // Remove these event listeners after handling
      socket.off('chat accessed', handleChatAccess);
      socket.off('error', handleError);
    };

    // Set up event listeners
    socket.on('chat accessed', handleChatAccess);
    socket.on('error', handleError);
  };

  // search chat
  const filteredChats = chats?.filter((cht: Chat) => {
    const searchLowerCase = search.trim().toLowerCase();

    if (!user) return false;

    if (cht.isGroupChat === true) {
      return cht.chatName.toLowerCase().includes(searchLowerCase);
    } else {
      // One-on-one chat
      const users = Array.isArray(cht.users) ? cht.users : [];

      // Find the other user in the one-on-one chat
      const otherUser =
        users.find((u) => u._id !== user._id) ?? users[0] ?? null;
      const otherUsername = otherUser
        ? otherUser.username || otherUser.name || 'Unknown'
        : 'Unknown';

      return otherUsername.toLowerCase().includes(searchLowerCase);
    }
  });

  return (
    <div className="bg-gray-300 h-full w-full relative border border-r-gray-400 border-1">
      <div className="w-full h-full flex flex-col">
        <nav className="flex justify-between items-center bg-gray-200 w-full h-[50px] p-4">
          <button
            onClick={() => dispatch(setProfile(true))}
            className="flex justify-center items-center bg-gray-400 rounded-full h-[35px] w-[35px]"
          >
            {user?.pic ? (
              <img
                src={user?.pic}
                alt="user icon"
                className="h-full w-full rounded-full"
                title="Profile"
                height={35}
                width={35}
                loading="lazy"
                aria-label="user icon"
              />
            ) : (
              <FaUser color="white" size={25} />
            )}
          </button>
          <button
            onClick={() => dispatch(setNewGroup(true))}
            className="flex justify-between items-center bg-gray-300 px-[10px] py-[3px] rounded-[20px] border-1-inherit shadow-md active:shadow-inner"
          >
            <p className="text-sm mr-1">New group</p>
            <FaPlus size={10} />
          </button>
        </nav>
        <div>
          <div className="flex items-center py-[8px] px-[20px] mx-[20px] my-[10px] bg-gray-200 rounded-md">
            <FaSearch color="gray" size={15} />
            <input
              type="search"
              placeholder="Search or start a new chat"
              className="flex-1 ml-[20px] outline-none bg-inherit placeholder:text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full h-full flex-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar">
          {!search.trim() ? (
            <>
              {chatsLoading ? (
                <SkeletonLoading />
              ) : (
                <div className="w-full h-full">
                  {chats !== null &&
                    chats.map((chat: Chat) => (
                      <ChatList
                        key={chat._id}
                        chat={chat}
                        setSearch={setSearch}
                      />
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-fit">
              {filteredChats &&
                filteredChats.map((chat: Chat) => (
                  <ChatList key={chat._id} chat={chat} setSearch={setSearch} />
                ))}
              <div className="w-full text-sm border-1 relative m-5">
                <div className="border border-gray-400 "></div>
                <div className="absolute top-[-10px] left-[30%] text-gray-500 bg-gray-300 w-fit px-2 z-10">
                  Start a new chat
                </div>
              </div>
              <SearchResult
                handleFunction={accessChat}
                selectLoading={selectLoading}
                search={search}
                chats={chats}
              />
            </div>
          )}
        </div>
      </div>
      <div
        className={`h-full w-full bg-gray-300 absolute top-0 left-0 z-20  animate__animated animate__delay-300ms 
        ${
          profile === null
            ? 'hidden'
            : profile === true
            ? 'animate__fadeInLeft '
            : 'animate__fadeOutLeft'
        }
         `}
      >
        <Profile />
      </div>
    </div>
  );
}
