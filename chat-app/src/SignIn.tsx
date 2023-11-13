import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './state/reducers/auth';
import { FadeLoading } from './config/ChatLoading';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BACKEND_API } from './config/chatLogics';
import { setCurrentUser } from './state/reducers/chat';

export default function SignIn() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    axios
      .post(`${BACKEND_API}/api/user/signin`, {
        name,
        password,
      })
      .then(function (response) {
        dispatch(setUser(response.data));
        dispatch(setCurrentUser(response.data));
        navigate('/');
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(false);
        if (error.response) {
          setSignInError(error.response.data.error);
        } else if (error.request) {
          alert(
            'Cannot reach the server. Please check your internet connection.',
          );
        } else {
          console.error('Error:', error.message);
        }
      });
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col justify-center items-center h-fit min-h-screen w-full">
      <div className="h-fit w-full min-w-[200px] max-w-[350px] px-5 py-5 flex flex-col justify-center items-center bg-white rounded-xl relative  border-1-inherit shadow-lg m-1">
        <h1 className="font-bold mb-[20px] text-xl text-blue-600">Chat App</h1>
        <h2 className="font-bold mb-[20px] text-xl">Sign In</h2>
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
                setName(e.target.value), setSignInError('');
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
                  setPassword(e.target.value), setSignInError('');
                }}
                required
              />
              <button
                type="button"
                onClick={handleShowPassword}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '-21px',
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="">
            {signInError && (
              <p className="text-xs text-red-500 before:content-['*'] before:text-red-500">
                {signInError}
              </p>
            )}
          </div>
          <div className="w-full text-sm flex justify-between items-center mt-[5px]">
            <div className="flex items-center">
              <input type="checkbox" />
              <span className="ml-[5px]">Remember me</span>
            </div>
            <a href="#" className="text-blue-500">
              Forgot password?
            </a>
          </div>
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
