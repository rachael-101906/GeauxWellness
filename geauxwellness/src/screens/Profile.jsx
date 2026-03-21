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
    <div style={styles.container}>
      <h1>Profile</h1>

      {/* USER INFO */}
      <div style={styles.card}>
        <h2>{profile.firstName} {profile.lastName}</h2>
        <p>{profile.email}</p>
      </div>

      {/* ADD JOURNAL */}
      <div style={styles.card}>
        <h3>Add Journal Entry</h3>
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
        />
        <button onClick={addEntry}>Save Entry</button>
      </div>

      {/* JOURNAL HISTORY */}
      <div style={styles.card}>
        <h3>Previous Entries</h3>
        {entries.map((e) => (
          <p key={e.id}>{e.text}</p>
        ))}
      </div>

      {/* ADD MOOD */}
      <div style={styles.card}>
        <h3>Record Mood</h3>
        <input
          value={newMood}
          onChange={(e) => setNewMood(e.target.value)}
          placeholder="Happy, Sad, etc."
        />
        <button onClick={addMood}>Save Mood</button>
      </div>

      {/* MOOD HISTORY */}
      <div style={styles.card}>
        <h3>Previous Moods</h3>
        {moods.map((m) => (
          <p key={m.id}>{m.mood}</p>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
  },
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "8px",
  },
};