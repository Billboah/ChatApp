type User = {
  _id: string;
  name: string;
  pic: string;
  username: string;
};

type ChatInfo = {
  _id: string;
  chatName: string;
  users: User[];
};
export const getSenderName = (
  loginUserId: string | undefined,
  chat: ChatInfo,
) =>
  chat?.users[0]._id === loginUserId
    ? chat?.users[1].username
    : chat?.users[0].username;

export const getSenderId = (loginUserId: string | undefined, chat: ChatInfo) =>
  chat?.users[0]._id === loginUserId ? chat?.users[1]._id : chat?.users[0]._id;
