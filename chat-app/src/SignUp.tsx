import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setUser } from './state/reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import { FadeLoading } from './config/ChatLoading';
import { setCurrentUser, setError } from './state/reducers/chat';
import { apiPost } from './utils/api';
import { User } from './types';
import { RootState } from './state/reducers';
import { handleImage } from './utils/cloudinary';

type PicStateType = string | undefined;

function SignUp() {
  const { generalError } = useSelector((state: RootState) => state.chat);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setFullname] = useState('');
  const [pic, setPic] = useState<PicStateType>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !name || !email || !password || !confirmPassword) {
      dispatch(setError('All fields are required.'));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(setError('Passwords do not match.'));
      return;
    }
      const result = await apiPost(
        '/api/user/signup',
        {
          username,
          name,
          email,
          password,
          confirmPassword,
          pic,
        },
        {},
        setLoading,
        dispatch,
      );
      if (result) {
        const user = result as User;
        dispatch(setUser(user));
        dispatch(setCurrentUser(user));
        navigate('/');
      }
    
  };

  return (
    <div className="flex flex-col justify-center items-center h-fit min-h-screen w-full ">
      <div className="h-fit w-full min-w-[200px] max-w-[350px] px-5 py-5 flex flex-col justify-center items-center bg-white  rounded-xl relative  border-1-inherit shadow-lg m-1">
        <h1 className="font-bold mb-[20px] text-xl text-blue-600">SwiftTalk</h1>
        <h2 className="font-bold mb-[20px] text-xl">Create account</h2>
        {generalError && (
          <div className="text-xs mb-2 text-red-500  before:content-['*'] before:mr-0.5 before:text-red-500">
            {generalError}
          </div>
        )}
        <form
          onSubmit={handleSignIn}
          className="flex flex-col justify-center items-center mb-[10px]"
        >
          <div className="w-full h-15 flex flex-col">
            <label
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
              htmlFor="up-name"
            >
              Full Name
            </label>
            <input
              id="up-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setFullname(e.target.value), dispatch(setError(''));
              }}
              className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="w-full h-15 flex flex-col">
            <label
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
              htmlFor="up-userName"
            >
              User Name
            </label>
            <input
              id="up-userName"
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value), dispatch(setError(''));
              }}
              className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="w-full h-15 flex flex-col">
            <label
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
              htmlFor="up-email"
            >
              Email
            </label>
            <input
              id="up-email"
              type="email"
              value={email}
              required
              onChange={(e) => {
                setEmail(e.target.value), dispatch(setError(''));
              }}
              className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="w-full h-15 flex flex-col">
            <label
              htmlFor="up-password"
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
            >
              Password
            </label>
            <div>
              <input
                id="up-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                required
                onChange={(e) => {
                  setPassword(e.target.value), dispatch(setError(''));
                }}
                className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
              />
            </div>
          </div>
          <div className="w-full h-15 flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Confirm Password
            </label>
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                required
                onChange={(e) => {
                  setConfirmPassword(e.target.value), dispatch(setError(''));
                }}
                className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
              />
            </div>
          </div>
          <span className="w-full flex justify-start text-sm my-2 ml-2 ">
            <input
              type="checkbox"
              className="mr-[5px] scale-150"
              required
              onChange={(e) => {
                if (e.target.checked) {
                  setShowPassword(true);
                } else {
                  setShowPassword(false);
                }
              }}
            />
            Show Password
          </span>
          <div className="w-full">
            <div className="text-xs text-gray-600 mb-2 mx-3 ">
              <p>Password must have at least 8 character. </p>
              <p>
                Mix letters, symbols, and numbers to create a strong password.
              </p>
            </div>
          </div>
          <div className="w-full h-15 flex flex-col">
            <label htmlFor="file-input" className="">
              Profile pic
            </label>
            <input
              id="file-input"
              className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const img = await handleImage(e);
                setPic(img ?? undefined);
              }}
            />
          </div>
          <div className="w-full flex justify-start text-sm my-2 ml-2">
            <input type="checkbox" className="mr-[5px] scale-150" required />
            <span className="mx-[5px]">I agree to</span>
            <span>
              <a href="#" className="text-blue-500">
                privacy policy & terms.
              </a>
            </span>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full p-[5px] mt-[20px] bg-gray-200 rounded-md border-1-inherit shadow-md active:shadow-inner "
          >
            {loading ? (
              <div className="flex h-full justify-center items-center">
                <div className="h-[2px] w-[2px] mr-3 mt-2">
                  <FadeLoading height={5} width={3} margin={-12} />
                </div>
                <div>Loading...</div>
              </div>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        <div className="text-sm mt-[5px]">
          <span className="mr-[5px]">Already have an account?</span>
          <span>
            <Link to="/signin" className="text-blue-500">
              Sign in instead.
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
