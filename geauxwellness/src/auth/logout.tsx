import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
  const { logout } = useAuth() as { logout: () => Promise<void> }
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
    <div className="background" >
    <section className="loginSection">
      <div className="loginCard">
          <h2>Logout</h2>
          <button type="submit" onClick={handleLogout} className="loginCard">
            Log Out
          </button>
          </div>
          </section>
          </div>
        </>
  )
}