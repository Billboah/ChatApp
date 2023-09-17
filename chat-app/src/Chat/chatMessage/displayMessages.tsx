import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { FaExclamationCircle, FaRegClock } from 'react-icons/fa';
import DoneIcon from '@mui/icons-material/Done';
import { format, isToday, isYesterday } from 'date-fns';
import { Message } from '../../types';

type Props = {
  messageLoadingError: { [key: string]: boolean };
  messages: {
    map(
      arg0: (message: Message) => import('react/jsx-runtime').JSX.Element,
    ): React.ReactNode;
  };
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const DisplayMessages: React.FC<Props> = ({
  messageLoadingError,
  messages,
  contentRef,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);

  //time format
  const timeFormat = (message: any) => {
    const mongoDBUpdatedAt = message?.updatedAt;
    const updatedAtDate = new Date(mongoDBUpdatedAt);
    return format(updatedAtDate, 'HH:mm');
  };

  return (
    <div className={`flex flex-col w-full h-fit `} ref={contentRef}>
      {messages.map((message) => (
        <div
          key={message._id}
          className={` flex ${
            message.sender._id === user?._id ? 'flex-row-reverse' : 'flex-row'
          } items-end my-2 mx-3`}
        >
          {selectedChat?.isGroupChat && message.sender._id !== user?._id && (
            <div className="m-0 p-0">
              <img
                src={message.sender.pic}
                alt="sender pic"
                className="h-[20px] w-[20px] rounded-full bg-gray-500"
              />
            </div>
          )}
          <div className="flex justify-end items-center">
            <div
              className={`w-fit max-w-[88%] ${
                message.sender._id === user?._id
                  ? 'bg-blue-200 mr-1'
                  : 'bg-white ml-1'
              } rounded px-3 `}
            >
              {selectedChat?.isGroupChat &&
                message.sender._id !== user?._id && (
                  <p
                    className={`font-bold w-full text-red-400 text-xs truncate `}
                  >
                    {message.sender.username}
                  </p>
                )}
              <p>{message.content}</p>
              <div className="w-full flex justify-end items-center ">
                <p className="text-xs text-gray-500 mr-1">
                  {timeFormat(message)}
                </p>
                {message.sender._id === user?._id &&
                  (message.delivered === true ? (
                    <DoneIcon color="disabled" sx={{ fontSize: 15 }} />
                  ) : (
                    <FaRegClock color="gray" size={12} />
                  ))}
              </div>
            </div>
            {message.sender._id === user?._id &&
              messageLoadingError[message._id] && (
                <FaExclamationCircle color="red" title="Error" />
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayMessages;
