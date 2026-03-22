import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import tigerstadium from "/public/tigerstadium.jpg";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [entries, setEntries] = useState([]);
  const [moods, setMoods] = useState([]);

  const [newEntry, setNewEntry] = useState("");
  const [newMood, setNewMood] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);

      // Get profile info
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data());
      }
      // Get journal entries
      const entrySnap = await getDocs(
        collection(db, "users", currentUser.uid, "journalEntries")
      );
      setEntries(entrySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Get moods
      const moodSnap = await getDocs(
        collection(db, "users", currentUser.uid, "moods")
      );
      setMoods(moodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  // Add journal entry (no reload)
  const addEntry = async () => {
    if (!newEntry) return;

    const docRef = await addDoc(
      collection(db, "users", user.uid, "journalEntries"),
      {
        text: newEntry,
        createdAt: new Date(),
      }
    );

    setEntries([...entries, { id: docRef.id, text: newEntry }]);
    setNewEntry("");
  };

  // Add mood (no reload)
  const addMood = async () => {
    if (!newMood) return;

    const docRef = await addDoc(
      collection(db, "users", user.uid, "moods"),
      {
        mood: newMood,
        createdAt: new Date(),
      }
    );

    setMoods([...moods, { id: docRef.id, mood: newMood }]);
    setNewMood("");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.pageStyle}>
      <div style={styles.contentStyle}>
        <h1 style={{ fontFamily: "Barbaro", color: "White", textShadow: "2px 2px 4px black" }}>Profile</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          <div style={styles.card}>
            {/* USER INFO */}
            <h2>{profile.firstName ? profile.firstName : "First Name"} {profile.lastName ? profile.lastName : "Last Name"}</h2>
            <p>{profile.email ? profile.email : "Email"}</p>
          </div>
      {/* JOURNAL HISTORY */}
      <div style={styles.card}>
        <h3>Previous Entries</h3>
        {entries.map((e) => (
          <p key={e.id}>{e.text}</p>
        ))}
      </div>


      {/* MOOD HISTORY */}
      <div style={styles.card}>
        <h3>Previous Moods</h3>
        {moods.map((m) => (
          <p key={m.id}>{m.mood}</p>
        ))}
      </div>
    </div>
  </div>
<footer className="footer">
  <div className="footerContent">
    <h1>GeauxWellness</h1>
    <p>© 2026 GeauxWellness. All rights reserved.</p>
  </div>
</footer> 
</div>
  );
}

const styles = {
  pageStyle: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `url(${tigerstadium})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: "80px",
    paddingLeft: "60px",
    boxSizing: "border-box",
    paddingBottom: "80px",
  },
  contentStyle: {
    width: "min(450px, 95%)",
    minHeight: "400px",
    margin: "right:55px",
    marginBottom: "20px",
    backgroundColor: "#9F84BD",
    borderRadius: "30px",
    padding: "0px 20px 20px 20px",
    boxSizing: "border-box",
    border: "3px solid black",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  card: {
    border: "3px solid black",
    color: "black",
    margin: "20px 0px",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    backgroundColor: "#F5F5F5",
  },
  footer: {
    background: "#9F84BD",
    color: "white",
    textAlign: "center",
    width: "100%",
    marginBottom: "0",
  },
  footerContent: {
    background: "#9F84BD",

  },
}