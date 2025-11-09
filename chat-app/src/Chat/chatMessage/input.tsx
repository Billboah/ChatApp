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
import { setNewMessage, setTypingStatus } from '../../state/reducers/chat';
import { Message } from '../../types';
import socket from '../../socket/socket';

const Input: React.FC = () => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function generateClientId() {
    return uuidv4();
  }

  // ==== Send message via socket ======
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !selectedChat) return;

    emitStopTyping();

    const currentTime = new Date();
    const tempId = generateClientId();

    const inputMessage: Message = {
      _id: tempId,
      sender: user,
      content: input.replace(/\n/g, '<br />'),
      chat: selectedChat,
      delivered: false,
      updatedAt: currentTime.toISOString(),
    };

    // Optimistically add to chat UI
    dispatch(setNewMessage({ tempId, message: inputMessage }));

    // Send message via socket (auth token already attached to connection)
    // Emit the message
    socket.emit('send message', {
      chatId: selectedChat._id,
      content: inputMessage.content,
      senderId: user._id,
      tempId,
    });

    // socket listeners are registered globally in a useEffect (not per-send)

    setInput('');
    const textarea = document.getElementById(
      'input',
    ) as HTMLTextAreaElement | null;
    if (textarea) adjustTextareaHeight(textarea);
  };

  // ==== Typing events ======

  const emitTyping = () => {
    if (selectedChat && user) socket.emit('typing', selectedChat._id);
  };

  const emitStopTyping = () => {
    if (selectedChat && user) socket.emit('stop typing', selectedChat._id);
  };

  // ===== Handle input
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight(e.target);
    emitTyping();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => emitStopTyping(), 10000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (window.innerWidth > 750 && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const handleBlur = () => emitStopTyping();

  // ====== Auto-resize ======
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.minHeight = '30px';
    textarea.style.height = '30px';
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.maxHeight = '120px';
  };

  // Listen for typing events
  useEffect(() => {
    const handleTyping = ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      // Find user in chat participants and set as typing
      if (selectedChat?.users) {
        const typingUser =
          selectedChat.users.find((u) => u._id === userId) || null;
        dispatch(setTypingStatus({ isTyping: true, user: typingUser, chatId }));
      }
    };

    const handleStopTyping = () => {
      dispatch(setTypingStatus({ isTyping: false, user: null, chatId: null }));
    };

    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [dispatch, selectedChat]);

  // Global socket listeners: handle confirmations and incoming messages
  useEffect(() => {
    const handleMessageSent = (payload: any) => {
      // payload may be { tempId, message } or the message object itself
      const message: Message = payload?.message ?? payload;
      const tempId: string = payload?.tempId ?? message?._id;
      if (!message) return;
      dispatch(setNewMessage({ tempId: tempId || message._id, message }));
    };

    const handleReceivedMessage = (payload: any) => {
      // Server may emit either:
      // - a full message object
      // - { ...messageFields, tempId }
      // - { tempId, message }
      const message: Message = payload?.message ?? payload;
      const tempId: string = payload?.tempId ?? message?._id;

      if (!message) {
        console.warn(
          'Received malformed payload for received message:',
          payload,
        );
        return;
      }

      dispatch(setNewMessage({ tempId: tempId || message._id, message }));
      console.log('received message', message, 'tempId', tempId);
    };

    const handleSocketError = (msg: string) => {
      console.error('Socket error:', msg);
    };

    socket.on('message sent', handleMessageSent);
    socket.on('received message', handleReceivedMessage);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('message sent', handleMessageSent);
      socket.off('received message', handleReceivedMessage);
      socket.off('error', handleSocketError);
    };
  }, [dispatch]);

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
