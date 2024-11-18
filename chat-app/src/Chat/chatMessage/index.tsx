import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaAngleDown,
  FaArrowLeft,
  FaUserFriends,
  FaUser,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo, setSmallScreen } from '../../state/reducers/screen';
import {
  setSelectedChat,
  setMessagesLoading,
  updateMessageChats,
  setError,
  setHasMore,
  setNewMessage,
} from '../../state/reducers/chat';
import ChatInfo from './chatInfo';
import Messages from './messages';
import Input from './input';
import { RootState } from '../../state/reducers';
import { ClipLoading } from '../../config/ChatLoading';
import { BACKEND_API, getSender, socket } from '../../config/chatLogics';
import axios from 'axios';
import { User } from '../../types';

const chatMessages: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { info } = useSelector((state: RootState) => state.screen);
  const { messageChats } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { messagesLoading } = useSelector((state: RootState) => state.chat);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typer, setTyper] = useState<User | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const [scrollButton, setScrollButton] = useState(false);
  const [typingTimeoutId, setTypingTimeoutId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const hasMoreMessages = messageChats.find(
    (chat: any) => chat._id === selectedChat?._id,
  )?.hasMoreMessages;

  const messageChat = messageChats.find(
    (chat: any) => chat._id === selectedChat?._id,
  );

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

  //api for messages of a chat
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
      try {
        const response = await axios.get(
          `${BACKEND_API}/api/message/${chatId}`,
          config,
        );
        dispatch(setMessagesLoading(false));
        if (response.data.regularMessages.length > 0) {
          dispatch(
            updateMessageChats({
              chatId: chatId,
              regularMessages: response.data.regularMessages,
              unreadMessages: [],
            }),
          );
        } else {
          dispatch(setHasMore({ hasMore: false, chatId: chatId }));
        }
      } catch (error: any) {
        if (error.response) {
          dispatch(setMessagesLoading(false));
          dispatch(setError(error.response.data.error));
        } else if (error.request) {
          dispatch(setMessagesLoading(false));
          dispatch(setError('Cannot reach the server.'));
        } else {
          dispatch(setMessagesLoading(false));
          dispatch(setError(error.message));
        }
      }
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

  //connect to socket.io
  useEffect(() => {
    if (!user) return;

    socket.emit('user connected', user?._id);

    const handleConnected = () => {
      setSocketConnected(true);
    };

    socket.on('connected', handleConnected);

    return () => {
      socket.off('connected', handleConnected);
    };
  }, [user]);

  useEffect(() => {
    selectedChat && socket.emit('join chat', selectedChat._id);
  }, [selectedChat]);

  useEffect(() => {
    if (!user) return;
    const handleTyping = (sender: any) => {
      setIsTyping(true);
      setTyper(sender);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
      setTyper(null);
    };

    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [socket, user]);

  //receeve message from socket.io
  useEffect(() => {
    const handleMessageReceived = (messageReceived: any) => {
      dispatch(
        setNewMessage({
          tempId: messageReceived._id,
          message: messageReceived,
        }),
      );
    };

    socket.on('received message', handleMessageReceived);

    return () => {
      socket.off('received message', handleMessageReceived);
    };
  }, [socket, user]);

  //socket.io while typing
  const typingLogic = useCallback(() => {
    if (!socketConnected || !user || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      setTyper(user);
      socket.emit('typing', user, selectedChat._id);
    }

    if (typingTimeoutId) {
      clearTimeout(typingTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyper(null);
        socket.emit('stop typing', selectedChat._id);
      }
    }, 7000);

    setTypingTimeoutId(timeoutId);
  }, [socket, socketConnected, user, selectedChat, isTyping, typingTimeoutId]);

  const handleStopTyping = useCallback(() => {
    if (selectedChat) {
      socket.emit('stop typing', selectedChat._id);
    }
  }, [socket, selectedChat]);

  return (
    <div className="flex w-full h-full">
      <div
        className={`${
          info ? 'hidden xl:flex flex-1 ' : ''
        } flex flex-col  w-full h-full bg-[url(https://images.rawpixel.com/image_800/cHJpdmF0ZS9zdGF0aWMvZmlsZXMvd2Vic2l0ZS8yMDIyLTA2L2pvYjk3OS1iYWNrZ3JvdW5kLTA5LmpwZw.jpg)]  bg-no-repeat bg-cover `}
      >
        {selectedChat && (
          <nav className=" bg-gray-200 w-full h-[50px] px-4 border-b-inherit shadow-md">
            <div className="h-full w-full flex justify-start items-center ">
              <button
                title="Back"
                className="md:hidden"
                onClick={() => {
                  dispatch(setSmallScreen(true)),
                    dispatch(setSelectedChat(null));
                }}
              >
                <FaArrowLeft />
                <p className="sr-only">Back</p>
              </button>
              <button
                onClick={() => dispatch(setInfo(true))}
                className="h-full w-full flex justify-start items-center"
              >
                {user && (
                  <div className="rounded-full h-[35px] w-[35px] bg-gray-400">
                    {selectedChat?.isGroupChat ? (
                      <div className="flex justify-center items-center w-full h-full">
                        {selectedChat?.pic ? (
                          <img
                            src={selectedChat?.pic}
                            alt="group icon"
                            title="Profile details"
                            className="h-full w-full rounded-full"
                          />
                        ) : (
                          <FaUserFriends color="white" size={25} />
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-full h-full">
                        {getSender(user, selectedChat?.users).pic ? (
                          <img
                            src={getSender(user, selectedChat?.users).pic}
                            alt="user profile"
                            className="h-full w-full rounded-full "
                          />
                        ) : (
                          <FaUser color="white" size={25} />
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="w-[90%] min-w-[20px] px-3 flex flex-col items-start ">
                  {user && (
                    <p className="text-lg font-extrabold capitalize">
                      {selectedChat?.isGroupChat === false
                        ? getSender(user, selectedChat.users).username
                        : selectedChat?.chatName}
                    </p>
                  )}
                  {selectedChat?.isGroupChat === true &&
                  isTyping &&
                  typer?._id !== user?._id ? (
                    <div>{typer?.username} typing...</div>
                  ) : selectedChat?.isGroupChat === true &&
                    (!isTyping ||
                      (isTyping &&
                        (typer?._id === user?._id || typer === null))) ? (
                    <div className="w-full flex">
                      <span
                        className=" line-clamp-1 text-sm text-gray-500 capitalize"
                        title={selectedChat?.users
                          .map((participant) =>
                            user?._id === participant._id
                              ? 'You'
                              : participant.username,
                          )
                          .join(', ')}
                      >
                        {selectedChat?.users
                          .map((participant) =>
                            user?._id === participant._id
                              ? 'You'
                              : participant.username,
                          )
                          .join(', ')}
                      </span>
                    </div>
                  ) : selectedChat?.isGroupChat === false &&
                    isTyping === true &&
                    typer?._id !== user?._id ? (
                    <div>typing...</div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </button>
            </div>
          </nav>
        )}
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
        {selectedChat && (
          <Input
            typingLogic={typingLogic}
            handleStopTyping={handleStopTyping}
          />
        )}
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
