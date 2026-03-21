import { TextField } from '@mui/material'
import MoodBlockBody from './MoodBlock'
import QuizCard from './QuizCard'

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
          <button style={{ backgroundColor: '#9F84BD', color: '#ffffff' }}>Enter your location</button>
        </div>
        <div className="map">
          <iframe className="mapframe"
            title="GeauxWellness Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086441644419!2d-122.4194150846818!3d37.77492977975995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c5b5b5b5%3A0x123456789abcdef0!2sGeauxWellness%20HQ!5e0!3m2!1sen!2sus!4v1710000000000"
            
          ></iframe>
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
