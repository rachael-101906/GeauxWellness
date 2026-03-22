import { addDoc, collection, onSnapshot, query, where, serverTimestamp, GeoPoint, doc, setDoc } from "firebase/firestore";
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

    let topLevelMoods = [];
    let nestedMoods = [];
    let journalEntries = [];

    const toMillis = (value) => {
      if (!value) return 0;
      if (typeof value?.toMillis === "function") return value.toMillis();
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    const publishMerged = () => {
      const normalizedTopLevel = topLevelMoods.map((item) => ({
        id: `top-${item.id}`,
        mood: item.mood || "unknown",
        journal: item.journal || "",
        createdAt: item.createdAt || null,
      }));

      const normalizedNestedMoods = nestedMoods.map((item) => ({
        id: `nested-mood-${item.id}`,
        mood: item.mood || "unknown",
        journal: item.journal || "",
        createdAt: item.createdAt || null,
      }));

      const normalizedJournals = journalEntries.map((item) => ({
        id: `journal-${item.id}`,
        mood: item.mood || "journal",
        journal: item.text || item.journal || "",
        createdAt: item.createdAt || null,
      }));

      const merged = [
        ...normalizedTopLevel,
        ...normalizedNestedMoods,
        ...normalizedJournals,
      ].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

      setMoods(merged);
      setLoading(false);
    };

    const topLevelQuery = query(collection(db, "moods"), where("userId", "==", userId));
    const unsubscribeTopLevel = onSnapshot(
      topLevelQuery,
      (snapshot) => {
        topLevelMoods = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched top-level moods:", topLevelMoods);
        publishMerged();
      },
      (err) => {
        console.error("Error fetching top-level moods:", err);
        setError(err);
        setLoading(false);
      }
    );

    const unsubscribeNestedMoods = onSnapshot(
      collection(db, "users", userId, "moods"),
      (snapshot) => {
        nestedMoods = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched nested moods:", nestedMoods);
        publishMerged();
      },
      (err) => {
        console.error("Error fetching nested moods:", err);
        setError(err);
        setLoading(false);
      }
    );

    const unsubscribeJournalEntries = onSnapshot(
      collection(db, "users", userId, "journalEntries"),
      (snapshot) => {
        journalEntries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched journal entries:", journalEntries);
        publishMerged();
      },
      (err) => {
        console.error("Error fetching journal entries:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeTopLevel();
      unsubscribeNestedMoods();
      unsubscribeJournalEntries();
    };
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

export function useProfile(userOrId) {
  const userId = typeof userOrId === "string" ? userOrId : userOrId?.uid;
  const fallbackFirstName =
    typeof userOrId === "object" && userOrId?.displayName ? userOrId.displayName : "";
  const fallbackEmail =
    typeof userOrId === "object" && userOrId?.email ? userOrId.email : "";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", userId),
      async (profileDoc) => {
        if (profileDoc.exists()) {
          setProfile({id: profileDoc.id, ...profileDoc.data()});
          console.log("Fetched profile:", profileDoc.data());
        } else {
          console.log("No profile found for user. Creating one:", userId);
          const newProfile = {
            firstName: fallbackFirstName || "",
            lastName: "",
            email: fallbackEmail || "",
            memberSince: serverTimestamp(),
          };
          await setDoc(doc(db, "users", userId), newProfile, { merge: true });
          setProfile({ id: userId, ...newProfile });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { profile, loading };
}