import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    // Replace with API/auth logic when backend is ready.
    console.log('Email:', email)
    console.log('Password:', password)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'grid',
          gap: '12px',
          padding: '24px',
          border: '1px solid #d1d5db',
          borderRadius: '12px',
          background: '#ffffff',
        }}
      >
        <h2 style={{ margin: 0 }}>Login</h2>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />

        <button
          type="submit"
          style={{
            marginTop: '8px',
            padding: '10px 12px',
            border: 0,
            borderRadius: '8px',
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </form>
    </main>
  )
}