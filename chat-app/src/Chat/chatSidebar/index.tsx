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

  //display chats
  useEffect(() => {
    setChatsLoading(true);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

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
  }, []);

  //select chat
  const accessChat = (userInfo: User) => {
    const userId = userInfo._id;
    setSelectLoading((prevSelectLoading: any) => ({
      ...prevSelectLoading,
      [userId]: true,
    }));
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    axios
      .post(`${BACKEND_API}/api/chat`, { userId }, config)
      .then((response) => {
        dispatch(setSelectedChat(response.data));
        dispatch(updateChat(response.data));
        dispatch(setSmallScreen(false));
        setSelectLoading((prevSelectLoading: any) => ({
          ...prevSelectLoading,
          [userId]: false,
        }));
        setSearch('');
      })
      .catch((error) => {
        setSelectLoading((prevSelectLoading: any) => ({
          ...prevSelectLoading,
          [userId]: false,
        }));
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
  };

  // search chat
  const filteredChats = chats?.filter(
    (item: { chatName: string; users: any[]; isGroupChat: boolean }) => {
      const searchLowerCase = search.trim().toLowerCase();

      if (item.isGroupChat === true) {
        return item.chatName.toLowerCase().includes(searchLowerCase);
      } else {
        return (
          item?.users[0]._id === user?._id
            ? item.users[1].username
            : item.users[0].username
        )
          .toLowerCase()
          .includes(searchLowerCase);
      }
    },
  );

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
