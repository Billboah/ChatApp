//import { useRouter } from 'next/router'
import React, { useState } from 'react';
//import { useSession, signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
//import img from 'next/img'

export default function SignIn() {
  //const { data: session, status } = useSession();
  //const { push, asPath } = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    // e.preventDefault();
    // const result = await signIn('credentials', {
    //   redirect: false,
    //   login,
    //   password,
    //   callbackUrl: asPath,
    // });
    // if (result.error) {
    //   setLoading(false);
    //   setError(result.error);
    // } else {
    //   setLoading(true);
    // }
  };

  const handleOAuthSignIn = () => {
    //() => signIn(provider);
    // if (session) {
    //   push('/');
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
              Username
            </label>
            <input
              type="text"
              required
              onChange={(e) => setLogin(e.target.value)}
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
          <Link to="signup" className="text-blue-500">
            Create an account
          </Link>
        </div>
        <div className="text-sm border-1 relative w-[300px] m-5">
          <div className="border border-gray-200 "></div>
          <div className="absolute top-[-10px] left-[45%] bg-white w-fit px-2 z-10">
            OR
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <button
            onClick={handleOAuthSignIn}
            className="flex justify-center items-center w-[300px] bg-gray-200 m-[5px] py-[7px] rounded-md border-1-inherit shadow-md active:shadow-inner"
          >
            <span>
              <FcGoogle />
            </span>
            <span className="ml-[10px]">Sign in with google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
