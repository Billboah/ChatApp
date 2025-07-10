import React from 'react';
import { FaUserFriends } from 'react-icons/fa';
import { Chat, User } from '../../../types';
import { ClipLoading } from '../../../config/ChatLoading';
interface Props {
  commonGroup: Chat[];
  commonGroupLoading: boolean;
  user: User;
}

const CommonGroups: React.FC<Props> = ({
  commonGroup,
  commonGroupLoading,
  user,
}) => {
  return (
    <div className="flex-1 px-4 py-2">
      <h3 className="font-bold text-gray-500">
        {commonGroup.length} Groups in Common
      </h3>
      {commonGroupLoading ? (
        <ClipLoading />
      ) : (
        <div className="w-full border-y border-gray-400 mt-2">
          {commonGroup.map((chat) => (
            <div key={chat._id} className="flex items-center py-2">
              <div className="w-[30px] h-[30px] bg-gray-400 rounded-full flex justify-center items-center">
                {chat.pic ? (
                  <img
                    src={chat.pic}
                    alt="group icon"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <FaUserFriends color="white" size={20} />
                )}
              </div>
              <div className="ml-3">
                <p className="font-semibold capitalize">{chat.chatName}</p>
                <p className="text-sm text-gray-600 truncate w-full">
                  {chat.users
                    .map((p) => (p._id === user._id ? 'You' : p.username))
                    .join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommonGroups;
