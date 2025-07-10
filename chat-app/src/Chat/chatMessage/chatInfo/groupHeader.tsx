import React from 'react';
import { FaCamera, FaCheck, FaPen, FaUserFriends } from 'react-icons/fa';
import { Chat } from '../../../types';
import { FadeLoading } from '../../../config/ChatLoading';

interface GroupHeaderProps {
  selectedChat: Chat;
  changeGroupName: string;
  setChangeGroupName: (val: string) => void;
  nameEdit: boolean;
  setNameEdit: (val: boolean) => void;
  handleChangeGroupName: () => void;
  groupIconLoading: boolean;
  setIsHovered: (hovered: boolean) => void;
  isHovered: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  groupNameLoading: boolean;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  selectedChat,
  changeGroupName,
  setChangeGroupName,
  nameEdit,
  setNameEdit,
  handleChangeGroupName,
  groupIconLoading,
  setIsHovered,
  isHovered,
  handleFileChange,
  groupNameLoading,
}) => {
  return (
    <div className="h-fit w-fit flex flex-col justify-center items-center my-3">
      <div
        className="h-full w-full inline-block rounded-full "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`${groupIconLoading ? '' : 'Change Icon'}`}
      >
        <div
          className={`h-[180px] w-[180px] rounded-full border border-gray-500 bg-gray-400 relative ${
            groupIconLoading ? 'cursor-auto' : 'cursor-pointer'
          }`}
        >
          {groupIconLoading ? (
            <div className="flex justify-center items-center h-full w-full rounded-full bg-white absolute top-0 right-0 bg-opacity-50">
              <FadeLoading height={10} width={5} margin={-7} />
            </div>
          ) : (
            isHovered && (
              <label htmlFor="group-input">
                <div className="flex flex-col justify-center items-center h-full w-full rounded-full bg-black absolute top-0 right-0 bg-opacity-30 cursor-pointer">
                  <FaCamera color="white" />
                  <p className="text-small text-white">Change Profile Icon</p>
                </div>
              </label>
            )
          )}
          <input
            id="group-input"
            className="hidden h-full w-full"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={groupIconLoading}
          />
          <div className="flex justify-center items-center h-full w-full rounded-full">
            {selectedChat.pic ? (
              <img
                src={selectedChat.pic}
                alt="group icon"
                className="rounded-full h-full w-full"
              />
            ) : (
              <FaUserFriends color="white" size={100} />
            )}
          </div>
        </div>
      </div>

      <div
        className={`${
          nameEdit && 'border-b-2 border-gray-500'
        } flex justify-center items-end px-2`}
      >
        {nameEdit ? (
          <input
            type="text"
            value={changeGroupName}
            onChange={(e) => setChangeGroupName(e.target.value)}
            placeholder="Type here..."
            className="bg-inherit outline-none text-lg font-bold mt-[10px] mr-2"
          />
        ) : (
          <p className="text-lg font-bold mt-[10px] mr-4">
            {selectedChat.chatName}
          </p>
        )}
        {nameEdit ? (
          <button onClick={handleChangeGroupName} disabled={groupNameLoading}>
            {groupNameLoading ? (
              <div className="mb-[-10px] mr-[-15px]">
                <FadeLoading height={5} width={3} margin={-12} />
              </div>
            ) : (
              <FaCheck color="gray" />
            )}
          </button>
        ) : (
          <button onClick={() => setNameEdit(true)} className="mb-2">
            <FaPen color="gray" size={15} />
          </button>
        )}
      </div>
      <p className="text-md text-gray-600">
        {selectedChat.users.length} participants
      </p>
    </div>
  );
};

export default GroupHeader;
