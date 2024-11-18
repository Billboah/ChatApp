import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/reducers';
import { FaExclamationCircle, FaRegClock, FaUser } from 'react-icons/fa';
import DoneIcon from '@mui/icons-material/Done';
import { format, isToday, isYesterday, isSameYear, isSameWeek } from 'date-fns';
import { Message } from '../../../types';

type Props = {
  groupedMessages: Record<string, Record<string, Message[]>>;
};

const DisplayMessages: React.FC<Props> = ({ groupedMessages }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { messageError } = useSelector((state: RootState) => state.chat);

  //time format
  const timeFormat = (message: any) => {
    const mongoDBUpdatedAt = message?.updatedAt;
    const updatedAtDate = new Date(mongoDBUpdatedAt);
    return format(updatedAtDate, 'HH:mm');
  };

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
    <div className={`flex flex-col w-full h-fit `}>
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
                    className="w-full  flex justify-end items-center py-[5px] px-5"
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

                          <p
                            dangerouslySetInnerHTML={{
                              __html: message.content,
                            }}
                          />
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
                      messageError[message._id] && (
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
