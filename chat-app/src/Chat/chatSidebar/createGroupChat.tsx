import axios, { AxiosRequestConfig } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCamera, FaTimes } from 'react-icons/fa';
import { setNewGroup, setSmallScreen } from '../../state/reducers/screen';
import { setChatChange, setSelectedChat } from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';
import { FadeLoading } from '../../config/ChatLoading';
import { BACKEND_API } from '../../config/chatLogics';
import SearchResult from '../../components/serchResult';
import { User } from '../../types';

function CreateGroupChat() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [chatList, setChatList] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [pic, setPic] = useState<string | undefined>(undefined);
  const ref = useRef<HTMLDivElement | null>(null);

  //selecting or adding users
  const addUsers = (user: User) =>
    chatList?.some((obj) => obj._id === user._id)
      ? setChatList([...chatList])
      : setChatList([...chatList, user]);

  //create group chat
  const handleCreateGroup = () => {
    setCreateGroupLoading(true);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const users = JSON.stringify(chatList.map((user) => user._id));

    axios
      .post(`${BACKEND_API}/api/chat/group`, { users, name, pic }, config)
      .then((response) => {
        dispatch(setSelectedChat(response.data));
        dispatch(setSmallScreen(false));
        dispatch(setNewGroup(false));
        dispatch(setChatChange(true));
        dispatch(setChatChange(true));
        setCreateGroupLoading(false);
      })
      .catch((error) => {
        setCreateGroupLoading(false);
        if (error.response) {
          setError(error.response.data.error);
        } else if (error.request) {
          alert(
            'Cannot reach the server. Please check your internet connection.',
          );
        } else {
          console.error('Error:', error.message);
        }
      });
  };

  //handle file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataURL = reader.result as string;
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
        className="flex flex-col items-center w-full h-fit max-h-[550px]  max-w-[400px]  py-[40px] bg-gray-200 relative rounded-[10px]"
      >
        <h2 className="text-xl font-bold mb-[20px] px-[20px]">
          Create a new group chat
        </h2>
        <div className="w-full px-[20px]">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value), setError('');
            }}
            placeholder="Chat name"
            className="outline-none w-full px-[15px] py-[5px]  my-[10px] rounded-sm"
            required
          />
        </div>
        <div className="w-full flex items-center justify-start px-[20px]">
          <div className=" inline-block">
            <div className="h-[40px] w-[40px] rounded-full border border-gray-400  bg-white relative cursor-pointer">
              <label htmlFor="createGroupInput">
                <div className="flex justify-center items-center h-full w-full rounded-full border border-gray-400  bg-white cursor-pointer">
                  {pic ? (
                    <img src={pic} className="h-full w-full rounded-full" />
                  ) : (
                    <FaCamera color="gray" />
                  )}
                </div>
              </label>
              <input
                id="createGroupInput"
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
        {error && (
          <div>
            <p className="text-sm px-[20px] text-red-500 before:content-['*'] before:text-red-500">
              {error}
            </p>
          </div>
        )}
        <div className="px-[20px] w-full">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value), setError('');
            }}
            placeholder="Add users eg. Bill, Mike"
            className="outline-none w-full px-[15px] py-[5px] my-[10px] rounded-sm"
          />
        </div>
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
          <SearchResult
            handleFunction={addUsers}
            search={search}
            chats={[]}
            selectLoading={null}
          />
        </div>

        <button
          className="absolute top-0 right-0 m-2"
          onClick={() => dispatch(setNewGroup(false))}
        >
          <FaTimes size={20} />
        </button>

        <button
          className="w-[200px] absolute bottom-0 right-0 font-bold bg-gray-300 active:bg-gray-500 rounded-3xl m-2 px-3 py-1 border border-gray-500"
          onClick={handleCreateGroup}
          disabled={createGroupLoading}
        >
          {createGroupLoading ? (
            <div className="flex h-full justify-center items-center">
              <div className="h-[2px] w-[2px] mr-3 mt-2">
                <FadeLoading height={5} width={3} margin={-12} />
              </div>
              <div>Loading...</div>
            </div>
          ) : (
            <div>Create group</div>
          )}
        </button>
      </div>
    </div>
  );
}

export default CreateGroupChat;
