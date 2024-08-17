import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Form } from './components/Form.jsx';
import { Register } from './components/Register.jsx';
import { Login } from './components/Login.jsx';
import { Authenticated }  from './components/Authenticated.jsx'; 
import { NavBar } from './components/NavBar.jsx';
import Test from './components/Test.jsx';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      {/* <Test /> */}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <Authenticated>
              <Form />
            </Authenticated>
          } 
        />
        <Route 
          path="/form" 
          element={
            <Authenticated>
              <Form />
            </Authenticated>
          } 
        />
        {/* Handle undefined routes */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;