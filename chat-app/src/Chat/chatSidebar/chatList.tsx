import React, { Dispatch, SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedChat } from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';
import { setSmallScreen } from '../../state/reducers/screen';
import { Chat, Message } from '../../types';
import { format, isToday, isYesterday, isSameWeek, isSameYear } from 'date-fns';
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

  const formattedDateAndTime = (date: any) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else if (isSameWeek(messageDate, today)) {
      return format(messageDate, 'd/MM/yyyy');
    } else if (isSameYear(messageDate, today)) {
      return format(messageDate, ' d/MM/yyyy');
    } else {
      return format(messageDate, ' d/MM/yyyy');
    }
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
      <div className="w-full h-full flex justify-between items-center  p-[10px]">
        {chat.isGroupChat ? (
          <div className="w-full flex items-center ">
            <div className="flex justify-center items-center w-[40px] h-[40px] rounded-full bg-gray-400">
              {chat.pic ? (
                <img
                  src={chat?.pic}
                  alt="group profile image"
                  className="w-[40px] h-[40px] rounded-full "
                />
              ) : (
                <FaUserFriends color="white" size={25} />
              )}
            </div>
            <div className="flex flex-col items-start w-full ml-[10px]">
              <p
                className="line-clamp-1 font-bold text-md text-left capitalize "
                title={chat.chatName}
              >
                {chat.chatName}
              </p>
              <div className="w-full flex justify-between items-center">
                {chat?.latestMessage && (
                  <p className="text-xs text-left w-full line-clamp-2">
                    <span className="font-semibold capitalize">
                      {chat.latestMessage.sender._id === user?._id
                        ? 'You'
                        : chat.latestMessage.sender.username}
                      :{' '}
                    </span>
                    <span
                      className=" ml-[2px] "
                      dangerouslySetInnerHTML={{
                        __html: chat.latestMessage.content,
                      }}
                    />
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center ">
            {user && (
              <div className="flex justify-center items-center w-[40px] h-[40px] rounded-full bg-gray-400">
                {getSender(user, chat?.users).pic ? (
                  <img
                    src={getSender(user, chat?.users).pic}
                    alt="sender profile  image"
                    className="w-[40px] h-[40px] rounded-full "
                  />
                ) : (
                  <FaUser size={25} color="white" />
                )}
              </div>
            )}
            <div className="flex flex-col items-start w-full pl-[10px]">
              <p className=" line-clamp-1 font-bold text-md text-left capitalize">
                {user && getSender(user, chat?.users).username}
              </p>

              <div className="w-full flex justify-between">
                {chat?.latestMessage && (
                  <p
                    className=" text-xs text-left w-full line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: chat.latestMessage.content,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        <div className="h-full w-fit flex flex-col items-end justify-between pb-2">
          {chat.latestMessage && (
            <p
              className={`text-xs ${
                getUnreadMessages(chat, user)?.length > 0
                  ? 'text-blue-500'
                  : 'text-gray-500'
              } `}
            >
              {formattedDateAndTime(chat.latestMessage?.updatedAt)}
            </p>
          )}
          {getUnreadMessages(chat, user)?.length > 0 && (
            <div className="bg-blue-500 rounded-full px-1 font-[10px] text-white text-[10px] ">
              {getUnreadMessages(chat, user)?.length}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatList;
