import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function Insights() {
  const [userStats, setUserStats] = useState({});
  const [communityStats, setCommunityStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Pull userId from local storage (must match what you write into Firestore)
  const userId = localStorage.getItem("moodmapUser");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadInsights() {
    setLoading(true);

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const moodsRef = collection(db, "moods");
    const snapshot = await getDocs(moodsRef);

    let allEntries = [];
    let userEntries = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const time = data.createdAt?.toMillis?.() || 0;

      // Only include past 7 days
      if (time >= weekAgo) {
        allEntries.push(data);

        // User-specific entries
        if (data.userId === userId) {
          userEntries.push(data);
        }
      }
    });

    /* ---- PERSONAL WEEKLY MOOD COUNTS ---- */
    const userMoodCounts = {};
    userEntries.forEach((entry) => {
      userMoodCounts[entry.mood] = (userMoodCounts[entry.mood] || 0) + 1;
    });

    /* ---- COMMUNITY MOOD PERCENTAGES ---- */
    const communityCounts = {};
    allEntries.forEach((entry) => {
      communityCounts[entry.mood] = (communityCounts[entry.mood] || 0) + 1;
    });

    const totalCommunity = allEntries.length;
    const communityPerc = {};
    if (totalCommunity > 0) {
      Object.keys(communityCounts).forEach((mood) => {
        communityPerc[mood] = ((communityCounts[mood] / totalCommunity) * 100).toFixed(1);
      });
    }

    setUserStats(userMoodCounts);
    setCommunityStats(communityPerc);
    setLoading(false);
  }

  if (loading) {
    return (
      <section className="Welcome">
        <h2>Insights</h2>
        <p>Loading your data…</p>
      </section>
    );
  }

  return (
    <section className="Welcome">
      <h2>Insights</h2>

      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 }}>
        <h3>Your Weekly Mood Summary</h3>

        {Object.keys(userStats).length === 0 ? (
          <p>You haven’t logged any moods this week.</p>
        ) : (
          Object.entries(userStats).map(([mood, count]) => (
            <p key={mood}>
              You were <strong>{mood}</strong> {count} time{count > 1 ? "s" : ""} this week.
            </p>
          ))
        )}
      </div>

      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Campus Mood Trends</h3>
        {Object.keys(communityStats).length === 0 ? (
          <p>No community mood data for the past week.</p>
        ) : (
          Object.entries(communityStats).map(([mood, perc]) => (
            <p key={mood}>
              <strong>{mood}</strong>: {perc}% of entries
            </p>
          ))
        )}
      </div>
    </section>
  );
}