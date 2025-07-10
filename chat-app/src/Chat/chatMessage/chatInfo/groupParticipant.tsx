import React from 'react';
import { FaTimes, FaUser } from 'react-icons/fa';
import { Chat, User } from '../../../types';
import { FadeLoading } from '../../../config/ChatLoading';

interface Props {
  selectedChat: Chat;
  user: User;
  memberLoading: { [key: string]: boolean };
  removeUserButton: (u: User) => void;
  setAddUser: (val: boolean) => void;
}

const GroupParticipants: React.FC<Props> = ({
  selectedChat,
  user,
  memberLoading,
  removeUserButton,
  setAddUser,
}) => {
  // Create a reordered participants array:
  const reorderedParticipants = [
    ...selectedChat.users.filter((p) => p._id === user._id),
    ...selectedChat.users.filter(
      (p) => p._id === selectedChat.groupAdmin._id && p._id !== user._id,
    ),
    ...selectedChat.users.filter(
      (p) => p._id !== user._id && p._id !== selectedChat.groupAdmin._id,
    ),
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center px-[20px] mb-[7px]">
        <p className="text-gray-600">
          {selectedChat.users.length} participants
        </p>
        {selectedChat.groupAdmin._id === user._id && (
          <button
            onClick={() => setAddUser(true)}
            className="px-[10px] bg-gray-200 rounded-md border shadow-md active:shadow-inner"
          >
            Add a participant
          </button>
        )}
      </div>

      {reorderedParticipants.map((participant) => (
        <div
          key={participant._id}
          className="flex justify-between items-center px-[20px] border-t border-gray-400"
        >
          <div className="w-full flex items-center flex-1 py-[7px] mr-1">
            <div className="w-[30px] h-[30px] flex justify-center items-center rounded-full bg-gray-400">
              {participant.pic ? (
                <img
                  src={participant.pic}
                  alt="Profile"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <FaUser size={20} color="white" />
              )}
            </div>
            <div className="ml-2">
              <p className="capitalize">
                {participant._id === user._id ? 'You' : participant.username}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span>{' '}
                {participant.email}
              </p>
            </div>
          </div>
          {selectedChat.groupAdmin._id === participant._id && (
            <p className="text-sm text-blue-800">Admin</p>
          )}
          {selectedChat.groupAdmin._id === user._id &&
            participant._id !== selectedChat.groupAdmin._id && (
              <button
                onClick={() => removeUserButton(participant)}
                disabled={memberLoading[participant._id]}
                className="ml-3"
              >
                {memberLoading[participant._id] ? (
                  <FadeLoading height={5} width={3} margin={-12} />
                ) : (
                  <FaTimes color="gray" />
                )}
              </button>
            )}
        </div>
      ))}
    </div>
  );
};

export default GroupParticipants;
