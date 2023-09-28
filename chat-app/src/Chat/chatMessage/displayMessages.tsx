import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { FaExclamationCircle, FaRegClock } from 'react-icons/fa';
import DoneIcon from '@mui/icons-material/Done';
import { format, isToday, isYesterday, isSameYear, isSameWeek } from 'date-fns';
import { Message, ModifyMessage } from '../../types';

type Props = {
  messageLoadingError: { [key: string]: boolean };
  messages: Message[];
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

interface SenderGroup {
  [senderId: string]: Message[];
}

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

  // Grouping messages by date and sender
  const groupedByDate: Record<string, Message[]> = {};

  messages.forEach((message) => {
    const date = message.updatedAt.split('T')[0];
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(message);
  });

  const groupedMessages: Record<string, Record<string, Message[]>> = {};

  for (const date in groupedByDate) {
    const messagesForDate = groupedByDate[date];
    let senderGroups: Record<string, Message[]> = {};

    let currentSender: any = null;

    messagesForDate.forEach((message) => {
      const senderId = message.sender._id;

      if (currentSender === null || currentSender === senderId) {
        if (!senderGroups) {
          senderGroups = {};
        }
        if (!senderGroups[senderId]) {
          senderGroups[senderId] = [];
        }
        senderGroups[senderId].push(message);
      } else {
        if (senderGroups) {
          if (!groupedMessages[date]) {
            groupedMessages[date] = {};
          }
          groupedMessages[date] = { ...groupedMessages[date], ...senderGroups };
          senderGroups = {};
        }
      }
      currentSender = senderId;
    });

    if (senderGroups) {
      if (!groupedMessages[date]) {
        groupedMessages[date] = {};
      }
      groupedMessages[date] = { ...groupedMessages[date], ...senderGroups };
    }
  }

  //format date
  const formattedDate = (date: any) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return 'Today';
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else if (isSameWeek(messageDate, today)) {
      return format(messageDate, 'EEE');
    } else if (isSameYear(messageDate, today)) {
      return format(messageDate, 'EEE, d MMM');
    } else {
      return format(messageDate, 'EEE, d MMM, yyyy');
    }
  };

  return (
    <div className={`flex flex-col w-full h-full `} ref={contentRef}>
      {Object.entries(groupedMessages).map(([date]) => (
        <div key={date} className="">
          <div className="w-full flex items-center justify-center text-sm  text-gray-500">
            <div className="w-fit bg-white bg-opacity-60 rounded-xl px-2 ">
              {formattedDate(date)}
            </div>
          </div>
          {Object.keys(groupedMessages[date]).map((sender) => (
            <div key={sender}>
              {groupedMessages[date][sender].map(
                (message: any, index: any, messagesArray: any) => (
                  <div
                    key={message._id}
                    className={` flex ${
                      message.sender._id === user?._id
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    } items-end py-[2px] px-5`}
                  >
                    {selectedChat?.isGroupChat &&
                      message.sender._id !== user?._id && (
                        <div
                          className={`mb-1 p-0 ${
                            index === messagesArray.length - 1
                              ? 'visible'
                              : 'invisible'
                          } `}
                        >
                          <img
                            src={message.sender.pic}
                            alt="sender pic"
                            className="h-[20px] w-[20px] rounded-full bg-gray-400 mr-2"
                          />
                        </div>
                      )}
                    <div
                      className={`flex items-center w-full p-0 m-0 relative  ${
                        message.sender._id === user?._id
                          ? 'justify-end '
                          : 'justify-start '
                      } `}
                    >
                      <div
                        className={`w-fit h-fit max-w-[90%] ${
                          message.sender._id === user?._id
                            ? 'bg-blue-200 before:right-[-15px] background-gradient-right'
                            : 'bg-white before:left-[-15px] background-gradient-left'
                        } ${
                          index === messagesArray.length - 1 &&
                          "before:content-[' '] before:w-6 before:h-6 before:absolute before:bottom-0 before:rounded-full "
                        } rounded-lg px-2 py-1 `}
                      >
                        {selectedChat?.isGroupChat &&
                          message.sender._id !== user?._id &&
                          index === 0 && (
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
                              <DoneIcon
                                color="disabled"
                                sx={{ fontSize: 13 }}
                              />
                            ) : (
                              <FaRegClock color="gray" size={11} />
                            ))}
                        </div>
                      </div>
                    </div>
                    {message.sender._id === user?._id &&
                      messageLoadingError[message._id] && (
                        <FaExclamationCircle color="red" title="Error" />
                      )}
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DisplayMessages;
