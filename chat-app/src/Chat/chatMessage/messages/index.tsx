import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../state/reducers';
import { Message } from '../../../types';
import DisplayMessages from './displayMessages';
import { setAutoScroll } from '../../../state/reducers/chat';

type Props = {
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
};

const Messages: React.FC<Props> = ({ contentRef, scrollContainerRef }) => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { autoScroll } = useSelector((state: RootState) => state.chat);
  const { messageChats } = useSelector((state: RootState) => state.chat);
  const unreadRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const messageChat = messageChats.find(
    (chat: any) => chat._id === selectedChat?._id,
  );

  //regular messagess
  const regularMessages = messageChat ? messageChat.regularMessages : [];

  const groupedRegByDate: Record<string, Message[]> = {};
  const groupedRegMessages: Record<string, Record<string, Message[]>> = {};

  regularMessages.forEach((message: Message) => {
    const date = message.updatedAt.split('T')[0];
    if (!groupedRegByDate[date]) {
      groupedRegByDate[date] = [];
    }
    groupedRegByDate[date].push(message);
  });

  for (const date in groupedRegByDate) {
    const messagesForDate = groupedRegByDate[date];
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

    if (!groupedRegMessages[date]) {
      groupedRegMessages[date] = {};
    }

    continuousSenderGroups.forEach((senderGroup, groupIndex) => {
      const sender = senderGroup[0].sender._id;
      groupedRegMessages[date][`${sender}_${groupIndex + 1}`] = senderGroup;
    });
  }

  //unread messages
  const unreadMessages = messageChat ? messageChat.unreadMessages : [];

  const groupedUnByDate: Record<string, Message[]> = {};
  const groupedUnMessages: Record<string, Record<string, Message[]>> = {};

  unreadMessages.forEach((message: Message) => {
    const date = message.updatedAt.split('T')[0];
    if (!groupedUnByDate[date]) {
      groupedUnByDate[date] = [];
    }
    groupedUnByDate[date].push(message);
  });

  for (const date in groupedUnByDate) {
    const messagesForDate = groupedUnByDate[date];
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

    if (!groupedUnMessages[date]) {
      groupedUnMessages[date] = {};
    }

    continuousSenderGroups.forEach((senderGroup, groupIndex) => {
      const sender = senderGroup[0].sender._id;
      groupedUnMessages[date][`${sender}_${groupIndex + 1}`] = senderGroup;
    });
  }

  //auto scroll
  useEffect(() => {
    const scrollToBottom = () => {
      if (unreadMessages.length > 0) {
        if (scrollContainerRef.current && unreadRef.current) {
          unreadRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (scrollContainerRef.current && contentRef.current) {
          scrollContainerRef.current.scrollTop =
            contentRef.current.scrollHeight -
            scrollContainerRef.current.clientHeight;
        }
      }
    };

    scrollToBottom();
    dispatch(setAutoScroll(false));
  }, [autoScroll]);

  return (
    <div className={` w-full h-full py-5`} ref={contentRef}>
      <DisplayMessages groupedMessages={groupedRegMessages} />
      {unreadMessages.length > 0 && (
        <div ref={unreadRef}>
          <div className="bg-white w-full h-fit p-1 my-2 shadow-md text-center text-gray-500">
            Unread Messages
          </div>
          <DisplayMessages groupedMessages={groupedUnMessages} />
        </div>
      )}
    </div>
  );
};

export default Messages;
