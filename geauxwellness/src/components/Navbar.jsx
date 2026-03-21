import logo from '../assets/GeauxWellness.png'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { auth } from '../../services/firebase'


export default function Navbar() {
  const { user, loading } = useAuth()
  const isAuthenticated = Boolean(user || auth.currentUser)

  return (
    <nav className="navbar" aria-label="Main navigation">
      <img src={logo} alt="GeauxWellness logo" className="navbarLogo" />
      <div className="navigation">
        <Link to="/tracker">Tracker</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/profile">Profile</Link>
        {!loading && isAuthenticated ? (
          <Link to="/logout">Logout</Link>
        ) : (
          <Link to="/login">Login/Sign-Up</Link>
        )}
      </div>
    </nav>
  )
}
