import './App.css'
import { TextField } from "@mui/material";
import Navbar from './components/Navbar'

function App() {

  return (
    <div className="appContainer">
      <Navbar />

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
    </div>
  );
}

export default App;