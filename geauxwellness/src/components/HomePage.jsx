import { TextField } from '@mui/material'
import MoodBlockBody from './MoodBlock'
import QuizCard from './QuizCard'
import MoodHeatmap from './moodmap'

export default function HomePage() {
  return (
    <>
      <div className="homePage">
        <div className="Welcome">
          <h2 className="WelcomeBox"><strong>Welcome to GeauxWellness</strong></h2>
          <p>Your journey to better health starts here.</p>
          <TextField id="outlined-basic" variant="outlined" fullWidth label="Search" />
          <button style={{ backgroundColor: '#9F84BD', color: '#ffffff' }}>Check Location</button>
        </div>
        <div className="map">
          <MoodHeatmap />
        </div>
      </div>
      <MoodBlockBody />
      <div className="quizMissionRow">
        <div className="quizSection"><QuizCard /></div>
        <div className="missionstatement">
          <h2 className="missionheader">Our Mission</h2>
          <p className="missionbody">Geaux Wellness' mission is to empower students...</p>
        </div>
      </div>
      <footer className="footer">
        <div className="footerContent">
          <h1>GeauxWellness</h1>
          <p>© 2026 GeauxWellness. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}