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

          <TextField
            id="outlined-basic"
            variant="outlined"
            fullWidth
            label="Search"
          />
          <button style={{ backgroundColor: '#9F84BD', color: '#ffffff' }}>Check Location</button>
        </div>
        <div className="map">
            <MoodHeatmap />
          </div>
      </div>

      <MoodBlockBody />
      <div className="quizMissionRow">
        <div className="quizSection">
          <QuizCard />
        </div>

        <div className="missionstatement">
          <h2 className="missionheader">Our Mission</h2>
          <p className="missionbody">Geaux Wellness’ mission is to empower students with a clearer understanding of their emotional wellbeing and the world around them. By visualizing how moods shift across campus, we help you recognize patterns, build self-awareness, and feel more connected to your community. Every check-in builds a clearer picture of your wellbeing, so you can make choices that increase joy, reduce stress, and feel more connected. Your experiences shape meaningful insights, and NO ONE has to navigate their mental journey alone.</p>
        </div>
      </div>

      <footer className="footer">   
        <div className="footerContent">
          <h1>GeauxWellness</h1>
          <p>© 2026 GeauxWellness. All rights reserved.</p>
          </div>
      </footer>    </>
  )
}
