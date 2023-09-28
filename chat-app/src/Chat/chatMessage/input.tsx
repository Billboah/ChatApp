import React, { ChangeEvent, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../types';

type Props = {
  sendMessage: (message: Message) => void;
  typingLogic: () => void;
  handleStopTyping: () => void;
};

const Input: React.FC<Props> = ({
  sendMessage,
  typingLogic,
  handleStopTyping,
}) => {
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [input, setInput] = useState('');

  function generateClientId() {
    return uuidv4();
  }

  //send message
  const handleSendMessage = (e: any) => {
    e.preventDefault();

    const currentTime = new Date();

    const inputMessage: any = {
      _id: generateClientId(),
      sender: user,
      content: input,
      chat: selectedChat,
      delivered: false,
      updatedAt: currentTime.toISOString(),
    };

    if (input.trim() !== '') {
      sendMessage(inputMessage);
      setInput('');
      resetTextareaHeight();
    }
    resetTextareaHeight();
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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

    //handle typing logic
    typingLogic();
  };

  return (
    <div className="bg-gray-200 w-full h-fit  px-4 py-2">
      <div className=" w-full h-fit ">
        <form
          onSubmit={handleSendMessage}
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
