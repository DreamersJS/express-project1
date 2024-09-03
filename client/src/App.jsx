import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import './App.css';
import { Authenticated } from './components/Authenticated.jsx';
import { NavBar } from './components/NavBar.jsx';
import Feedback from './components/Feedback.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const Form = lazy(() => import('./components/Form.jsx'));
const Register = lazy(() => import('./components/Register.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const UpdateUser = lazy(() => import('./components/UpdateUser.jsx'));

function App() {
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const showFeedback = (message, type) => {
    if (typeof message !== 'string') {
      console.error('showFeedback: Expected a string for message prop');
    }
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  return (
    <BrowserRouter>
      <NavBar showFeedback={showFeedback} />
      <Feedback message={feedback?.message} type={feedback?.type} />
      <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary>
        <Routes>
          <Route path="/register" element={<Register showFeedback={showFeedback} />} />
          <Route path="/login" element={<Login showFeedback={showFeedback}/>} />
          {/* Protected routes */}
          <Route
          path="/chat"
          element={
            <Authenticated>
              <Form showFeedback={showFeedback}/>
            </Authenticated>
          }
        />
        <Route
          path="/update/:id"
          element={
            <Authenticated>
              <UpdateUser showFeedback={showFeedback}/>
            </Authenticated>
          }
        />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
