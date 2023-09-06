import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCamera, FaCheck, FaTimes } from 'react-icons/fa';
import { setNewGroup, setSmallScreen } from '../../state/reducers/screen';
import {
  setChatChange,
  setChats,
  setSelectedChat,
} from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';

interface Users {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
}

const CreateGroupChat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Users[]>([]);
  const [chatList, setChatList] = useState<Users[]>([]);
  const [noResult, setNoResult] = useState(false);
  const [name, setName] = useState('');
  const [pic, setPic] = useState<string | undefined>(undefined);
  const ref = useRef<HTMLDivElement | null>(null);

  //search users
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
      data.length !== 0 ? setSearchResult(data) : setNoResult(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('wrong');
      console.error('Error:', error);
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

  //create group chat
  const handleCreatGroup = () => {
    setLoading(true);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const users = JSON.stringify(chatList.map((user) => user._id));

    axios
      .post(
        'http://localhost:5000/api/chat/group',
        { users, name, pic },
        config,
      )
      .then((response) => {
        dispatch(setSelectedChat(response.data));
        dispatch(setSmallScreen(false));
        dispatch(setNewGroup(false));
        dispatch(setChatChange(true));
        dispatch(setChatChange(true));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataURL = reader.result as string; // Explicitly cast to string
      // Use the dataURL or send it to your server for storage
      setPic(dataURL);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(setNewGroup(false));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-center items-center absolute top-0 left-0 h-full w-full  bg-black bg-opacity-30 z-30">
      <div
        ref={ref}
        className="flex flex-col items-center w-full h-full max-h-[500px] max-w-[400px] px-[20px] py-[40px] bg-gray-200 relative rounded-[10px]"
      >
        <h2 className="text-xl font-bold mb-[20px]">Create a new group chat</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Chat name"
          className="outline-none w-full px-[15px] py-[5px] my-[10px] rounded-sm"
        />
        <div className="w-full flex items-center justify-start m-1">
          <div className=" inline-block">
            <div className="h-[40px] w-[40px] rounded-full border border-gray-400  bg-white relative cursor-pointer">
              <label htmlFor="file-input">
                <div className="flex justify-center items-center h-full w-full rounded-full border border-gray-400  bg-white cursor-pointer">
                  {pic ? (
                    <img src={pic} className="h-full w-full rounded-full" />
                  ) : (
                    <FaCamera color="gray" />
                  )}
                </div>
              </label>
              <input
                id="file-input"
                className="hidden h-full w-full"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div>
            <p className="ml-2 text-sm">
              <span>Add group icon</span>
              <span className="ml-1 text-gray-500">(optional)</span>
            </p>
          </div>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Add users eg. Bill, Mike"
          className="outline-none w-full px-[15px] py-[5px] my-[10px] rounded-sm"
        />
        <div className="flex flex-wrap w-full py-[5px] border border-1 border-b-gray-400">
          {chatList.map((user) => (
            <div
              key={user?._id}
              className="flex justify-between items-center bg-gray-400 w-fit max-w-[120px] rounded-xl mx-1 my-1 px-[7px]"
            >
              <p className="truncate mr-1">{user.username}</p>
              <button
                onClick={() =>
                  setChatList(chatList?.filter((obj) => obj._id !== user._id))
                }
              >
                <FaTimes size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex-1 w-full overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar">
          {noResult && <p className="text-lg text-gray-500">No result found</p>}
          {searchResult.map((user) => (
            <button
              key={user?._id}
              onClick={() =>
                chatList?.some((obj) => obj._id === user._id)
                  ? setChatList([...chatList])
                  : setChatList([...chatList, user])
              }
              className={`w-full justify-center ${
                noResult ? 'hidden' : 'flex'
              }`}
            >
              <div className="w-full flex items-center">
                <img
                  src={user.pic}
                  alt="Profile"
                  className="w-[30px] h-[30px] rounded-full"
                />
                <div className="flex flex-col items-start min-w-[20px]  ml-[10px]">
                  <p className="truncate text-left" title={user.username}>
                    {user.username}
                  </p>
                  <p
                    className=" text-sm text-left w-full truncate "
                    title={user.email}
                  >
                    <span className="font-semibold">Email: </span>
                    <span className=" ml-2 ">{user.email}</span>
                  </p>
                </div>
              </div>
              {chatList?.some((obj) => obj._id === user._id) && (
                <FaCheck color="gray" />
              )}
            </button>
          ))}
        </div>
        <button
          className="absolute top-0 right-0 m-2"
          onClick={() => dispatch(setNewGroup(false))}
        >
          <FaTimes size={20} />
        </button>
        <button
          className="absolute bottom-0 right-0 font-bold bg-gray-400 active:bg-gray-500 rounded-3xl m-2 px-3 py-1"
          onClick={handleCreatGroup}
        >
          Create group
        </button>
      </div>
    </div>
  );
};

export default CreateGroupChat;
