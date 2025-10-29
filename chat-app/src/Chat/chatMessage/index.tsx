import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMessagesLoading,
  updateMessageChats,
  setNewMessage,
} from '../../state/reducers/chat';
import ChatInfo from './chatInfo';
import Messages from './messages';
import Input from './input';
import { RootState } from '../../state/reducers';
import { ClipLoading } from '../../config/ChatLoading';
import { apiGet } from '../../utils/api';
import Header from './header';
import { Message } from '../../types';
import socket from '../../socket/socket';

const chatMessages: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { socketConnection } = useSelector((state: RootState) => state.chat);
  const { info } = useSelector((state: RootState) => state.screen);
  const { messageChats } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { messagesLoading } = useSelector((state: RootState) => state.chat);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const [scrollButton, setScrollButton] = useState(false);
  const hasMoreMessages = messageChats.find(
    (chat: any) => chat._id === selectedChat?._id,
  )?.hasMoreMessages;

  const messageChat = messageChats.find(
    (chat: any) => chat._id === selectedChat?._id,
  );

  // Fetch messages api
  const fetchMessages = async (lastId: string) => {
    const chatId = selectedChat?._id;

    dispatch(setMessagesLoading(true));
    const config = {
      params: { lastMessageId: lastId },
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    if (chatId && !messagesLoading && hasMoreMessages) {
      const result = await apiGet(
        `/api/message/${chatId}`,
        config,
        (loading: boolean) => dispatch(setMessagesLoading(loading)),
        dispatch,
      );

      const typedResult = result as { regularMessages: any[] };
      if (typedResult.regularMessages.length > 0) {
        console.log(typedResult.regularMessages);
        dispatch(
          updateMessageChats({
            chatId: chatId,
            regularMessages: typedResult.regularMessages,
            unreadMessages: [],
          }),
        );
      } else {
        console.log('Fetched messages failed');
      }
    }
  };

  // Handle scroll down to check if we need to show the scroll button
  const handleScrollDown = () => {
    if (scrollContainerRef.current && contentRef.current) {
      const isAtBottom =
        scrollContainerRef.current.scrollTop +
          scrollContainerRef.current.clientHeight ===
        contentRef.current.scrollHeight;

      if (!isAtBottom) {
        setScrollButton(true);
      } else {
        setScrollButton(false);
      }
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScrollDown);
    }

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener(
          'scroll',
          handleScrollDown,
        );
      }
    };
  }, [selectedChat]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current && contentRef.current) {
      scrollContainerRef.current.scrollTop =
        contentRef.current.scrollHeight -
        scrollContainerRef.current.clientHeight;
      setScrollButton(false);
    }
  };

  // Attach a scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        scrollContainerRef.current &&
        scrollContainerRef.current.scrollTop === 0
      ) {
        previousScrollHeightRef.current =
          scrollContainerRef.current.scrollHeight;
        if (hasMoreMessages) {
          fetchMessages(messageChat?.lastMessageId);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messagesLoading, hasMoreMessages]);

  useEffect(() => {
    if (scrollContainerRef.current && previousScrollHeightRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop =
        newScrollHeight - previousScrollHeightRef.current;
    }
  }, [messageChat?.regularMessages]);

  //receive message from socket.io
  useEffect(() => {
    const handleMessageReceived = (message: Message) => {
      dispatch(setNewMessage({ tempId: message._id, message }));
    };

    const handleMessageSent = (message: Message) => {
      // optional — if you also emit "message sent" back to sender on server
      dispatch(setNewMessage({ tempId: message._id, message }));
    };

    if (socketConnection) {
      socket.on('received message', handleMessageReceived);
      socket.on('message sent', handleMessageSent);
    }

    return () => {
      socket.off('received message', handleMessageReceived);
      socket.off('message sent', handleMessageSent);
    };
  }, [socketConnection, dispatch]);

  return (
    <div className="flex w-full h-full">
      <div
        className={`${
          info ? 'hidden xl:flex flex-1 ' : ''
        } flex flex-col  w-full h-full bg-[url(https://images.rawpixel.com/image_800/cHJpdmF0ZS9zdGF0aWMvZmlsZXMvd2Vic2l0ZS8yMDIyLTA2L2pvYjk3OS1iYWNrZ3JvdW5kLTA5LmpwZw.jpg)]  bg-no-repeat bg-cover `}
      >
        <Header />
        {selectedChat && (
          <div
            className="h-full w-full flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar"
            ref={scrollContainerRef}
          >
            {scrollButton && (
              <button
                onClick={scrollToBottom}
                className="rounded-full fixed bottom-[65px] right-[15px] p-2 bg-black opacity-50 z-30 border border-inherit shadow-md"
                title="Move to the latest message"
                aria-label="view latest message"
                name="scrollToButton"
              >
                <FaAngleDown color="white" />
              </button>
            )}
            {messagesLoading && (
              <div className="w-full h-fit flex justify-center items-start py-1">
                <ClipLoading size={25} />
                <p className="ml-2">Loading Messages...</p>
              </div>
            )}
            <Messages
              contentRef={contentRef}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        )}
        {selectedChat && <Input />}
        {!selectedChat && (
          <p className="bg-black bg-opacity-10 w-fit px-[10px] rounded-2xl absolute top-[50%] left-[50%]">
            Select a chat to start messaging
          </p>
        )}
      </div>
      {info && <ChatInfo />}
    </div>
  );
};

export default chatMessages;
