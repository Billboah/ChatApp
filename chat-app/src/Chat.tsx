import React, { useEffect, useRef } from 'react';
import ChatSidebar from './components/chatSidebar';
import ChatMessages from './components/chatMessage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateGroupChat from './components/chatSidebar/createGroupChat';
import { setInfo } from './state/reducers/screen';
import { RootState } from './state/reducers';

function Chats  () {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { smallScreen } = useSelector((state: RootState) => state.screen);
  const { newGroup } = useSelector((state: RootState) => state.screen);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(setInfo(false));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex w-full h-screen m-0 p-0">
      <div
        className={`${
          smallScreen ? 'block h-full w-full' : 'hidden'
        } sm:block sm:w-1/4 sm:min-w-[300px] `}
      >
        <ChatSidebar />
      </div>
      <div
        ref={ref}
        className={`${
          smallScreen ? 'hidden ' : 'block h-full w-full'
        } sm:block sm:w-3/4 flex-1  h-full`}
      >
        <ChatMessages />
      </div>
      {newGroup && <CreateGroupChat />}
    </div>
  );
}

export default Chats;
