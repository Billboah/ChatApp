import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setChatChange, setSelectedChat } from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';
import { FadeLoading, SkeletonLoading } from '../../config/ChatLoading';
import { BACKEND_API } from '../../config/chatLogics';
import SearchResult from '../../components/serchResult';

interface Users {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
}

interface UserProps {
  setAddUser: Dispatch<SetStateAction<boolean>>;
}

const AddParticipant = ({ setAddUser }: UserProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');
  const [chatList, setChatList] = useState<Users[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const dispatch = useDispatch();

  //selecting or adding users
  const addUsers = (user: Users) =>
    chatList?.some((obj) => obj._id === user._id)
      ? setChatList([...chatList])
      : setChatList([...chatList, user]);

  //add users
  const handleAddUsers = () => {
    setAddLoading(true);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const userIds = JSON.stringify(chatList.map((user) => user._id));

    axios
      .put(
        `${BACKEND_API}/api/chat/groupadd`,
        { userIds, chatId: selectedChat?._id },
        config,
      )
      .then((response) => {
        dispatch(setChatChange(true));
        dispatch(setSelectedChat(response.data));
        setAddUser(false);
        setAddLoading(false);
      })
      .catch((error) => {
        setAddLoading(false);
        if (error.response) {
          if (error.response.status === 400) {
            setError(error.response.data.error);
          } else {
            console.error('Server error:', error.response.data.error);
          }
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
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAddUser(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-center items-center absolute top-0 left-0 h-full w-full bg-black bg-opacity-30 z-30">
      <div
        ref={ref}
        className="flex flex-col items-center h-fit w-full  max-h-[550px] max-w-[400px] px-[20px] py-[40px] bg-gray-200 relative rounded-[10px]"
      >
        <h1 className="text-xl font-bold">{selectedChat?.chatName}</h1>
        <p className="text-gl font-semibold mb-[20px]">Add participants</p>

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
          <SearchResult
            handleFunction={addUsers}
            search={search}
            chats={[]}
            selectLoading={null}
          />
        </div>

        <button
          className="absolute top-0 right-0 m-2"
          onClick={() => setAddUser(false)}
        >
          <FaTimes size={20} />
        </button>
        <button
          className="w-[200px] absolute bottom-0 right-0 font-bold bg-gray-400 active:bg-gray-500 rounded-3xl m-2 px-3 py-1"
          onClick={handleAddUsers}
          disabled={addLoading}
        >
          {addLoading ? (
            <div className="flex h-full justify-center items-center">
              <div className="h-[2px] w-[2px] mr-3 mt-2">
                <FadeLoading height={5} width={3} margin={-12} />
              </div>
              <div>Loading...</div>
            </div>
          ) : (
            <div>Save participants</div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddParticipant;
