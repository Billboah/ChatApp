import React, { useEffect, useState } from 'react';
import {
  FaCamera,
  FaCheck,
  FaPen,
  FaTimes,
  FaUser,
  FaUserFriends,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo } from '../../../state/reducers/screen';
import axios, { AxiosRequestConfig } from 'axios';
import { setError, setSelectedChat } from '../../../state/reducers/chat';
import AddParticipant from './addParticipant';
import { RootState } from '../../../state/reducers';
import { ClipLoading, FadeLoading } from '../../../config/ChatLoading';
import { BACKEND_API, getSender } from '../../../config/chatLogics';
import { Chat, User } from '../../../types';
import CustomModal from '../../../components/Modal';

function ChatInfo() {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { info } = useSelector((state: RootState) => state.screen);
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
  const [commonGroup, setCommonGroup] = useState([]);
  const [commonGroupLoading, setCommonGroupLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  //handle remove user button
  const removeUserButton = (userPass: User) => {
    setIsModalOpen(true);
    setParticipantId(userPass._id);
    setModalMessage(
      `Are you sure you want to  remove ${userPass.username} from  ${selectedChat?.chatName} group chat?`,
    );
  };

  //handle leave group
  const exitGroupChat = (user: User) => {
    setIsModalOpen(true);
    setParticipantId(user._id);
    setModalMessage(
      `Are you sure you want to leave ${selectedChat?.chatName}  group chat?`,
    );
  };

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
        dispatch(setSelectedChat(response.data));
        setMemberLoading((prevSelectLoading: any) => ({
          ...prevSelectLoading,
          [removeUser]: false,
        }));
      })
      .catch((error: any) => {
        setMemberLoading((prevSelectLoading: any) => ({
          ...prevSelectLoading,
          [removeUser]: false,
        }));
        setCommonGroupLoading(false);
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

  //change group icon
  const handleFileChange = (e: { target: any }) => {
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      dispatch(setError('Image is not supported'));
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
          dispatch(setSelectedChat(response.data));
          setNameEdit(false);
          setGroupIconLoading(false);
        })
        .catch((error) => {
          setGroupIconLoading(false);
          setCommonGroupLoading(false);
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
    reader.readAsDataURL(file);
  };

  // change group name
  const handleChangeGroupName = () => {
    if (
      selectedChat?.chatName === changeGroupName?.trim() ||
      changeGroupName?.trim() === ''
    ) {
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
          dispatch(setSelectedChat(response.data));
          setNameEdit(false);
          setGroupNameLoading(false);
        })
        .catch((error) => {
          setGroupNameLoading(false);
          setCommonGroupLoading(false);
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
    }
  };

  //display chats
  const displayChats = () => {
    setCommonGroupLoading(true);
    if (user && selectedChat) {
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      axios
        .get(`${BACKEND_API}/api/chat`, config)
        .then((response) => {
          const groupChats = response.data.filter(
            (chat: Chat) => chat.isGroupChat,
          );
          setCommonGroupLoading(false);
          const groupChatsWithUser = groupChats.filter((chat: Chat) =>
            chat.users.some(
              (y) => y._id === getSender(user, selectedChat?.users)._id,
            ),
          );
          setCommonGroup(groupChatsWithUser);
        })
        .catch((error) => {
          setCommonGroupLoading(false);
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
    }
  };

  useEffect(() => {
    displayChats();
  }, [info === true]);

  return (
    user &&
    selectedChat && (
      <div className="h-full  w-full flex-1 flex flex-col border-l border-l-gray-400  bg-gray-100">
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
        <div className="flex flex-col h-full m-0 p-0 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar">
          <section className="flex items-center justify-center h-fit w-full px-[20px]  mb-[7px] bg-gray-300">
            {selectedChat?.isGroupChat ? (
              <div className="h-fit w-fit flex flex-col justify-center items-center my-3">
                <div
                  className="h-full w-full inline-block rounded-full "
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
                      className="hidden h-full w-full rounded-full"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={groupIconLoading}
                    />

                    <div className="flex justify-center items-center h-full w-full rounded-full border border-gray-500  bg-gray-400 cursor-pointer">
                      {selectedChat?.pic ? (
                        <img
                          src={selectedChat?.pic}
                          alt="group icon"
                          className="rounded-full h-full w-full"
                        />
                      ) : (
                        <FaUserFriends color="white" size={100} />
                      )}
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
              <div className="flex flex-col justify-center items-center my-3">
                <div className="flex justify-center items-center h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 ">
                  {getSender(user, selectedChat.users)?.pic ? (
                    <img
                      src={getSender(user, selectedChat.users).pic}
                      alt="sender icon"
                      className=" h-full w-full rounded-full"
                      height={180}
                      width={180}
                      loading="lazy"
                    />
                  ) : (
                    <FaUser size={100} color="white" />
                  )}
                </div>
                <p className="text-lg font-bold mt-[10px] capitalize">
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
                      <div className="w-[30px] h-[30px] flex justify-center items-center rounded-full bg-gray-400">
                        {participant.pic ? (
                          <img
                            src={participant.pic}
                            alt="Profile"
                            className="w-full h-full rounded-full"
                            height={30}
                            width={30}
                            loading="lazy"
                          />
                        ) : (
                          <FaUser size={20} color="white" />
                        )}
                      </div>
                      <div className="w-full min-w-[50px] flex flex-col  items-start mx-2">
                        {participant._id === user?._id ? (
                          <p className="w-full  text-left ">You</p>
                        ) : (
                          <p className="w-full  line-clamp-1 text-left capitalize">
                            {participant.username}
                          </p>
                        )}
                        <p className="w-full  text-sm text-left truncate pr-2">
                          <span className="font-semibold">Email: </span>
                          <span className=" ml-[2px]  ">
                            {participant.email}
                          </span>
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
                        onClick={() => removeUserButton(participant)}
                        disabled={memberLoading[participant._id]}
                        className={`${
                          participant._id === selectedChat.groupAdmin._id
                            ? 'hidden'
                            : 'flex'
                        }  justify-center items-center h-5 w-5  ml-3`}
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
          {!selectedChat.isGroupChat && (
            <section className="mb-[7px]  py-[10px] px-[10px] bg-gray-300 h-fit w-full">
              <h3 className="font-bold text-gray-500">
                {commonGroup.length} Groups in Common
              </h3>
              {commonGroupLoading ? (
                <ClipLoading size={25} />
              ) : (
                <div className="w-full h-full border-y border-gray-400">
                  {commonGroup.map((chat: Chat) => (
                    <div key={chat._id}>
                      <div className="w-full flex items-center ">
                        <div className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-gray-400">
                          {chat.pic ? (
                            <img
                              src={chat?.pic}
                              alt="group profile image"
                              className="w-full h-full rounded-full "
                              height={30}
                              width={30}
                              loading="lazy"
                            />
                          ) : (
                            <FaUserFriends color="white" size={20} />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col items-start w-full ml-[10px] border-b border-gray-400">
                          <p className="w-[95%] truncate text-left font-semibold capitalize">
                            {chat.chatName}
                          </p>
                          <div className="w-full flex justify-between items-center">
                            <div className="w-full flex">
                              <span
                                className=" line-clamp-1 text-sm text-gray-600 capitalize"
                                title={chat.users
                                  .map((participant) =>
                                    user?._id === participant._id
                                      ? 'You'
                                      : participant.username,
                                  )
                                  .join(', ')}
                              >
                                {chat.users
                                  .map((participant) =>
                                    user?._id === participant._id
                                      ? 'You'
                                      : participant.username,
                                  )
                                  .join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="bg-gray-300 h-full w-full">
            <div className="flex justify-between items-center text-red-500">
              {selectedChat?.isGroupChat ? (
                <div className="w-full">
                  {user && selectedChat?.groupAdmin._id !== user?._id && (
                    <button
                      onClick={() => exitGroupChat(user)}
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
                    <p className="px-[20px]">Delete group</p>
                  )}
                </div>
              ) : (
                <p className="px-[20px]">Block user</p>
              )}
            </div>
          </section>
        </div>
        {addUser && <AddParticipant setAddUser={setAddUser} />}
        {isModalOpen && (
          <CustomModal
            onRequestClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              handleRemoveUser(participantId), setIsModalOpen(false);
            }}
            modalMessage={modalMessage}
          />
        )}
      </div>
    )
  );
}

export default ChatInfo;
