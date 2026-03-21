
import logo from '../assets/GeauxWellness.png'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { auth } from '../../services/firebase'


export default function Navbar() {
  const { user, loading } = useAuth()
  const isAuthenticated = Boolean(user || auth.currentUser)

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link to="/">
      <img src={logo} alt="GeauxWellness logo" className="navbarLogo" />
      </Link>
      <div className="navigation">

        <Link to="/tracker" className="navbarText">
          Tracker
        </Link>
        <Link to="/insights" className="navbarText">
          Insights
        </Link>
        <Link to="/Profile" className="navbarText">
          Profile
        </Link>
        {!loading && isAuthenticated ? (
          <Link to="/logout" className="navbarText">Logout</Link>
        ) : (
          <Link to="/login" className="navbarText">
            Login/Sign-Up
          </Link>
        )}
      </div>
    </nav>
  )
}
