import React, { Dispatch, SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedChat } from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';
import { setSmallScreen } from '../../state/reducers/screen';
import { Chat, Message } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';
import { getSender, getUnreadMessages } from '../../config/chatLogics';
import { FaUser, FaUserFriends } from 'react-icons/fa';

type ChatProps = {
  chat: Chat;
  setSearch: Dispatch<SetStateAction<string>>;
};

const ChatList: React.FC<ChatProps> = ({ chat, setSearch }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();

  const handleSelect = (chat: Chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(setSmallScreen(false));
  };

  const timeFormat = (message: Message) => {
    const mongoDBUpdatedAt = message?.updatedAt;
    const updatedAtDate = new Date(mongoDBUpdatedAt);
    return format(updatedAtDate, 'HH:mm');
  };

  return (
    <button
      className={` ${
        selectedChat?._id === chat._id ? 'bg-gray-200' : 'bg-inherit'
      }  w-full h-[70px] hover:bg-gray-200 active:bg-gray-300`}
      key={chat._id}
      onClick={() => {
        handleSelect(chat), setSearch('');
      }}
    >
      <div className="w-full h-full flex justify-between items-center px-[20px] py-[10px]">
        {chat.isGroupChat ? (
          <div className="w-[90%] flex items-center ">
            <div className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-gray-400">
              {chat.pic ? (
                <img
                  src={chat?.pic}
                  alt="group profile image"
                  className="w-full h-full rounded-full "
                />
              ) : (
                <FaUserFriends color="white" size={20} />
              )}
            </div>
            <div className="flex flex-col items-start w-full ml-[10px]">
              <p className="truncate text-left" title={chat.chatName}>
                {chat.chatName}
              </p>
              <div className="w-full pr-5 flex justify-between items-center">
                {chat?.latestMessage && (
                  <p className="truncate text-xs text-left w-full">
                    <span className="font-semibold">
                      {chat.latestMessage.sender._id === user?._id
                        ? 'You'
                        : chat.latestMessage.sender.username}
                      :{' '}
                    </span>
                    <span className=" ml-[2px] ">
                      {chat.latestMessage.content}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[90%] flex items-center ">
            {user && (
              <div className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-gray-400">
                {getSender(user, chat?.users).pic ? (
                  <img
                    src={getSender(user, chat?.users).pic}
                    alt="sender profile  image"
                    className="w-full h-full rounded-full "
                  />
                ) : (
                  <FaUser size={20} color="white" />
                )}
              </div>
            )}
            <div className="flex flex-col items-start w-full pl-[10px]">
              <p className="truncate text-left">
                {user && getSender(user, chat?.users).username}
              </p>

              <div className="w-full pr-5 flex justify-between">
                {chat?.latestMessage && (
                  <p className=" text-xs text-left w-full truncate">
                    {chat.latestMessage.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="h-full w-fit flex flex-col items-center justify-between pb-2">
          {chat.latestMessage && (
            <p
              className={`text-xs ${
                getUnreadMessages(chat, user)?.length > 0
                  ? 'text-blue-500'
                  : 'text-gray-500'
              } `}
            >
              {timeFormat(chat.latestMessage)}
            </p>
          )}
          {getUnreadMessages(chat, user)?.length > 0 && (
            <div className="bg-blue-500 rounded-full px-1 text-white text-xs ">
              {getUnreadMessages(chat, user)?.length}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatList;
