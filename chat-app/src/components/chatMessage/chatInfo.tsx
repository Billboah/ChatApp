import React, { useState } from 'react';
import { FaCamera, FaCheck, FaPen, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo } from '../../state/reducers/screen';
import axios, { AxiosRequestConfig } from 'axios';
import { setChatChange, setSelectedChat } from '../../state/reducers/chat';
import AddParticipant from './addParticipant';
import { RootState } from '../../state/reducers';

const ChatInfo = () => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [changeGroupName, SetChangeGroupName] = useState(
    selectedChat?.chatName,
  );
  const [isHovered, setIsHovered] = useState(false);

  const handleRemoveUser = (removeUser: string) => {
    setLoading(true);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    axios
      .put(
        'http://localhost:5000/api/chat/groupremove',
        { userId: removeUser, chatId: selectedChat?._id },
        config,
      )
      .then((response) => {
        dispatch(setChatChange(true));
        dispatch(setSelectedChat(response.data));
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
      const dataURL = reader.result as string;

      setLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      axios
        .put(
          'http://localhost:5000/api/chat/changeicon',
          { pic: dataURL, chatId: selectedChat?._id },
          config,
        )
        .then((response) => {
          dispatch(setChatChange(true));
          dispatch(setSelectedChat(response.data));
          setNameEdit(false);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    };
    reader.readAsDataURL(file);
  };

  const handleChangeGroupName = () => {
    if (selectedChat?.chatName === changeGroupName) {
      setNameEdit(false);
      return;
    } else {
      setLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      axios
        .put(
          'http://localhost:5000/api/chat/rename',
          { chatName: changeGroupName, chatId: selectedChat?._id },
          config,
        )
        .then((response) => {
          dispatch(setChatChange(true));
          dispatch(setSelectedChat(response.data));
          setNameEdit(false);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  };

  return (
    <div className="h-full w-full flex-1 border-l border-l-gray-400  bg-gray-100">
      <nav className="flex items-center bg-gray-200 h-[50px] w-full px-[20px] text-gray-700">
        <button className="" onClick={() => dispatch(setInfo(false))}>
          <FaTimes size={17} />
        </button>
        {selectedChat?.isGroupChat ? (
          <h2 className="text-lg font-semibold  ml-[20px]">Group Info</h2>
        ) : (
          <h2 className="text-lg font-semibold ml-[20px]">Contact Info</h2>
        )}
      </nav>
      <div className="flex flex-col relative  h-full m-0 p-0 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar">
        <div className="flex items-center justify-center h-fit w-full py-[30px] px-[20px]  mb-[7px] bg-gray-300">
          {selectedChat?.isGroupChat ? (
            <div className="flex flex-col justify-center items-center">
              <div
                className=" inline-block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title="Change Icon"
              >
                <div className=" h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 relative cursor-pointer">
                  {isHovered && (
                    <label htmlFor="file-input">
                      <div className="flex flex-col  justify-center items-center h-full w-full rounded-full border border-gray-500  bg-black absolute  top-0 right-0 bg-opacity-30">
                        <FaCamera color="white" />
                        <p className="text-small text-white">
                          Change Group Icon
                        </p>
                      </div>
                    </label>
                  )}
                  <input
                    id="file-input"
                    className="hidden h-full w-full"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <div className="flex justify-center items-center h-full w-full rounded-full border border-gray-500  bg-gray-400 cursor-pointer">
                    <img
                      src={selectedChat?.pic}
                      alt="group icon"
                      className="rounded-full h-[180px] w-[180px]"
                    />
                  </div>
                </div>
              </div>
              <div
                className={`${
                  nameEdit && 'border-b-2 border-gray-500'
                } flex justify-center items-end px-2`}
              >
                {nameEdit ? (
                  <input
                    type="text"
                    value={changeGroupName}
                    onChange={(e) => SetChangeGroupName(e.target.value)}
                    placeholder="Type here..."
                    className="bg-inherit outline-none text-lg font-bold mt-[10px] mr-"
                  />
                ) : (
                  <p className="text-lg font-bold mt-[10px] mr-4">
                    {selectedChat?.chatName}
                  </p>
                )}
                {nameEdit ? (
                  <button className="mb-1" onClick={handleChangeGroupName}>
                    <FaCheck color="gray" />
                  </button>
                ) : (
                  <button onClick={() => setNameEdit(true)} className="mb-2">
                    <FaPen color="gray" size={15} />
                  </button>
                )}
              </div>
              <p className="text-md text-gray-600">
                {selectedChat?.users.length}
                {'  '}participants
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <img
                src={
                  selectedChat?.users[0]._id === user?.id
                    ? selectedChat?.users[1].pic
                    : selectedChat?.users[0].pic
                }
                alt="sender icon"
                className=" h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 "
              />
              <p className="text-lg font-bold mt-[10px]">
                {selectedChat?.users[0]._id === user?.id
                  ? selectedChat?.users[1].username
                  : selectedChat?.users[0].username}
              </p>
              <p className="text-md truncate text-gray-600">
                <span className="font-bold mr-1">Email:</span>
                <span>
                  {selectedChat?.users[0]._id === user?.id
                    ? selectedChat?.users[1].email
                    : selectedChat?.users[0].email}
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="mb-[7px] px-[20px] py-[10px] bg-gray-300 h-fit w-full">
          <div className="flex justify-between items-center">
            <p>media, links, and docs</p>
          </div>
        </div>
        {selectedChat?.isGroupChat && (
          <div className="mb-[7px]  py-[10px] bg-gray-300 h-fit w-full">
            <div className="flex flex-col ">
              <div className="flex justify-between items-center w-full mb-[7px] px-[20px]">
                <p className="text-gray-600">
                  {selectedChat?.users.length}
                  {'  '}participants
                </p>
                {selectedChat?.groupAdmin._id === user?.id && (
                  <button
                    onClick={() => setAddUser(true)}
                    className="px-[10px]   bg-gray-200 rounded-md border-1-inherit shadow-md active:shadow-inner"
                  >
                    Add a participant
                  </button>
                )}
              </div>
              {selectedChat?.users.map((participant) => (
                <div
                  key={participant._id}
                  className="flex justify-between items-center px-[20px] border-t border-gray-400 "
                >
                  <div className="w-full flex items-center py-[7px]">
                    <img
                      src={participant.pic}
                      alt="Profile"
                      className="w-[30px] h-[30px] rounded-full bg-gray-400"
                    />
                    <div className="flex flex-col items-start w-full ml-1">
                      {participant._id === user?.id ? (
                        <p className="truncate text-left">You</p>
                      ) : (
                        <p className="truncate text-left">
                          {participant.username}
                        </p>
                      )}
                      <p className=" text-sm text-left w-full truncate">
                        <span className="font-semibold">Email: </span>
                        <span className=" ml-[2px]  ">{participant.email}</span>
                      </p>
                    </div>
                  </div>
                  {selectedChat?.groupAdmin._id === participant._id && (
                    <p className="text-gray-500">Admin</p>
                  )}
                  {selectedChat?.groupAdmin._id === user?.id && (
                    <button
                      title="Remove a participant"
                      onClick={() => handleRemoveUser(participant._id)}
                    >
                      <FaTimes color="gray" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-[20px] py-[10px] bg-gray-300 h-full w-full">
          <div className="flex justify-between items-center text-red-500">
            {selectedChat?.isGroupChat ? (
              <div>
                <button>Exit group</button>
                {selectedChat?.groupAdmin._id === user?.id && (
                  <p>Delete group</p>
                )}
              </div>
            ) : (
              <p>Delete chat</p>
            )}
          </div>
        </div>
      </div>
      {addUser && <AddParticipant setAddUser={setAddUser} />}
    </div>
  );
};

export default ChatInfo;
