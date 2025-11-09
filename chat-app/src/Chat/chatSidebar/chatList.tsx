import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMessagesLoading,
  setSelectedChat,
  unsetUnreadMessages,
  updateMessageChats,
} from '../../state/reducers/chat';
import DoneIcon from '@mui/icons-material/Done';
import { RootState } from '../../state/reducers';
import { Chat } from '../../types';
import { format, isToday, isYesterday, isSameWeek, isSameYear } from 'date-fns';
import { BACKEND_API, getSender } from '../../config/chatLogics';
import { FaRegClock, FaUser, FaUserFriends } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { setSmallScreen } from '../../state/reducers/screen';
import { apiGet } from '../../utils/api';
import socket from '../../socket/socket';

type ChatProps = {
  chat: Chat;
  setSearch: Dispatch<SetStateAction<string>>;
};

const ChatList: React.FC<ChatProps> = ({ chat, setSearch }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { messageChats } = useSelector((state: RootState) => state.chat);
  const { chats } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();
  const location = useLocation();
  const sender = user && getSender(user, chat?.users);
  const latestSender = chat.latestMessage && chat.latestMessage.sender;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        dispatch(setSelectedChat(null));
      } else {
        dispatch(setSelectedChat(chat));
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    if (mediaQuery.matches) {
      dispatch(setSelectedChat(null));
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [location.pathname]);

  // api for unread messages
  const fetchUnreadMessages = async (chatId: string) => {
    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
    const data = await apiGet<any>(
      `${BACKEND_API}/api/message/unreadmessage/${chatId}`,
      config,
      undefined, // no loading state here
      dispatch,
    );

    if (data) {
      dispatch(
        updateMessageChats({
          chatId,
          unreadMessages: data,
          regularMessages: [],
        }),
      );
    }
  };

  //api for messages of a chat
  const fetchMessages = async (chatId: string) => {
    dispatch(setMessagesLoading(true));
    const config = {
      params: { lastMessageId: null },
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
    const data = await apiGet<any>(
      `${BACKEND_API}/api/message/${chatId}`,
      config,
      (loading) => dispatch(setMessagesLoading(loading)),
      dispatch,
    );

    if (data) {
      dispatch(
        updateMessageChats({
          chatId,
          regularMessages: data.regularMessages,
          unreadMessages: data.unreadMessages,
        }),
      );
    }
  };

  //click on a chat
  const handleSelect = (chat: Chat) => {
    dispatch(setSelectedChat(chat));
    socket.emit('join chat', chat._id); //joined chat room

    dispatch(setSmallScreen(false));

    const existingChat = messageChats.find((cht) => cht._id === chat._id);

    const chatToUpdate = chats.find((cht: Chat) => cht._id === chat._id);

    if (existingChat) {
      if (chatToUpdate) {
        if (chatToUpdate.unreadMessages.length > 0) {
          //add unread message to the existingChat.messages
          fetchUnreadMessages(chat._id);
        } else {
          selectedChat && dispatch(unsetUnreadMessages(selectedChat._id));
        }
      }
    } else {
      return fetchMessages(chat._id);
    }
  };

  const formattedDateAndTime = (date: string | number | Date | undefined) => {
    if (date) {
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
    }
  };

  return (
    <button
      className={` ${
        selectedChat?._id === chat?._id ? 'bg-gray-200' : 'bg-inherit'
      }  w-full h-[70px] hover:bg-gray-200 active:bg-gray-300`}
      key={chat?._id}
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
                  loading="lazy"
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
                      {latestSender?._id === user?._id
                        ? 'You'
                        : latestSender?.username}
                      :
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
                {sender && sender.pic ? (
                  <img
                    src={sender.pic}
                    alt="sender profile  image"
                    className="w-[40px] h-[40px] rounded-full "
                    loading="lazy"
                  />
                ) : (
                  <FaUser size={25} color="white" />
                )}
              </div>
            )}
            <div className="flex flex-col items-start w-full pl-[10px]">
              <p className=" line-clamp-1 font-bold text-md text-left capitalize">
                {sender && sender.username}
              </p>

              <div className="w-full flex justify-between">
                {chat?.latestMessage && (
                  <p className="flex text-xs text-left w-full line-clamp-2">
                    <span className="font-semibold capitalize mr-1">
                      {latestSender?._id === user?._id &&
                        (chat.latestMessage.delivered === true ? (
                          <DoneIcon
                            color="primary"
                            sx={{ fontSize: 11 }}
                            className="z-20"
                          />
                        ) : (
                          <FaRegClock
                            color="gray"
                            size={9}
                            className="z-20 mt-[3px]"
                          />
                        ))}
                    </span>
                    <span
                      className=" text-xs text-left w-full line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: chat.latestMessage.content,
                      }}
                    />
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="h-full w-fit flex flex-col items-end justify-between pb-2">
          {chat.latestMessage && (
            <p
              className={`text-xs ${
                chat.unreadMessages.length > 0
                  ? 'text-blue-500'
                  : 'text-gray-500'
              } `}
            >
              {formattedDateAndTime(chat.latestMessage?.updatedAt)}
            </p>
          )}
          {chat.unreadMessages.length > 0 && (
            <div className="bg-blue-500 rounded-full px-1 font-[10px] text-white text-[10px] ">
              {chat.unreadMessages.length}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatList;
