import logo from '../assets/GeauxWellness.png'

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <img src={logo} alt="GeauxWellness logo" className="navbarLogo" />
      <div className="navigation">
        <a href="#Tracker">Tracker</a>
        <a href="#Insights">Insights</a>
        <a href="#Profile">Profile</a>
        <a href="#Login/Sign-Up">Login/Sign-Up</a>
      </div>
    </nav>
  )
}
