// import Image from 'next/image';
//import Link from 'next/link';
//import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type PicStateType = string | undefined;

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [name, setFullname] = useState('');
  const [pic, setPic] = useState<PicStateType>(undefined);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post('http://localhost:5000/api/user/signup', {
        username,
        name,
        email,
        password,
        pic,
      })
      .then(function (response) {
        console.log(response.data);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
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

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const passwordValue = event.target.value;

    let passwordStrength = 0;

    if (passwordValue.match(/[a-z]/)) {
      passwordStrength += 1;
    }

    if (passwordValue.match(/[A-Z]/)) {
      passwordStrength += 1;
    }

    if (passwordValue.match(/[0-9]/)) {
      passwordStrength += 1;
    }

    if (passwordValue.match(/[!@#$%^&*()_+|~=-]/)) {
      passwordStrength += 1;
    }

    if (passwordValue.length >= 8) {
      passwordStrength += 1;
    }

    if (passwordStrength === 0) {
      setPasswordMessage('');
    } else if (passwordStrength === 1) {
      setPasswordMessage('Password is weak');
    } else if (passwordStrength === 2) {
      setPasswordMessage('Password is moderate');
    } else if (passwordStrength === 3) {
      setPasswordMessage('Password is strong');
    } else if (passwordStrength === 4) {
      setPasswordMessage('Password is very strong');
    }

    setPassword(passwordValue);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen ">
      <div className="flex flex-col justify-center items-center bg-white h-[650px] w-[350px] rounded-xl relative  border-1-inherit shadow-lg">
        <h1 className="font-bold mb-[20px] text-xl text-blue-600">Chat App</h1>
        <h2 className="font-bold mb-[20px] text-xl">Create account</h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center mb-[10px]"
        >
          <div className="h-15 flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setFullname(e.target.value)}
              className="w-[300px]  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="h-15 flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              User Name
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-[300px]  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-[300px]  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Password
            </label>
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                required
                onChange={handlePasswordChange}
                className="w-[300px]  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
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
            <p
              className={`w-full text-sm flex justify-center  ${
                passwordMessage === 'Password is weak' ||
                passwordMessage === 'Password is moderate' ||
                passwordMessage === 'Password is very moderate'
                  ? 'text-red-500'
                  : 'text-black'
              }`}
            >
              {passwordMessage}
            </p>
          </div>
          <div className="h-15 flex flex-col">
            <label className="">Profile image</label>
            <input
              className="w-[300px]  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
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
            className="w-[300px] p-[5px] mt-[20px] bg-gray-200 rounded-md border-1-inherit shadow-md active:shadow-inner "
          >
            {loading ? 'Loading...' : 'Create account'}
          </button>
        </form>
        {message && (
          <div className="text-sm text-red-500  before:content-['*'] before:mr-0.5 before:text-red-500">
            {message}
          </div>
        )}
        <div className="text-sm mt-[5px]">
          <span className="mr-[5px]">Already have an account?</span>
          <span>
            <Link to="/" className="text-blue-500">
              Sign in instead.
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
