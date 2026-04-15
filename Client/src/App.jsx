import useAuth from './context/authContext'
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import {BrowserRouter, Navigate, Route,Routes } from 'react-router';
import Dashboard from './pages/Dashboard';
import VerifyOtp from './pages/VerifyOtp';
import FriendsPage from "./pages/Friends"
import './App.css';

const App = () => {
  const {isLoggedIn} = useAuth();
  
  return (
    <Routes>
      <Route
      path="/signup"
      element={!isLoggedIn ?<Signup/>:<Navigate to ="/dashboard"/>}
      />
      <Route
      path="/dashboard"
      element={isLoggedIn ? <Dashboard/> :<Navigate to="/signin"/>}
      />
      <Route
      path="/signin"
      element={!isLoggedIn ? <Signin/> :<Navigate to ="/dashboard"/>}
      />
      <Route
      path="/verify-otp"
      element={!isLoggedIn ? <VerifyOtp/> :<Navigate to="/dashboard"/>}
      />
      <Route
      path="/friends"
      element={isLoggedIn ? <FriendsPage/> :<Navigate to="/signin"/>}
      />
      <Route
      path ="*"
      element={<Navigate to="/signup"/>}/>
    </Routes>
  )
}

export default App
