import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "./firebase";

export default function useMoods(userId) {
  const [moods, setMoods] = useState([]);
  const [error, setError] = useState(null);
  const [resolvedUserId, setResolvedUserId] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const moodsCollection = collection(db, "moods");

    const unsubscribe = onSnapshot(
      query(moodsCollection, where("userId", "==", userId)),
      (snapshot) => {
        const moodsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMoods(moodsData);
        setError(null);
        setResolvedUserId(userId);
      },
      (err) => {
        console.error("Error fetching moods:", err);
        setError(err);
        setResolvedUserId(userId);
      }
    );

    return () => unsubscribe();
  }, [userId]);


  const loading = !!userId && resolvedUserId !== userId;

  return {
    moods: userId && resolvedUserId === userId ? moods : [],
    loading,
    error: userId ? error : null,
  };
}

export async function addMood({ moodData, userId }) {
  const moods = collection(db, "moods");

  try {
    const docRef = await addDoc(moods, {
      userId,
      ...moodData,
      note: moodData.note || "",
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding mood:", error);
    throw error;
  }
}