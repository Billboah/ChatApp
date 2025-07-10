// COMPONENT: ChatInfo.tsx

import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInfo } from '../../../state/reducers/screen';
import { setError, setSelectedChat } from '../../../state/reducers/chat';
import { RootState } from '../../../state/reducers';
import AddParticipant from './addParticipant';
import CustomModal from '../../../components/Modal';
import { FadeLoading } from '../../../config/ChatLoading';
import { getSender } from '../../../config/chatLogics';
import { apiGet, apiPut } from '../../../utils/api';
import { handleImage } from '../../../utils/cloudinary';
import { Chat, User } from '../../../types';
import GroupHeader from './groupHeader';
import ContactHeader from './contactHeader';
import GroupParticipants from './groupParticipant';
import CommonGroups from './commonGroup';

function ChatInfo() {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { info } = useSelector((state: RootState) => state.screen);

  const [memberLoading, setMemberLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [groupIconLoading, setGroupIconLoading] = useState(false);
  const [groupNameLoading, setGroupNameLoading] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [changeGroupName, setChangeGroupName] = useState(
    selectedChat?.chatName || '',
  );
  const [isHovered, setIsHovered] = useState(false);
  const [commonGroup, setCommonGroup] = useState<Chat[]>([]);
  const [commonGroupLoading, setCommonGroupLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // ========== HANDLE REMOVE USER ==========
  const removeUserButton = (userToRemove: User) => {
    setIsModalOpen(true);
    setParticipantId(userToRemove._id);
    setModalMessage(
      `Are you sure you want to remove ${userToRemove.username} from ${selectedChat?.chatName}?`,
    );
  };

  const exitGroupChat = (user: User) => {
    setIsModalOpen(true);
    setParticipantId(user._id);
    setModalMessage(
      `Are you sure you want to leave ${selectedChat?.chatName}?`,
    );
  };

  const handleRemoveUser = async (removeUser: string) => {
    setMemberLoading((prev) => ({ ...prev, [removeUser]: true }));

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    const result = await apiPut<Chat>(
      '/api/chat/groupRemove',
      { userId: removeUser, chatId: selectedChat?._id },
      config,
      (loading) =>
        setMemberLoading((prev) => ({ ...prev, [removeUser]: loading })),
      dispatch,
    );

    if (result) dispatch(setSelectedChat(result));
  };

  // ========== HANDLE IMAGE UPLOAD ==========
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupIconLoading(true);
    const url = await handleImage(e);

    if (!url) {
      dispatch(setError('Image upload failed.'));
      setGroupIconLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    const result = await apiPut<Chat>(
      '/api/chat/changeIcon',
      { pic: url, chatId: selectedChat?._id },
      config,
      setGroupIconLoading,
      dispatch,
    );

    if (result) dispatch(setSelectedChat(result));
  };

  // ========== CHANGE GROUP NAME ==========
  const handleChangeGroupName = async () => {
    if (
      !changeGroupName.trim() ||
      selectedChat?.chatName === changeGroupName.trim()
    ) {
      setNameEdit(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    const result = await apiPut<Chat>(
      '/api/chat/rename',
      { chatName: changeGroupName, chatId: selectedChat?._id },
      config,
      setGroupNameLoading,
      dispatch,
    );

    if (result) {
      dispatch(setSelectedChat(result));
      setNameEdit(false);
    }
  };

  // ========== DISPLAY COMMON GROUP CHATS ==========
  const displayChats = async () => {
    if (!user || !selectedChat) return;

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    const data = await apiGet<Chat[]>(
      '/api/chat',
      config,
      setCommonGroupLoading,
      dispatch,
    );

    if (data) {
      const groupChats = data.filter((chat) => chat.isGroupChat);
      const matched = groupChats.filter((chat) =>
        chat.users.some(
          (u) => u._id === getSender(user, selectedChat.users)._id,
        ),
      );
      setCommonGroup(matched);
    }
  };

  useEffect(() => {
    displayChats();
  }, [info]);

  // ========== JSX RENDER ==========
  return (
    user &&
    selectedChat && (
      <div className="h-full flex-1 flex flex-col border-l border-gray-400 bg-gray-100">
        {/* HEADER */}
        <nav className="flex items-center bg-gray-200 h-[50px] w-full px-5 text-gray-700">
          <button onClick={() => dispatch(setInfo(false))}>
            <FaTimes size={17} />
          </button>
          <h2 className="text-lg font-semibold ml-5">
            {selectedChat.isGroupChat ? 'Group Info' : 'Contact Info'}
          </h2>
        </nav>

        {/* MAIN SCROLLABLE SECTION */}
        <div className="flex flex-col h-full overflow-y-scroll scrollbar-hide custom-scrollbar">
          {/* === SECTION: PROFILE HEADER === */}
          <section className="flex items-center justify-center bg-gray-300 py-3">
            {selectedChat.isGroupChat ? (
              <GroupHeader
                {...{
                  selectedChat,
                  nameEdit,
                  setNameEdit,
                  groupIconLoading,
                  handleFileChange,
                  changeGroupName,
                  setChangeGroupName,
                  handleChangeGroupName,
                  groupNameLoading,
                  isHovered,
                  setIsHovered,
                }}
              />
            ) : (
              <ContactHeader user={user} selectedChat={selectedChat} />
            )}
          </section>

          {/* === SECTION: MEDIA === */}
          <section className="bg-gray-300 px-5 py-3">
            <p>Media, links, and docs</p>
          </section>

          {/* === SECTION: GROUP PARTICIPANTS === */}
          {selectedChat.isGroupChat && (
            <GroupParticipants
              selectedChat={selectedChat}
              user={user}
              setAddUser={setAddUser}
              removeUserButton={removeUserButton}
              memberLoading={memberLoading}
            />
          )}

          {/* === SECTION: COMMON GROUPS === */}
          {!selectedChat.isGroupChat && (
            <CommonGroups
              commonGroup={commonGroup}
              commonGroupLoading={commonGroupLoading}
              user={user}
            />
          )}

          {/* === SECTION: EXIT OR BLOCK === */}
          <section className="bg-gray-300 px-5 py-3 text-red-500">
            {selectedChat.isGroupChat ? (
              <div>
                {user && selectedChat.groupAdmin._id !== user._id && (
                  <button
                    onClick={() => exitGroupChat(user)}
                    disabled={memberLoading[user._id]}
                    className="w-full border-b border-gray-400 py-2 hover:bg-gray-200"
                  >
                    Exit group
                    {memberLoading[user._id] && (
                      <FadeLoading height={5} width={3} margin={5} />
                    )}
                  </button>
                )}
                {selectedChat.groupAdmin._id === user._id && (
                  <p>Delete group</p>
                )}
              </div>
            ) : (
              <p>Block user</p>
            )}
          </section>
        </div>

        {/* === MODALS === */}
        {addUser && <AddParticipant setAddUser={setAddUser} />}
        {isModalOpen && (
          <CustomModal
            onRequestClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              handleRemoveUser(participantId);
              setIsModalOpen(false);
            }}
            modalMessage={modalMessage}
          />
        )}
      </div>
    )
  );
}

export default ChatInfo;
