import React from 'react';

type Props = {
  handleFunction: () => void;
  user: {
    _id: string;
    username: string;
    pic: string;
    name: string;
    email: string;
  };
};

const ChatList: React.FC<Props> = ({ user, handleFunction }) => {
  return (
    <button
      className={`hover:bg-gray-200 active:bg-gray-300  w-full h-[70px] px-[20px] py-[10px]`}
      onClick={handleFunction}
    >
      <div className="w-full flex items-center">
        <img
          src={user?.pic}
          alt="Profile"
          className="w-[30px] h-[30px] rounded-full bg-gray-400"
        />
        <div className="flex flex-col items-start w-[250px] ml-[10px]">
          <p className="truncate text-left">{user?.username}</p>
          <p className=" text-sm text-left w-full truncate">
            <span className="font-semibold">Email: </span>
            <span className=" ml-[2px]  ">{user?.email}</span>
          </p>
        </div>
      </div>
    </button>
  );
};

export default ChatList;
