import React, { useState } from 'react';
import {
  FaArrowLeft,
  FaCamera,
  FaCheck,
  FaPen,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setUser } from '../../state/reducers/auth';
import { setProfile } from '../../state/reducers/screen';
import axios, { AxiosRequestConfig } from 'axios';
import { setChatChange, setSelectedChat } from '../../state/reducers/chat';
import { RootState } from '../../state/reducers';
import { FadeLoading } from '../../config/ChatLoading';
import { BACKEND_API } from '../../config/chatLogics';

function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [changeName, SetChangeName] = useState(user?.username);

  //logout
  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(setProfile(null));
    dispatch(setSelectedChat(null));
  };

  //change profile pic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataURL = reader.result as string;

      setPicLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      axios
        .put(`${BACKEND_API}/api/user/updatepic`, { pic: dataURL }, config)
        .then((response) => {
          dispatch(setChatChange(true));
          dispatch(setUser(response.data));
          setNameEdit(false);
          setPicLoading(false);
        })
        .catch((error) => {
          setPicLoading(false);
          if (error.response) {
            setError(error.response.data.error);
          } else if (error.request) {
            alert(
              'Cannot reach the server. Please check your internet connection.',
            );
          } else {
            console.error('Error:', error.message);
          }
        });
    };
    reader.readAsDataURL(file);
  };

  //change name
  const handleChangeName = () => {
    if (user?.username === changeName?.trim() || changeName?.trim() === '') {
      setNameEdit(false);
      return;
    } else {
      setNameLoading(true);
      const config: AxiosRequestConfig<any> = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      axios
        .put(`${BACKEND_API}/api/user/rename`, { username: changeName }, config)
        .then((response) => {
          dispatch(setChatChange(true));
          dispatch(setUser(response.data));
          setNameEdit(false);
          setNameLoading(false);
        })
        .catch((error) => {
          setNameLoading(false);
          if (error.response) {
            if (error.response.status === 400) {
              setError(error.response.data.error);
            } else {
              console.error('Server error:', error.response.data.error);
            }
          } else if (error.request) {
            alert(
              'Cannot reach the server. Please check your internet connection.',
            );
          } else {
            console.error('Error:', error.message);
          }
        });
    }
  };

  return (
    <div className="h-full w-full">
      <nav className="flex items-end bg-gray-200 h-[70px] w-full px-[20px] py-[10px]">
        <button className="" onClick={() => dispatch(setProfile(false))}>
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold ml-[20px]">Profile</h2>
      </nav>
      <div className="flex flex-col  h-full pt-[50px] pb-[100px] px-[30px] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-hide custom-scrollbar">
        <div className="flex flex-col justify-center w-full mb-[30px] relative">
          <div className="w-full h-full flex justify-center items-center">
            <div
              className="inline clock h-fit w-fit "
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              title={`${picLoading ? '' : 'Change Icon'}`}
            >
              <div
                className={`h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 relative ${
                  picLoading ? ' cursor-auto' : 'cursor-pointer'
                }`}
              >
                {picLoading ? (
                  <div className="flex  justify-center items-center h-full w-full rounded-full border border-gray-500  bg-white absolute  top-0 right-0 bg-opacity-50">
                    <FadeLoading height={10} width={5} margin={-7} />
                  </div>
                ) : (
                  isHovered && (
                    <label htmlFor="file-input">
                      <div className="flex flex-col  justify-center items-center h-full w-full rounded-full border border-gray-500  bg-black absolute  top-0 right-0 bg-opacity-30 cursor-pointer">
                        <FaCamera color="white" />
                        <p className="text-small text-white">
                          Change Profile Icon
                        </p>
                      </div>
                    </label>
                  )
                )}
                <input
                  id="file-input"
                  className="hidden h-full w-full"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={picLoading}
                />

                <div className="flex justify-center items-center h-[180px] w-[180px] rounded-full border border-gray-500  bg-gray-400 cursor-pointer">
                  {user?.pic ? (
                    <img
                      src={user?.pic}
                      alt="user icon"
                      className="rounded-full h-full w-full"
                    />
                  ) : (
                    <FaUser size={100} color="white" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${
              nameEdit && 'border-b-2 border-gray-500 px-2'
            } flex justify-center items-end w-fit `}
          >
            {nameEdit ? (
              <input
                type="text"
                value={changeName}
                onChange={(e) => SetChangeName(e.target.value)}
                placeholder="Type here..."
                className="bg-inherit outline-none text-lg font-bold mt-[10px] w-full"
              />
            ) : (
              <p className="text-lg font-bold mt-[10px] mr-4">
                {user?.username}
              </p>
            )}
            {nameEdit ? (
              <button
                onClick={handleChangeName}
                title="save "
                disabled={nameLoading}
              >
                {nameLoading ? (
                  <div className="mb-[-10px] mr-[-15px]">
                    <FadeLoading height={5} width={3} margin={-12} />
                  </div>
                ) : (
                  <FaCheck color="gray" />
                )}
              </button>
            ) : (
              <button
                className="mb-2"
                onClick={() => setNameEdit(true)}
                title="Edit user name"
              >
                <FaPen color="gray" size={13} />
              </button>
            )}
          </div>
          <div className="mb-[30px]">
            <p className="">
              <span className="font-bold ">Email: </span>
              <span>{user?.email}</span>
            </p>
            <p className=" ">
              <span className="font-bold ">Name: </span>
              <span>{user?.name}</span>
            </p>
          </div>
        </div>
        <div className="w-full">
          <button
            onClick={handleLogout}
            className="flex items-center justify-start "
            title="Sign out"
          >
            <FaSignOutAlt size={20} color="gray" />
            <p className="text-gray-500 ml-[5px] font-bold">Sign Out</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
