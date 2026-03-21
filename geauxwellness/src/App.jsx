import './App.css'
import { TextField } from "@mui/material";
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/login'
import Register from './components/register'
import Tracker from './components/tracker'
import Insights from './components/insights'
import Logout from './components/logout'
import { useAuth } from './context/authContext'

function Profile() {
  return (
    <section className="Welcome">
      <h2>Profile</h2>
      <p>Your profile page is ready for customization.</p>
    </section>
  )
}

function HomePage() {
  return (
    <>
      <div>
        <div className="Welcome">
          <h2>Welcome to GeauxWellness</h2>
          <p>Your journey to better health starts here.</p>

          <TextField
            id="outlined-basic"
            variant="outlined"
            fullWidth
            label="Search"
          />
          <button>Search</button>
        </div>
      </div>

      <div className="MoodBlockBody">
        <div className="MoodBlock">
          <div className="Happy">
            <h3>Happy</h3>
            <p>Feeling great! Keep up the good work.</p>
          </div>

          <div className="Hungry">
            <h3>Hungry</h3>
            <p>Feeling hungry. Remember to eat regularly and stay hydrated.</p>
          </div>

          <div className="Flirty">
            <h3>Flirty</h3>
            <p>Feeling flirty. Embrace the moment and have fun!</p>
          </div>

          <div className="Angry">
            <h3>Angry</h3>
            <p>Feeling frustrated. Take a deep breath and try again.</p>
          </div>

          <div className="Anxious">
            <h3>Anxious</h3>
            <p>Feeling anxious. Take a deep breath and try again.</p>
          </div>

          <div className="Sad">
            <h3>Sad</h3>
            <p>Remember tough times don't last, tough people do.</p>
          </div>
        </div>
      </div>
    </>
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