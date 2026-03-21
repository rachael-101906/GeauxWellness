import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()

  const getFriendlyLoginError = (error) => {
    switch (error?.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.'
      default:
        return error?.message || 'Login failed. Please try again.'
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
      console.log('Login successful')
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage(getFriendlyLoginError(error))
    }
  }
 

  return (
    <form onSubmit={handleSubmit} className="loginCard">
      <h2>Login</h2>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
        required
      />

      <button type="submit">Sign In</button>
      {errorMessage ? <p className="authError">{errorMessage}</p> : null}
      <Link to="/register">
        Don't have an account? Sign Up
      </Link>
    </form>
  )
}