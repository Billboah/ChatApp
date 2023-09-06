import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedChat } from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';
import { setSmallScreen } from '../../state/reducers/screen';

interface Users {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
}

interface ChatInfo {
  groupAdmin: Users;
  _id: string;
  pic: string;
  latestMessage: any;
  unreadMessages: any[];
  chatName: string;
  isGroupChat: boolean;
  createdAt: string;
  users: Users[];
}

const ChatList2 = () => {
  const { chats } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();

  const handleSelect = (chat: ChatInfo) => {
    dispatch(setSelectedChat(chat)), dispatch(setSmallScreen(false));
  };

  console.log(chats);

  return (
    <div className="h-full w-full">
      {chats.map((chat: ChatInfo) => (
        <button
          className={` ${
            selectedChat?._id === chat._id ? 'bg-gray-200' : 'bg-inherit'
          }  w-full h-[70px] px-[20px] py-[10px] hover:bg-gray-200 active:bg-gray-300`}
          key={chat._id}
          onClick={() => handleSelect(chat)}
        >
          {chat.isGroupChat ? (
            <div className="w-full flex items-center ">
              <img
                src={chat?.pic}
                alt="Profile"
                className="w-[30px] h-[30px] rounded-full bg-gray-400"
              />
              <div className="flex flex-col items-start w-full ml-[10px]">
                <p className="truncate text-left" title={chat.chatName}>
                  {chat.chatName}
                </p>
                <div className="w-full flex justify-between items-center">
                  {chat?.latestMessage && (
                    <p className="truncate text-xs text-left w-full">
                      <span className="font-semibold">
                        {chat.latestMessage.sender.username}:{' '}
                      </span>
                      <span className=" ml-[2px] ">
                        {chat.latestMessage.content}
                      </span>
                    </p>
                  )}
                  {chat?.unreadMessages.length >= 1 && (
                    <div className="bg-blue-500 rounded-full px-[6px] text-white text-sm">
                      {chat.unreadMessages.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center ">
              <img
                src={
                  chat?.users[0]._id === user?.id
                    ? chat?.users[1].pic
                    : chat?.users[0].pic
                }
                alt="Profile"
                className="w-[30px] h-[30px] rounded-full bg-gray-400"
              />
              <div className="flex flex-col items-start w-full max-w-full ml-[10px]">
                <p className="truncate text-left">
                  {chat?.users[0]._id === user?.id
                    ? chat?.users[1].username
                    : chat?.users[0].username}
                </p>
                <div className=" w-full flex justify-between">
                  {chat?.latestMessage && (
                    <p className=" text-xs text-left w-full truncate">
                      {chat.latestMessage.content}
                    </p>
                  )}
                  {chat?.unreadMessages.length >= 1 && (
                    <div className="bg-blue-500 rounded-full px-[6px] text-white text-sm">
                      {chat.unreadMessages.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ChatList2;
