import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import Login from './auth/login'
import Register from './auth/register'
import Tracker from './NavBar/tracker'
import Insights from './NavBar/insights'
import Logout from './auth/logout'
import { useAuth } from './context/authContext'

function Profile() {
  return (
    <section className="Welcome">
      <h2>Profile</h2>
      <p>Your profile page is ready for customization.</p>
    </section>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <div className="appContainer">
      <Navbar />

      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/tracker" element={user ? <Tracker /> : <Navigate to="/login" replace />} />
        <Route path="/insights" element={user ? <Insights /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/logout" element={user ? <Logout /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;