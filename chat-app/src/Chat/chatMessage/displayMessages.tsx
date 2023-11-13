import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { FaExclamationCircle, FaRegClock, FaUser } from 'react-icons/fa';
import DoneIcon from '@mui/icons-material/Done';
import { format, isToday, isYesterday, isSameYear, isSameWeek } from 'date-fns';
import { Message } from '../../types';

type Props = {
  messageLoadingError: { [key: string]: boolean };
  messages: Message[];
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

  // Grouping messages by date and sender
  const groupedByDate: Record<string, Message[]> = {};
  const groupedMessages: Record<string, Record<string, Message[]>> = {};

  messages.forEach((message) => {
    const date = message.updatedAt.split('T')[0];
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(message);
  });

  for (const date in groupedByDate) {
    const messagesForDate = groupedByDate[date];
    const continuousSenderGroups: Message[][] = [];

    let currentSenderGroup: Message[] = [];
    let prevSender = '';

    messagesForDate.forEach((message) => {
      if (message.sender._id !== prevSender) {
        if (currentSenderGroup.length > 0) {
          continuousSenderGroups.push(currentSenderGroup);
        }
        currentSenderGroup = [];
      }
      currentSenderGroup.push(message);
      prevSender = message.sender._id;
    });

    if (currentSenderGroup.length > 0) {
      continuousSenderGroups.push(currentSenderGroup);
    }

    if (!groupedMessages[date]) {
      groupedMessages[date] = {};
    }

    continuousSenderGroups.forEach((senderGroup, groupIndex) => {
      const sender = senderGroup[0].sender._id;
      groupedMessages[date][`${sender}_${groupIndex + 1}`] = senderGroup;
    });
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
      return format(messageDate, 'EEEE');
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
                    className="w-full  flex justify-end items-center py-[2px] px-5"
                  >
                    <div
                      className={`flex-1 flex ${
                        message.sender._id === user?._id
                          ? 'flex-row-reverse'
                          : 'flex-row'
                      } items-end `}
                    >
                      {selectedChat?.isGroupChat &&
                        message.sender._id !== user?._id && (
                          <div
                            className={` p-0  ${
                              index === messagesArray.length - 1
                                ? 'visible'
                                : 'invisible'
                            } `}
                          >
                            <div className="flex justify-center items-center h-[20px] w-[20px] rounded-full bg-gray-400 mr-1 border-inherit shadow-md">
                              {message.sender.pic ? (
                                <img
                                  src={message.sender.pic}
                                  alt="sender pic"
                                  className="h-[20px] w-[20px] rounded-full "
                                />
                              ) : (
                                <FaUser size={15} color="white" />
                              )}
                            </div>
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
                          className={`w-fit h-fit max-w-[90%] border-inherit shadow-md ${
                            message.sender._id === user?._id
                              ? 'bg-blue-200 before:right-[-12px] background-gradient-right'
                              : 'bg-white before:left-[-12px] background-gradient-left'
                          } ${
                            index === messagesArray.length - 1 &&
                            "before:content-[' '] before:w-6 before:h-6 before:absolute before:bottom-[1px] before:rounded-full "
                          } rounded-lg px-2 py-1 `}
                        >
                          {selectedChat?.isGroupChat &&
                            message.sender._id !== user?._id &&
                            index === 0 && (
                              <p
                                className={`font-bold w-full text-red-400 text-xs truncate  capitalize`}
                              >
                                {message.sender.username}
                              </p>
                            )}
                          <p>{message.content}</p>
                          <div className="w-full flex justify-end items-center mt-[-3px] mr-[5px]">
                            <p className="text-[10px] text-gray-500 mr-1">
                              {timeFormat(message)}
                            </p>
                            {message.sender._id === user?._id &&
                              (message.delivered === true ? (
                                <DoneIcon
                                  color="disabled"
                                  sx={{ fontSize: 11 }}
                                  className="z-20"
                                />
                              ) : (
                                <FaRegClock
                                  color="gray"
                                  size={9}
                                  className="z-20"
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {message.sender._id === user?._id &&
                      messageLoadingError[message._id] && (
                        <FaExclamationCircle
                          color="red"
                          size={15}
                          className="pl-1"
                        />
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
