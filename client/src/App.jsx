import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import { Form } from './components/Form.jsx';
import { Register } from './components/Register.jsx';
import { Login } from './components/Login.jsx';
import { NavBar } from './components/NavBar.jsx';
// import { Auth } from './components/Auth.jsx';
import { Authenticated } from './components/Authenticated.jsx';
import Feedback from './components/Feedback.jsx';

function App() {
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  return (
    <BrowserRouter>
      <NavBar showFeedback={showFeedback} />
      <Feedback message={feedback.message} type={feedback.type} />
      <Routes>
        <Route path="/register" element={<Register showFeedback={showFeedback} />} />
        <Route path="/login" element={<Login showFeedback={showFeedback}/>} />
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <Authenticated>
              <Form showFeedback={showFeedback}/>
            </Authenticated>
          }
        />
        <Route
          path="/chat"
          element={
            <Authenticated>
              <Form showFeedback={showFeedback}/>
            </Authenticated>
          }
        />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
