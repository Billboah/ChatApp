import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch } from 'react-icons/fa';
import axios, { AxiosRequestConfig } from 'axios';
import ChatList from './ChatList';
import {
  setChatChange,
  setChats,
  setSelectedChat,
} from '../../state/reducers/chat';
import ChatList2 from './ChatList2';
import {
  setNewGroup,
  setProfile,
  setSmallScreen,
} from '../../state/reducers/screen';
import Profile from './profile';
import { RootState } from '../../state/reducers';

interface Users {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
}

export default function chatSidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.screen);
  const { chatChange } = useSelector((state: RootState) => state.chat);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Users[]>([]);
  const [chatList, setChatList] = useState(true);

  //search user
  const handleSearch = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${search}`,
        config,
      );
      setSearchResult(data);
      setLoading(false);
    } catch {
      setLoading(false);
      console.log('wrong');
    }
  };

  useEffect(() => {
    if (search === '') {
      setChatList(true);
    } else {
      handleSearch();
      setChatList(false);
    }
  }, [search]);

  //display chats
  const displayChats = () => {
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    axios
      .get('http://localhost:5000/api/chat', config)
      .then((response) => {
        dispatch(setChats(response.data));
        dispatch(setChatChange(false));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    displayChats();
  }, [chatChange === true]);

  //select chat
  const accessChat = (userId: string) => {
    if (
      userId ===
      (selectedChat?.users[0]._id === user?.id
        ? selectedChat?.users[1]._id
        : selectedChat?.users[0]._id)
    ) {
      setChatList(true);
      dispatch(setSmallScreen(false));
      setLoading(false);
      setSearch('');
    } else {
      setLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      axios
        .post('http://localhost:5000/api/chat', { userId }, config)
        .then((response) => {
          dispatch(setSelectedChat(response.data.chat));
          dispatch(setSmallScreen(false));
          setChatList(true);
          dispatch(setChatChange(true));
          setLoading(false);
          setSearch('');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  };

  return (
    <div className="bg-gray-300 h-full w-full relative border border-r-gray-400 border-1">
      <div className="w-full h-full flex flex-col">
        <nav className="flex justify-between items-center bg-gray-200 w-full h-[50px] p-4">
          <button onClick={() => dispatch(setProfile(true))}>
            <img
              src={user?.pic}
              alt=""
              className="rounded-full h-[35px] w-[35px]"
              title="Profile"
            />
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
          {chatList ? (
            <ChatList2 />
          ) : searchResult.length === 0 && !chatList ? (
            <div className="text-gray-500 px-[20px] py-[10px]">
              No results found.
            </div>
          ) : (
            searchResult?.map((user: Users, index) => (
              <ChatList
                key={index}
                user={user}
                handleFunction={() => accessChat(user._id)}
              />
            ))
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
