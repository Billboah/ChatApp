import React from 'react';
import { FaUser } from 'react-icons/fa';
import { Chat, User } from '../../../types';
import { getSender } from '../../../config/chatLogics';

interface Props {
  selectedChat: Chat;
  user: User;
}

const ContactHeader: React.FC<Props> = ({ selectedChat, user }) => {
  const contact = getSender(user, selectedChat.users);

  return (
    <div className="flex flex-col justify-center items-center my-3">
      <div className="flex justify-center items-center h-[180px] w-[180px] rounded-full border border-gray-500 bg-gray-400 ">
        {contact?.pic ? (
          <img
            src={contact.pic}
            alt="user"
            className="h-full w-full rounded-full"
          />
        ) : (
          <FaUser size={100} color="white" />
        )}
      </div>
      <p className="text-lg font-bold mt-[10px] capitalize">
        {contact.username}
      </p>
      <p className="text-md truncate text-gray-600">
        <span className="font-bold mr-1">Email:</span>
        <span>{contact.email}</span>
      </p>
    </div>
  );
};

export default ContactHeader;
