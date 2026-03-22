import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { register } = useAuth()

  const getFriendlyRegisterError = (error) => {
    if (error?.message?.includes('Passwords do not match')) {
      return error.message
    }

    switch (error?.code) {
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try logging in instead.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.'
      default:
        return error?.message || 'Registration failed. Please try again.'
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await register(firstName.trim(), email.trim(), password, confirmPassword)
      setSuccessMessage('Registration successful. Redirecting to home...')
      console.log('Registration successful')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Registration error:', error)
      setErrorMessage(getFriendlyRegisterError(error))
    }
  }

  return (
    <div className="background" > 
    <section className="loginSection">
    <form onSubmit={handleSubmit} className="loginCard">
      <h2>Register</h2>
      <label htmlFor="firstName">First Name</label>
      <input
        id="firstName"
        type="text"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        placeholder="John"
        required
      />
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

      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm your password"
        required
      />

      <button type="submit">Sign Up</button>
      {errorMessage ? <p className="authError">{errorMessage}</p> : null}
      {successMessage ? <p className="authSuccess">{successMessage}</p> : null}
      <Link to="/login">
        Already have an account? Log In
      </Link>
    </form>
    </section>
    </div>
  )
}