import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/reducers';
import { setInfo, setSmallScreen } from '../../state/reducers/screen';
import { FaArrowLeft, FaUser, FaUserFriends } from 'react-icons/fa';
import { setSelectedChat } from '../../state/reducers/chat';
import { getSender } from '../../config/chatLogics';

const Header = () => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { typingStatus } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  // Create a reordered participants array:
  const reorderedParticipants =
    selectedChat && user
      ? [
          ...selectedChat.users.filter((p) => p._id === user._id),
          ...selectedChat.users.filter(
            (p) => p._id === selectedChat.groupAdmin._id && p._id !== user._id,
          ),
          ...selectedChat.users.filter(
            (p) => p._id !== user._id && p._id !== selectedChat.groupAdmin._id,
          ),
        ]
      : [];

  return (
    <div>
      {selectedChat && (
        <nav className=" bg-gray-200 w-full h-[50px] px-4 border-b-inherit shadow-md">
          <div className="h-full w-full flex justify-start items-center ">
            <button
              title="Back"
              className="md:hidden"
              onClick={() => {
                dispatch(setSmallScreen(true)), dispatch(setSelectedChat(null));
              }}
            >
              <FaArrowLeft />
              <p className="sr-only">Back</p>
            </button>
            <button
              onClick={() => dispatch(setInfo(true))}
              className="h-full w-full flex justify-start items-center"
            >
              {user && (
                <div className="rounded-full h-[35px] w-[35px] bg-gray-400">
                  {selectedChat?.isGroupChat ? (
                    <div className="flex justify-center items-center w-full h-full">
                      {selectedChat?.pic ? (
                        <img
                          src={selectedChat?.pic}
                          alt="group icon"
                          title="Profile details"
                          className="h-full w-full rounded-full"
                          height={35}
                          width={35}
                          loading="lazy"
                        />
                      ) : (
                        <FaUserFriends color="white" size={25} />
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-full h-full">
                      {getSender(user, selectedChat?.users).pic ? (
                        <img
                          src={getSender(user, selectedChat?.users).pic}
                          alt="user profile"
                          className="h-full w-full rounded-full "
                          height={35}
                          width={35}
                          loading="lazy"
                        />
                      ) : (
                        <FaUser color="white" size={25} />
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="w-[90%] min-w-[20px] px-3 flex flex-col items-start ">
                {user && (
                  <p className="text-lg font-extrabold capitalize">
                    {selectedChat?.isGroupChat === false
                      ? getSender(user, selectedChat.users).username
                      : selectedChat?.chatName}
                  </p>
                )}
                {selectedChat?.isGroupChat === true &&
                typingStatus.isTyping &&
                typingStatus.user?._id !== user?._id ? (
                  <div>{typingStatus.user?.username} typing...</div>
                ) : selectedChat?.isGroupChat === true &&
                  (!typingStatus.isTyping ||
                    (typingStatus.isTyping &&
                      (typingStatus.user?._id === user?._id ||
                        typingStatus.user === null))) ? (
                  <div className="w-full flex">
                    <span
                      className=" line-clamp-1 text-sm text-gray-500 capitalize"
                      title={reorderedParticipants
                        .map((participant) =>
                          user?._id === participant._id
                            ? 'You'
                            : participant.username,
                        )
                        .join(', ')}
                    >
                      {reorderedParticipants
                        .map((participant) =>
                          user?._id === participant._id
                            ? 'You'
                            : participant.username,
                        )
                        .join(', ')}
                    </span>
                  </div>
                ) : selectedChat?.isGroupChat === false &&
                  typingStatus.isTyping === true &&
                  typingStatus.user?._id !== user?._id ? (
                  <div>typing...</div>
                ) : (
                  <div></div>
                )}
              </div>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Header;
