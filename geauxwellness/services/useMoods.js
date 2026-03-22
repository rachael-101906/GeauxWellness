import { addDoc, collection, onSnapshot, query, where, serverTimestamp, GeoPoint } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

export default function useMoods(userId) {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const q = query(collection(db, "moods"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMoods(data);
        console.log("Fetched moods:", data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching moods:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { moods, loading, error };
}

export function useAllMoods(filterMood = "all") {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (filterMood === "all") {
      q = query(collection(db, "moods"), where("location", "!=", null));
    } else {
      q = query(
        collection(db, "moods"),
        where("mood", "==", filterMood),
        where("location", "!=", null)
      );
    }

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMoods(data);
        console.log("Fetched all moods:", data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching all moods:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterMood]);

  return { moods, loading };
}

export async function addMood({ userId, mood, moodScore, journal, location }) {
  try {
    const docRef = await addDoc(collection(db, "moods"), {
      userId,
      mood: mood.toLowerCase(),
      moodScore,
      journal: journal || "",
      location: location ? new GeoPoint(location.lat, location.lng) : null,
      createdAt: serverTimestamp(),
    });
    console.log("Mood added with ID:", docRef.id);
    console.log("Mood details:", { userId, mood, moodScore, journal, location });
    return docRef.id;
  } catch (error) {
    console.error("Error adding mood:", error);
    throw error;
  }
}