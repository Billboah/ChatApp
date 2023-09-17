import React, { useState } from 'react';
import { FaCamera, FaCheck, FaPen, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo } from '../../../state/reducers/screen';
import axios, { AxiosRequestConfig } from 'axios';
import { setChatChange, setSelectedChat } from '../../../state/reducers/chat';
import AddParticipant from './addParticipant';
import { RootState } from '../../../state/reducers';
import { FadeLoading } from '../../../config/ChatLoading';
import { BACKEND_API } from '../../../config/chatLogics';

function ChatInfo() {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [memberLoading, setMemberLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [groupIconLoading, setGroupIconLoading] = useState(false);
  const [groupNameLoading, setGroupNameLoading] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [changeGroupName, SetChangeGroupName] = useState(
    selectedChat?.chatName,
  );
  const [isHovered, setIsHovered] = useState(false);

  //remove a group member
  const handleRemoveUser = (removeUser: string) => {
    setMemberLoading((prevSelectLoading: any) => ({
      ...prevSelectLoading,
      [removeUser]: true,
    }));
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    axios
      .put(
        `${BACKEND_API}/api/chat/groupremove`,
        { userId: removeUser, chatId: selectedChat?._id },
        config,
      )
      .then((response) => {
        dispatch(setChatChange(true));
        dispatch(setSelectedChat(response.data));
        setMemberLoading((prevSelectLoading: any) => ({
          ...prevSelectLoading,
          [removeUser]: false,
        }));
      })
      .catch((error) => {
        console.error('Error:', error);
        setMemberLoading((prevSelectLoading: any) => ({
          ...prevSelectLoading,
          [removeUser]: false,
        }));
      });
  };

  //change group icon
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataURL = reader.result as string;

      setGroupIconLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      axios
        .put(
          `${BACKEND_API}/api/chat/changeicon`,
          { pic: dataURL, chatId: selectedChat?._id },
          config,
        )
        .then((response) => {
          dispatch(setChatChange(true));
          dispatch(setSelectedChat(response.data));
          setNameEdit(false);
          setGroupIconLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          setGroupIconLoading(false);
        });
    };
    reader.readAsDataURL(file);
  };

  // change group name
  const handleChangeGroupName = () => {
    if (selectedChat?.chatName === changeGroupName) {
      setNameEdit(false);
      return;
    } else {
      setGroupNameLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      axios
        .put(
          `${BACKEND_API}/api/chat/rename`,
          { chatName: changeGroupName, chatId: selectedChat?._id },
          config,
        )
        .then((response) => {
          dispatch(setChatChange(true));
          dispatch(setSelectedChat(response.data));
          setNameEdit(false);
          setGroupNameLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          setGroupNameLoading(false);
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
        <section className="flex items-center justify-center h-fit w-full py-[30px] px-[20px]  mb-[7px] bg-gray-300">
          {selectedChat?.isGroupChat ? (
            <div className="flex flex-col justify-center items-center">
              <div
                className=" inline-block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title={`${groupIconLoading ? '' : 'Change Icon'}`}
              >
                <div
                  className={`h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 relative ${
                    groupIconLoading ? ' cursor-auto' : 'cursor-pointer'
                  }`}
                >
                  {groupIconLoading ? (
                    <div className="flex  justify-center items-center h-full w-full rounded-full border border-gray-500  bg-white absolute  top-0 right-0 bg-opacity-50">
                      <FadeLoading height={10} width={5} margin={-7} />
                    </div>
                  ) : (
                    isHovered && (
                      <label htmlFor="group-input">
                        <div className="flex flex-col  justify-center items-center h-full w-full rounded-full border border-gray-500  bg-black absolute  top-0 right-0 bg-opacity-30 cursor-pointer">
                          <FaCamera color="white" />
                          <p className="text-small text-white">
                            Change Profile Icon
                          </p>
                        </div>
                      </label>
                    )
                  )}
                  <input
                    id="group-input"
                    className="hidden h-full w-full"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={groupIconLoading}
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
                  <button
                    className="mb-1"
                    onClick={handleChangeGroupName}
                    disabled={groupNameLoading}
                  >
                    {groupNameLoading ? (
                      <div className="mb-[-10px] mr-[-15px]">
                        <FadeLoading height={5} width={3} margin={-12} />
                      </div>
                    ) : (
                      <FaCheck color="gray" />
                    )}
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
                  selectedChat?.users[0]._id === user?._id
                    ? selectedChat?.users[1].pic
                    : selectedChat?.users[0].pic
                }
                alt="sender icon"
                className=" h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 "
              />
              <p className="text-lg font-bold mt-[10px]">
                {selectedChat?.users[0]._id === user?._id
                  ? selectedChat?.users[1].username
                  : selectedChat?.users[0].username}
              </p>
              <p className="text-md truncate text-gray-600">
                <span className="font-bold mr-1">Email:</span>
                <span>
                  {selectedChat?.users[0]._id === user?._id
                    ? selectedChat?.users[1].email
                    : selectedChat?.users[0].email}
                </span>
              </p>
            </div>
          )}
        </section>
        <section className="mb-[7px] px-[20px] py-[10px] bg-gray-300 h-fit w-full">
          <div className="flex justify-between items-center">
            <p>media, links, and docs</p>
          </div>
        </section>

        {selectedChat?.isGroupChat && (
          <section className="mb-[7px]  py-[10px] bg-gray-300 h-fit w-full">
            <div className="flex flex-col ">
              <div className="flex justify-between items-center w-full mb-[7px] px-[20px]">
                <p className="text-gray-600">
                  {selectedChat?.users.length}
                  {'  '}participants
                </p>
                {selectedChat?.groupAdmin._id === user?._id && (
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
                  <div className=" w-full min-w-[50px] flex items-center flex-1  py-[7px] mr-1">
                    <img
                      src={participant.pic}
                      alt="Profile"
                      className="w-[30px] h-[30px] rounded-full bg-gray-400"
                    />
                    <div className="w-full min-w-[50px] flex flex-col  items-start mx-2">
                      {participant._id === user?._id ? (
                        <p className="w-full  text-left ">You</p>
                      ) : (
                        <p className="w-full  truncate text-left pr-2">
                          {participant.username}
                        </p>
                      )}
                      <p className="w-full  text-sm text-left truncate pr-2">
                        <span className="font-semibold">Email: </span>
                        <span className=" ml-[2px]  ">{participant.email}</span>
                      </p>
                    </div>
                  </div>
                  {selectedChat?.groupAdmin._id === participant._id && (
                    <div className="w-[100px] mx-1 flex justify-center items-center">
                      <p className="text-sm text-blue-800">Admin</p>
                    </div>
                  )}
                  {selectedChat?.groupAdmin._id === user?._id && (
                    <button
                      title="Remove a participant"
                      onClick={() => handleRemoveUser(participant._id)}
                      disabled={memberLoading[participant._id]}
                      className="flex justify-center items-center h-5 w-5  ml-3"
                    >
                      {memberLoading[participant._id] ? (
                        <div className="flex  justify-center items-center mb-[-25px] mr-[-15px] ">
                          <FadeLoading height={5} width={3} margin={-12} />
                        </div>
                      ) : (
                        <div className=" rounded-md border-1-inherit shadow-md active:shadow-inner">
                          <FaTimes color="gray" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className=" pb-16 bg-gray-300 h-full w-full">
          <div className="flex justify-between items-center text-red-500">
            {selectedChat?.isGroupChat ? (
              <div className="w-full">
                {user && (
                  <button
                    onClick={() => handleRemoveUser(user._id)}
                    className="w-full flex justify-between items-center border-b border-gray-400 px-[20px] py-[10px] hover:bg-gray-200 outline-none"
                    disabled={memberLoading[user._id]}
                  >
                    <div>Exit group</div>
                    {memberLoading[user._id] && (
                      <div className="flex justify-center items-center mb-[-30px] mr-[-10px] ">
                        <FadeLoading height={5} width={3} margin={-12} />
                      </div>
                    )}
                  </button>
                )}
                {selectedChat?.groupAdmin._id === user?._id && (
                  <p className="px-[20px]">Delete group chat</p>
                )}
              </div>
            ) : (
              <p className="px-[20px]">Delete chat</p>
            )}
          </div>
        </section>
      </div>
      {addUser && <AddParticipant setAddUser={setAddUser} />}
    </div>
  );
}

export default ChatInfo;
