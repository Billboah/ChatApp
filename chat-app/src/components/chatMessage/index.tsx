import React, { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo, setSmallScreen } from '../../state/reducers/screen';
import { setSelectedChat } from '../../state/reducers/chat';
import ChatInfo from './chatInfo';
import DisplayMessages from './displayMessages';
import Input from './input';
import axios, { AxiosRequestConfig } from 'axios';
import { io } from 'socket.io-client';
import { RootState } from '../../state/reducers';

interface Users {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
}

interface Messages {
  _id: string;
  sender: Users;
  content: string;
  chat: ChatInfo;
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

let selectedChatCompare: ChatInfo | null;

const socket = io('http://localhost:5000');

export default function chatMessages() {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { info } = useSelector((state: RootState) => state.screen);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typer, setTyper] = useState('');

  //scrolling to the bottom automatically
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current && contentRef.current) {
      scrollContainerRef.current.scrollTop =
        contentRef.current.scrollHeight -
        scrollContainerRef.current.clientHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //connect to socket.io
  useEffect(() => {
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
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
  const sendMessage = (text: string) => {
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    socket.emit('stop typing', selectedChat?._id);
    setLoading(true);
    axios
      .post(
        'http://localhost:5000/api/message/',
        { chatId: selectedChat?._id, content: text },
        config,
      )
      .then((response) => {
        socket.emit('new message', response.data);
        setMessages([...messages, response.data]);
        setLoading(false);
        scrollToBottom;
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  //display messages with api
  const displayMessages = () => {
    if (!selectedChat) {
      return;
    }
    const config: AxiosRequestConfig<any> = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
    setLoadingMessages(true);
    axios
      .get(`http://localhost:5000/api/message/${selectedChat._id}`, config)
      .then((response) => {
        setMessages(response.data);
        setLoadingMessages(false);
        socket.emit('join chat', selectedChat._id);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoadingMessages(false);
      });
  };

  useEffect(() => {
    displayMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  //add message to messages and tell when one is typing in socket.io
  useEffect(() => {
    socket.on('message received', (newMessageReceived: Messages) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        //give notification
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });

    socket.on(
      'typing',
      (sender) => (setIsTyping(true), setTyper(sender?.username)),
    );
    socket.on('stop typing', () => (setIsTyping(false), setTyper(' ')));
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
                className="mr-[10px] md:hidden"
                onClick={() => (
                  dispatch(setSmallScreen(true)),
                  dispatch(setSelectedChat(null))
                )}
              >
                <FaArrowLeft />
              </button>
              <button
                onClick={() => dispatch(setInfo(true))}
                className="h-full w-full flex justify-start items-center max-w-fit min-w-[100px]"
              >
                <img
                  src={
                    selectedChat?.isGroupChat === false
                      ? selectedChat?.users[0]._id === user?.id
                        ? selectedChat?.users[1].pic
                        : selectedChat?.users[0].pic
                      : selectedChat?.pic
                  }
                  alt=""
                  title="Profile details"
                  className="rounded-full h-[35px] w-[35px] bg-gray-400"
                />

                <div className="w-full px-3 flex flex-col items-start ">
                  <p className="text-lg font-extrabold">
                    {selectedChat?.isGroupChat === false
                      ? selectedChat?.users[0]._id === user?.id
                        ? selectedChat?.users[1].username
                        : selectedChat?.users[0].username
                      : selectedChat?.chatName}
                  </p>
                  {selectedChat?.isGroupChat === true && isTyping === true ? (
                    <div>{typer} typing...</div>
                  ) : selectedChat?.isGroupChat === true &&
                    isTyping === false ? (
                    <div className="w-full flex max-w-fit">
                      <span
                        className="truncate text-sm text-gray-500"
                        title={selectedChat?.users
                          .map((participant) =>
                            user?.id === participant._id
                              ? 'You'
                              : participant.username,
                          )
                          .join(', ')}
                      >
                        {selectedChat?.users
                          .map((participant) =>
                            user?.id === participant._id
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
        <div
          className="h-full w-full flex-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar"
          ref={scrollContainerRef}
        >
          <DisplayMessages
            loading={loading}
            messages={messages}
            contentRef={contentRef}
          />
        </div>
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
