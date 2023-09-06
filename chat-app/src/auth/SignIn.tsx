import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../state/reducers/auth';

export default function SignIn() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    axios
      .post('http://localhost:5000/api/user/signin', {
        name,
        password,
      })
      .then(function (response) {
        dispatch(setUser(response.data));
        navigate('/');
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <div className="flex flex-col justify-center items-center bg-white h-[500px] w-[350px] rounded-xl relative  border-1-inherit shadow-lg">
        <h1 className="font-bold mb-[20px] text-xl text-blue-600">Chat App</h1>
        <h2 className="font-bold mb-[20px] text-xl">Sign In</h2>
        <form
          action=""
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center mb-[10px]"
        >
          <div className="flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              User Name or Email
            </label>
            <input
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              className="w-[300px] px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Password
            </label>
            <input
              className="w-[300px]  px-[10px] py-[5px] rounded border border-gray-400  bg-gray-100 outline-none"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
            className="w-[300px] p-[5px] mt-[20px] bg-gray-200 rounded-md border-1-inherit shadow-md active:shadow-inner"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-500 before:content-['*'] before:text-red-500">
            {error}
          </p>
        )}
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
