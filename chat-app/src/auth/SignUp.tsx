import axios from 'axios';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { setUser } from '../state/reducers/auth';
import { useDispatch } from 'react-redux';
import { FadeLoading } from '../config/ChatLoading';
import { BACKEND_API } from '../config/chatLogics';

type PicStateType = string | undefined;

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [name, setFullname] = useState('');
  const [pic, setPic] = useState<PicStateType>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${BACKEND_API}/api/user/signup`, {
        username,
        name,
        email,
        password,
        confirmPassword,
        pic,
      })
      .then(function (response) {
        dispatch(setUser(response.data));
        navigate('/');
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(false);
        if (error.response) {
          if (error.response.status === 400) {
            setSignUpError(error.response.data.error);
          } else {
            setSignUpError(error.response.data.error);
          }
        } else if (error.request) {
          alert(
            'Cannot reach the server. Please check your internet connection.',
          );
        } else {
          console.error('Error:', error.message);
        }
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataURL = reader.result as string; // Explicitly cast to string
      // Use the dataURL or send it to your server for storage
      setPic(dataURL);
    };
    reader.readAsDataURL(file);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen ">
      <div className="h-full w-full min-w-[200px] max-h-[650px] max-w-[350px] px-5 flex flex-col justify-center items-center bg-white  rounded-xl relative  border-1-inherit shadow-lg">
        <h1 className="font-bold mb-[20px] text-xl text-blue-600">Chat App</h1>
        <h2 className="font-bold mb-[20px] text-xl">Create account</h2>
        <form
          onSubmit={handleSubmit}
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
                setFullname(e.target.value), setSignUpError('');
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
                setUsername(e.target.value), setSignUpError('');
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
                setEmail(e.target.value), setSignUpError('');
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
                  setPassword(e.target.value), setSignUpError('');
                }}
                className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
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
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <div className="w-full">
            {signUpError ? (
              <div className="text-sm mb-2 text-red-500  before:content-['*'] before:mr-0.5 before:text-red-500">
                {signUpError}
              </div>
            ) : (
              <div className="text-sm mb-2">
                <p>Password must have at least 8 character. </p>
                <p>
                  Mix letters, symbols, and numbers to create a strong password.
                </p>
              </div>
            )}
          </div>
          <div className="w-full h-15 flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Confirm Password
            </label>
            <div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                required
                onChange={(e) => {
                  setConfirmPassword(e.target.value), setSignUpError('');
                }}
                className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
              />
              <button
                type="button"
                onClick={handleShowConfirmPassword}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '-21px',
                }}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <div className="w-full h-15 flex flex-col">
            <label htmlFor="file-input" className="">
              Profile image
            </label>
            <input
              id="file-input"
              className="w-full  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="w-full flex justify-start text-sm mt-[5px]">
            <input type="checkbox" className="mr-[5px] " required />
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
