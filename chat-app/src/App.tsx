import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chats from './Chat';
import SignUp from './auth/SignUp';
import SignIn from './auth/SignIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Chats />} />
      </Routes>
    </Router>
  );
}

export default App;
