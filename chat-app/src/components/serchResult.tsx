import React, { useEffect, useState } from 'react';
import { FadeLoading } from '../config/ChatLoading';
import { BACKEND_API } from '../config/chatLogics';
import axios, { AxiosRequestConfig } from 'axios';
import { RootState } from '../state/reducers';
import { useSelector } from 'react-redux';
import { SkeletonLoading } from '../config/ChatLoading';

type Props = {
  handleFunction: (userInfo: Users) => void;
  selectLoading: { [key: string]: boolean } | null;
  search: string;
  chats: ChatInfo[];
};

interface Users {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
}

interface ChatInfo {
  groupAdmin: Users;
  _id: string;
  pic: string;
  latestMessage: any;
  unreadMessages: any[];
  chatName: string;
  isGroupChat: boolean;
  createdAt: string;
  users: Users[];
}

const SearchResult: React.FC<Props> = ({
  handleFunction,
  selectLoading,
  search,
  chats,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<Users[]>([]);
  const [noResult, setNoResult] = useState(false);

  //search user
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      setSearchLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(
        `${BACKEND_API}/api/user?search=${search}`,
        config,
      );

      const chatUserIds = chats
        .filter((chat: ChatInfo) => !chat.isGroupChat)
        .flatMap((chat: ChatInfo) =>
          chat.users.map((user: Users) => user.username),
        );

      const usersNotInAnyChat = data.filter(
        (user: { username: string }) => !chatUserIds.includes(user.username),
      );

      usersNotInAnyChat.length !== 0
        ? setSearchResult(usersNotInAnyChat)
        : setNoResult(true);

      setSearchLoading(false);
    } catch (error: any) {
      setSearchLoading(false);
      if (error.response) {
        console.error('Server error:', error.response.data.error);
      } else if (error.request) {
        alert(
          'Cannot reach the server. Please check your internet connection.',
        );
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  useEffect(() => {
    if (search === '') {
      setSearchResult([]);
      setNoResult(false);
    } else {
      handleSearch();
    }
  }, [search]);

  return (
    <section className="w-full h-full">
      {searchLoading ? (
        <SkeletonLoading />
      ) : noResult ? (
        <div className="text-gray-500 px-[20px] py-[10px]">
          No results found.
        </div>
      ) : (
        searchResult?.map((user: Users) => (
          <button
            className={`hover:bg-gray-200 active:bg-gray-300  w-full h-[70px] px-[20px] py-[10px]`}
            onClick={() => handleFunction(user)}
            disabled={selectLoading !== null && selectLoading[user._id]}
            key={user._id}
          >
            <div className="flex justify-between items-center">
              <div className="w-full flex items-center">
                <img
                  src={user?.pic}
                  alt="Profile"
                  className="w-[30px] h-[30px] rounded-full bg-gray-400"
                />
                <div className="flex flex-col items-start w-full pr-5 ml-[10px]">
                  <p className="truncate text-left">{user?.username}</p>
                  <p className=" text-sm text-left w-full truncate">
                    <span className="font-semibold">Email: </span>
                    <span className=" ml-[2px]  ">{user?.email}</span>
                  </p>
                </div>
              </div>
              {selectLoading !== null && selectLoading[user._id] && (
                <div className="h-[2px] w-[2px] mr-3 mt-2">
                  <FadeLoading height={5} width={3} margin={-12} />
                </div>
              )}
            </div>
          </button>
        ))
      )}
    </section>
  );
};

export default SearchResult;