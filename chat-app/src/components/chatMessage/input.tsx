import React, { ChangeEvent, useState } from 'react';
import { FaMicrophone, FaPaperPlane, FaPlus } from 'react-icons/fa';

type Props = {
  sendMessage: (text: string) => void;
  typingLogic: () => void;
  handleStopTyping: () => void;
};

const Input: React.FC<Props> = ({
  sendMessage,
  typingLogic,
  handleStopTyping,
}) => {
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim() !== '') {
      sendMessage(input);
      setInput('');
      resetTextareaHeight();
    }
    resetTextareaHeight();
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
      <div className="flex justify-between items-end w-full h-fit p-0">
        <FaPlus fontWeight={5} color="gray" size={20} />
        <textarea
          id="input"
          name="input"
          rows={1}
          value={input}
          placeholder="Send a message"
          className="flex-1 mx-3 outline-none border border-gray-400 w-full  overflow-y-hidden rounded-xl px-2  bg-inherit resize-none h-[30px] m-0"
          onChange={handleInput}
          onBlur={handleStopTyping}
        />
        <div>
          {input ? (
            <button onClick={handleSendMessage}>
              <FaPaperPlane color="gray" size={20} />
            </button>
          ) : (
            <FaMicrophone color="gray" size={20} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;
