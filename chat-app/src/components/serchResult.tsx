import React, { useEffect, useState } from 'react';
import { FadeLoading } from '../config/ChatLoading';
import { BACKEND_API } from '../config/chatLogics';
import axios, { AxiosRequestConfig } from 'axios';
import { RootState } from '../state/reducers';
import { useSelector } from 'react-redux';
import { SkeletonLoading } from '../config/ChatLoading';
import { Chat, User } from '../types';
import { FaUser } from 'react-icons/fa';

type Props = {
  handleFunction: (userInfo: User) => void;
  selectLoading: { [key: string]: boolean } | null;
  search: string;
  chats: Chat[] | null;
};

const SearchResult: React.FC<Props> = ({
  handleFunction,
  selectLoading,
  search,
  chats,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [noResult, setNoResult] = useState(false);

  //search user
  const handleSearch = async () => {
    if (search.trim() === '') {
      return;
    }
    setSearchLoading(true);
    try {
      setSearchLoading(true);
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(
        `${BACKEND_API}/api/user?search=${search.trim()}`,
        config,
      );

      if (chats) {
        const chatUserIds = chats
          .filter((chat: Chat) => !chat.isGroupChat)
          .flatMap((chat: Chat) =>
            chat.users.map((user: User) => user.username),
          );

        const usersNotInAnyChat = data.filter(
          (user: { username: string }) => !chatUserIds.includes(user.username),
        );

        usersNotInAnyChat.length !== 0
          ? setSearchResult(usersNotInAnyChat)
          : setNoResult(true);
      }

      setSearchLoading(false);
    } catch (error: unknown) {
      setSearchLoading(false);
      const err = error as {
        response?: { data?: { error?: string } };
        request?: unknown;
        message?: string;
      };
      if (err.response) {
        console.error('Server error:', err.response.data?.error);
        setNoResult(true);
      } else if (err.request) {
        alert(
          'Cannot reach the server. Please check your internet connection.',
        );
        setNoResult(true);
      } else {
        setNoResult(true);
        console.error('Error:', err.message);
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
        searchResult?.map((user: User) => (
          <button
            className={`hover:bg-gray-200 active:bg-gray-300  w-full h-[70px] px-[20px] py-[10px]`}
            onClick={() => handleFunction(user)}
            disabled={selectLoading !== null && selectLoading[user._id]}
            key={user._id}
          >
            <div className="flex justify-between items-center">
              <div className="w-full flex items-center ">
                <div className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-gray-400">
                  {user.pic ? (
                    <img
                      src={user?.pic}
                      alt="Profile"
                      className="w-full h-full rounded-full "
                    />
                  ) : (
                    <FaUser color="white" size={20} />
                  )}
                </div>
                <div className="flex flex-col items-start w-full pr-5 ml-[10px]">
                  <p className="truncate text-left capitalize">
                    {user?.username}
                  </p>
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
