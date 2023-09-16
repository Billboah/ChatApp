import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';

type Props = {
  loading: boolean;
  messages: {
    map(
      arg0: (message: {
        _id: string;
        sender: Users;
        content: string;
        chat: ChatInfo;
      }) => import('react/jsx-runtime').JSX.Element,
    ): React.ReactNode;
  };
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

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
  chatName: string;
  isGroupChat: boolean;
  createdAt: string;
  users: Users[];
}

const DisplayMessages: React.FC<Props> = ({
  loading,
  messages,
  contentRef,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);

  return (
    <div className={`flex flex-col w-full h-fit `} ref={contentRef}>
      {messages.map((message) => (
        <div
          key={message._id}
          className={` flex ${
            message.sender._id === user?.id ? 'flex-row-reverse' : 'flex-row'
          } items-end my-2 mx-3`}
        >
          {selectedChat?.isGroupChat && message.sender._id !== user?.id && (
            <div>
              <img
                src={message.sender.pic}
                alt="sender pic"
                className="h-[20px] w-[20px] rounded-full"
              />
            </div>
          )}
          <div
            className={`w-fit max-w-[75%] ${
              message.sender._id === user?.id ? 'bg-blue-200' : 'bg-white'
            } rounded ml-1 px-2`}
          >
            {selectedChat?.isGroupChat && message.sender._id !== user?.id && (
              <p className={`font-bold w-full text-red-400 text-xs truncate `}>
                {message.sender.username}
              </p>
            )}
            <p>{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayMessages;
