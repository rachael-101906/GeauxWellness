import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Profile from './NavBar/Profile'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import Login from './auth/login'
import Register from './auth/register'
import Insights from './NavBar/insights/insights'
import Logout from './auth/logout'
import { useAuth } from './context/authContext'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="appContainer">Loading...</div>
  }

  return (
    <div className="appContainer">
      <Navbar />

      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/insights" element={user ? <Insights /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/logout" element={user ? <Logout /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;
