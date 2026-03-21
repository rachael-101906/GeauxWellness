import { TextField } from '@mui/material'
import MoodBlockBody from './MoodBlock'
import QuizCard from './QuizCard'

export default function HomePage() {
  return (
    <>
      <div className="homePage">
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

      <MoodBlockBody />
      <div className="quizSection">
        <QuizCard />
      </div>
      
    </>
  )
}
