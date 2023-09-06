import axios, { AxiosRequestConfig } from 'axios';
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
  const [noResult, setNoResult] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Users[]>([]);
  const [chatList, setChatList] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

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

  const handleAddUsers = () => {
    setLoading(true);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const userIds = JSON.stringify(chatList.map((user) => user._id));

    axios
      .put(
        'http://localhost:5000/api/chat/groupadd',
        { userIds, chatId: selectedChat?._id },
        config,
      )
      .then((response) => {
        dispatch(setChatChange(true));
        dispatch(setSelectedChat(response.data));
        setAddUser(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
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
        className="flex flex-col items-center h-full w-full max-h-[500px] max-w-[400px] px-[20px] py-[40px] bg-gray-200 relative rounded-[10px]"
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
          {noResult && <p className="text-lg text-gray-500">No result found</p>}
          {searchResult.map((user) => (
            <button
              key={user?._id}
              onClick={() =>
                chatList?.some((obj) => obj._id === user._id) ||
                selectedChat?.users.some((obj: Users) => obj._id === user._id)
                  ? setChatList([...chatList])
                  : setChatList([...chatList, user])
              }
              className={`w-full justify-between ${
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
                    <span className=" ml-2  truncate">{user.email}</span>
                  </p>
                </div>
              </div>
              <div>
                {selectedChat?.users.some(
                  (obj: Users) => obj._id === user._id,
                ) && <div className="text-sm text-gray-500">member</div>}
                {chatList?.some((obj) => obj._id === user._id) && (
                  <FaCheck color="gray" />
                )}
              </div>
            </button>
          ))}
        </div>
        <button
          className="absolute top-0 right-0 m-2"
          onClick={() => setAddUser(false)}
        >
          <FaTimes size={20} />
        </button>
        <button
          className="absolute bottom-0 right-0 font-bold bg-gray-400 active:bg-gray-500 rounded-3xl m-2 px-3 py-1"
          onClick={handleAddUsers}
        >
          Save participants
        </button>
      </div>
    </div>
  );
};

export default AddParticipant;
