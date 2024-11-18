import React, { ChangeEvent, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import SendIcon from '@mui/icons-material/Send';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../types';
import {
  setError,
  setMessageError,
  setNewMessage,
} from '../../state/reducers/chat';
import axios from 'axios';
import { BACKEND_API, socket } from '../../config/chatLogics';

type Props = {
  typingLogic: () => void;
  handleStopTyping: () => void;
};

const Input: React.FC<Props> = ({ typingLogic, handleStopTyping }) => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();

  function generateClientId() {
    return uuidv4();
  }

  //send a message
  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    //socket.emit('stop typing', selectedChat?._id);

    e.preventDefault();

    const currentTime = new Date();

    const tempId = generateClientId();

    const inputMessage: any = {
      _id: tempId,
      sender: user,
      content: input.replace(/\n/g, '<br />'),
      chat: selectedChat,
      delivered: false,
      updatedAt: currentTime.toISOString(),
    };

    dispatch(setNewMessage({ tempId: tempId, message: inputMessage }));

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    socket.emit('stop typing', selectedChat?._id);

    if (input.trim() !== '') {
      axios
        .post(
          `${BACKEND_API}/api/message/`,
          { chatId: selectedChat?._id, content: inputMessage.content },
          config,
        )
        .then((response) => {
          dispatch(setNewMessage({ tempId, message: response.data }));
          socket.emit('send message', response.data);
        })
        .catch((error) => {
          if (error.response) {
            dispatch(setMessageError({ id: inputMessage._id, hasError: true }));
            dispatch(setError(error.response.data.error));
          } else if (error.request) {
            dispatch(
              setError(
                'Cannot reach the server. Please check your internet connection.',
              ),
            );
            dispatch(setMessageError({ id: inputMessage._id, hasError: true }));
          } else {
            dispatch(setError(error.message));
            dispatch(setMessageError({ id: tempId, hasError: true }));
          }
        });
      setInput('');
      resetTextareaHeight();
    }
    resetTextareaHeight();
  };

  const handleKeyPress = (e: any) => {
    if (window.innerWidth > 750 && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const resetTextareaHeight = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.minHeight = '30px';
      textarea.style.height = '30px';
    }
  };

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);

    const textarea = event.target;
    textarea.style.minHeight = '30px';
    textarea.style.height = '30px';
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.maxHeight = '120px';

    typingLogic();
  };

  return (
    <div className="bg-gray-200 w-full h-fit  px-4 py-4 ">
      <div className=" w-full h-fit ">
        <form
          onSubmit={sendMessage}
          className="flex justify-between items-end w-full h-fit p-0"
        >
          <textarea
            id="input"
            name="input"
            rows={1}
            value={input}
            placeholder="Send a message"
            className="flex-1 mx-3 outline-none border border-gray-400 w-full  overflow-y-hidden rounded-xl px-2  bg-inherit resize-none h-[30px] m-0"
            onChange={handleInput}
            onBlur={handleStopTyping}
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
    </div>
  );
};

export default Input;
