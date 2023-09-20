import React, { useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaArrowLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo, setSmallScreen } from '../../state/reducers/screen';
import {
  setNewMessage,
  setSelectedChat,
  updateChats,
} from '../../state/reducers/chat';
import ChatInfo from './chatInfo';
import DisplayMessages from './displayMessages';
import Input from './input';
import axios, { AxiosRequestConfig } from 'axios';
import { io } from 'socket.io-client';
import { RootState } from '../../state/reducers';
import { ClipLoading } from '../../config/ChatLoading';
import { BACKEND_API, getSender } from '../../config/chatLogics';
import { Message } from '../../types';

const socket = io(BACKEND_API);

export default function chatMessages() {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { info } = useSelector((state: RootState) => state.screen);
  const { user } = useSelector((state: RootState) => state.auth);
  const [messageLoadingError, setMessageLoadingError] = useState<{
    [key: string]: boolean;
  }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typer, setTyper] = useState('');
  const [scrollButton, setScrollButton] = useState(false);

  //scrolling to the bottom automatically
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
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
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //connect to socket.io
  useEffect(() => {
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));

    socket.on(
      'typing',
      (sender) => (setIsTyping(true), setTyper(sender?.username)),
    );
    socket.on('stop typing', () => (setIsTyping(false), setTyper(' ')));
  }, []);

  //socket.io while typing
  const typingLogic = () => {
    // eslint-disable-next-line prefer-const
    let typingTimeout;

    if (!socketConnected) return;

    if (!isTyping) {
      socket.emit('typing', user, selectedChat?._id);
    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      if (isTyping === false) {
        socket.emit('stop typing', selectedChat?._id);
      }
    }, 3000);
  };

  const handleStopTyping = () => {
    socket.emit('stop typing', selectedChat?._id);
  };

  //send a message
  const sendMessage = (message: any) => {
    setMessages([...messages, message]);
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    socket.emit('stop typing', selectedChat?._id);
    axios
      .post(
        `${BACKEND_API}/api/message/`,
        { chatId: selectedChat?._id, content: message.content },
        config,
      )
      .then((response) => {
        const messageIndex = messages.findIndex(
          (msg) => msg._id === message._id,
        );

        if (messageIndex === -1) {
          setMessages([...messages, response.data]);
        } else {
          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = response.data;
          setMessages(updatedMessages);
        }

        dispatch(setNewMessage(response.data));
        socket.emit('new message', response.data);
        dispatch(updateChats(null));
        scrollToBottom;
      })
      .catch((error) => {
        if (error.response) {
          setMessageLoadingError((prevSelectLoading: any) => ({
            ...prevSelectLoading,
            [message]: false,
          }));
          console.error('Server error:', error.response.data.error);
          setMessageLoadingError((prevSelectLoading: any) => ({
            ...prevSelectLoading,
            [message]: false,
          }));
        } else if (error.request) {
          alert(
            'Cannot reach the server. Please check your internet connection.',
          );
          setMessageLoadingError((prevSelectLoading: any) => ({
            ...prevSelectLoading,
            [message]: false,
          }));
        } else {
          console.error('Error:', error.message);
          setMessageLoadingError((prevSelectLoading: any) => ({
            ...prevSelectLoading,
            [message]: false,
          }));
        }
      });
  };

  //display messages with api
  const displayMessages = () => {
    const chatId = selectedChat ? selectedChat._id : 'chatIsNotSelected';
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
    setLoadingMessages(true);
    axios
      .get(`${BACKEND_API}/api/message/${chatId}`, config)
      .then((response) => {
        setMessages(response.data);
        setLoadingMessages(false);
        socket.emit('join chat', selectedChat && selectedChat._id);
      })
      .catch((error) => {
        setLoadingMessages(false);
        if (error.response) {
          console.error('Server error:', error.response.data.error);
        } else if (error.request) {
          alert(
            'Cannot reach the server. Please check your internet connection.',
          );
        } else {
          console.error('Error:', error.message);
        }
      });
  };

  useEffect(() => {
    displayMessages();
  }, [selectedChat]);

  //add message to messages  in socket.io
  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        //give notification
        dispatch(updateChats(newMessageReceived));
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  return (
    <div className="flex w-full h-full">
      <div
        className={`${
          info ? 'hidden xl:flex flex-1 ' : ''
        } flex flex-col  w-full h-full bg-[url(https://images.rawpixel.com/image_800/cHJpdmF0ZS9zdGF0aWMvZmlsZXMvd2Vic2l0ZS8yMDIyLTA2L2pvYjk3OS1iYWNrZ3JvdW5kLTA5LmpwZw.jpg)]  bg-no-repeat bg-cover`}
      >
        {selectedChat && (
          <nav className=" bg-gray-200 w-full h-[50px] px-4 ">
            <div className="h-full w-full flex justify-start items-center ">
              <button
                title="Back"
                className="pr-2 md:hidden"
                onClick={() => (
                  dispatch(setSmallScreen(true)),
                  dispatch(setSelectedChat(null))
                )}
              >
                <FaArrowLeft />
                <p className="sr-only">Back</p>
              </button>
              <button
                onClick={() => dispatch(setInfo(true))}
                className="h-full w-full flex justify-start items-center"
              >
                {user && (
                  <img
                    src={
                      selectedChat?.isGroupChat === false
                        ? getSender(user, selectedChat?.users).pic
                        : selectedChat?.pic
                    }
                    alt=""
                    title="Profile details"
                    className="rounded-full h-[35px] w-[35px] bg-gray-400"
                  />
                )}

                <div className="w-[90%] min-w-[20px] px-3 flex flex-col items-start ">
                  {user && (
                    <p className="text-lg font-extrabold">
                      {selectedChat?.isGroupChat === false
                        ? getSender(user, selectedChat.users).username
                        : selectedChat?.chatName}
                    </p>
                  )}
                  {selectedChat?.isGroupChat === true && isTyping === true ? (
                    <div>{typer} typing...</div>
                  ) : selectedChat?.isGroupChat === true &&
                    isTyping === false ? (
                    <div className="w-full flex">
                      <span
                        className=" truncate text-sm text-gray-500"
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
                    isTyping === true ? (
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
            className="h-full w-full flex-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar"
            ref={scrollContainerRef}
          >
            {scrollButton && (
              <button
                onClick={scrollToBottom}
                className="rounded-l-md fixed bottom-[55px] right-0 px-3 py-1 bg-black opacity-40 "
                title="Move to the latest message"
              >
                <FaAngleDown color="white" />
              </button>
            )}
            {loadingMessages ? (
              <div className="w-full h-full flex justify-center items-center">
                <ClipLoading size={80} />
              </div>
            ) : (
              <DisplayMessages
                messageLoadingError={messageLoadingError}
                messages={messages}
                contentRef={contentRef}
              />
            )}
          </div>
        )}
        {selectedChat && (
          <Input
            sendMessage={sendMessage}
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
}
