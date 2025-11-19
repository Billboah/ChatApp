import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './state/reducers/auth';
import { FadeLoading } from './config/ChatLoading';
import { setCurrentUser, setError } from './state/reducers/chat';
import { RootState } from './state/reducers';
import { apiPost } from './utils/api';
import { User } from './types';

export default function SignIn() {
    const { generalError } = useSelector((state: RootState) => state.chat);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const result = await apiPost(
      '/api/user/signin', {name, password}, {}, setLoading, dispatch)
    
      if (result) {
        const user = result as User;
        dispatch(setUser(user)); 
        dispatch(setCurrentUser(user));
        navigate('/');    
      }  
  };

  return (
    <div className="flex flex-col justify-center items-center h-fit min-h-screen w-full">
      <div className="h-fit w-full min-w-[200px] max-w-[350px] px-5 py-5 flex flex-col justify-center items-center bg-white rounded-xl relative  border-1-inherit shadow-lg m-1">
        <h1 className="font-bold mb-[20px] text-xl text-blue-600">SwiftTalk</h1>
        <h2 className="font-bold mb-[20px] text-xl">Sign In</h2>
        <div className="">
            {generalError && (
              <p className="text-xs text-red-500 before:content-['*'] before:text-red-500">
                {generalError}
              </p>
            )}
          </div>
        <form
          action=""
          onSubmit={handleSubmit}
          className="w-full flex flex-col justify-center items-center mb-[10px]"
        >
          <div className="w-full flex flex-col">
            <label
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
              htmlFor="signIn-name"
            >
              User Name or Email
            </label>
            <input
              id="signIn-name"
              type="text"
              required
              onChange={(e) => {
                setName(e.target.value), setError('');
              }}
              className="w-full px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="w-full flex flex-col">
            <label
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
              htmlFor="signIn-password"
            >
              Password
            </label>
            <div>
              <input
                className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
                id="signIn-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value), setError('');
                }}
                required
              />
            </div>
          </div>
          <span className="w-full flex justify-start text-sm my-2 ml-2 ">
            <input
              type="checkbox"
              className="mr-[5px] scale-150"
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
          
          <button
            disabled={loading}
            type="submit"
            className="w-full p-[5px] mt-[20px] bg-gray-200 rounded-md border-1-inherit shadow-md active:shadow-inner"
          >
            {loading ? (
              <div className="flex h-full justify-center items-center">
                <div className="h-[2px] w-[2px] mr-3 mt-2">
                  <FadeLoading height={5} width={3} margin={-12} />
                </div>
                <div>Loading...</div>
              </div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
        <div className="text-sm flex rounded-md">
          <div className="mr-[5px]"> Don&apos;t have account?</div>
          <Link to="/signup" className="text-blue-500">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
