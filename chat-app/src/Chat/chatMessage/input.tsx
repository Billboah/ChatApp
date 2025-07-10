import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  FormEvent,
} from 'react';
import { FaMicrophone } from 'react-icons/fa';
import SendIcon from '@mui/icons-material/Send';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { v4 as uuidv4 } from 'uuid';
import {
  setMessageError,
  setNewMessage,
  setTypingStatus,
} from '../../state/reducers/chat';
import { socket } from '../../config/chatLogics';
import { apiPost } from '../../utils/api';
import { Message, User } from '../../types';

const Input: React.FC = () => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function generateClientId() {
    return uuidv4();
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;
    if (!user) return;

    emitStopTyping(); // always stop typing before sending

    const currentTime = new Date();
    const tempId = generateClientId();

    if (!selectedChat) {
      dispatch(setMessageError({ id: tempId, hasError: true }));
      return;
    }

    const inputMessage: Message = {
      _id: tempId,
      sender: user,
      content: input.replace(/\n/g, '<br />'),
      chat: selectedChat,
      delivered: false,
      updatedAt: currentTime.toISOString(),
    };

    dispatch(setNewMessage({ tempId, message: inputMessage }));

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const result: Message | null = await apiPost(
      '/api/message/',
      {
        chatId: selectedChat?._id,
        content: inputMessage.content,
      },
      config,
      undefined,
      dispatch,
    );

    if (result) {
      dispatch(setNewMessage({ tempId, message: result }));
      socket.emit('send message', result);
    } else {
      dispatch(setMessageError({ id: tempId, hasError: true }));
    }

    setInput('');
    const textarea = document.getElementById(
      'input',
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      adjustTextareaHeight(textarea);
    }
  };

  const emitTyping = () => {
    if (selectedChat && user) {
      socket.emit('typing', user, selectedChat._id);
    }
  };

  const emitStopTyping = () => {
    if (selectedChat && user) {
      socket.emit('stop typing', user._id, selectedChat._id);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight(e.target);

    // Emit typing
    emitTyping();

    // Clear previous timeout and start a new one
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 10000); // stop typing after 10s of inactivity
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (window.innerWidth > 750 && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const handleBlur = () => {
    emitStopTyping(); // stop typing on input blur
  };

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.minHeight = '30px';
    textarea.style.height = '30px';
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.maxHeight = '120px';
  };

  // Listen for typing and stop typing events from socket
  useEffect(() => {
    const handleTyping = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: User | null;
    }) => {
      dispatch(
        setTypingStatus({
          isTyping: true,
          user: sender,
          chatId: chatId,
        }),
      );
    };

    const handleStopTyping = ({
      chatId,
      senderId,
    }: {
      chatId: string;
      senderId: string;
    }) => {
      dispatch(
        setTypingStatus({
          isTyping: false,
          user: null,
          chatId: null,
        }),
      );
    };

    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  });

  return (
    <div className="bg-gray-200 w-full h-fit px-4 py-4">
      <form
        onSubmit={sendMessage}
        className="flex justify-between items-end w-full"
      >
        <textarea
          id="input"
          name="input"
          rows={1}
          value={input}
          placeholder="Send a message"
          className="flex-1 mx-3 outline-none border border-gray-400 rounded-xl px-2 bg-inherit resize-none h-[30px]"
          onChange={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
        />
        <div>
          {input ? (
            <button type="submit">
              <SendIcon color="disabled" />
            </button>
          ) : (
            <FaMicrophone color="gray" size={20} />
          )}
        </div>
      </form>
    </div>
  );
};

export default Input;
