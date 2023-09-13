import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Chats from './Chat';
import SignUp from './auth/SignUp';
import SignIn from './auth/SignIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chat" element={<Chats />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function NotFound() {
  return <Navigate to="/" replace />;
}

export default App;
