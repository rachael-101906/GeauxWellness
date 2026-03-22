import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authContext";

export default function Insights() {
  const { user } = useAuth();
  const userId = user?.uid;

  const [userStats, setUserStats] = useState({});
  const [communityStats, setCommunityStats] = useState({});
  const [loading, setLoading] = useState(true);

  const card = {
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
  };

  useEffect(() => {
    async function loadInsights() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const snap = await getDocs(collection(db, "moods"));

      let all = [];
      let mine = [];

      snap.forEach((doc) => {
        const d = doc.data();

        // ⭐ FIX 1: Unified timestamp reading
        let timestamp = null;
        if (d.createdAt?.toMillis) timestamp = d.createdAt.toMillis();
        else if (d.createdAt?._seconds) timestamp = d.createdAt._seconds * 1000;

        if (!timestamp) return; // skip if timestamp is invalid

        // ⭐ FIX 2: Last 7 days filter
        if (timestamp >= weekAgo) {
          all.push(d);
          if (d.userId === userId) {
            mine.push(d);
          }
        }
      });

      // ⭐ Personal mood stats
      const userCounts = {};
      mine.forEach((e) => {
        userCounts[e.mood] = (userCounts[e.mood] || 0) + 1;
      });

      // ⭐ Campus mood stats
      const communityCounts = {};
      all.forEach((e) => {
        communityCounts[e.mood] = (communityCounts[e.mood] || 0) + 1;
      });

      const total = all.length;
      const communityPerc = {};
      Object.keys(communityCounts).forEach((mood) => {
        communityPerc[mood] = total
          ? ((communityCounts[mood] / total) * 100).toFixed(1)
          : "0.0";
      });

      setUserStats(userCounts);
      setCommunityStats(communityPerc);
      setLoading(false);
    }

    loadInsights();
  }, [userId]);

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

      <div style={card}>
        <h3>Your Weekly Mood Summary</h3>
        {Object.keys(userStats).length === 0 ? (
          <p>You haven’t logged any moods this week.</p>
        ) : (
          Object.entries(userStats).map(([mood, count]) => (
            <p key={mood}>
              You were <strong>{mood}</strong> {count} time
              {count > 1 ? "s" : ""} this week.
            </p>
          ))
        )}
      </div>

      <div style={card}>
        <h3>Campus Mood Trends</h3>
        {Object.keys(communityStats).length === 0 ? (
          <p>No campus mood data yet for this week.</p>
        ) : (
          Object.entries(communityStats).map(([mood, percent]) => (
            <p key={mood}>
              <strong>{mood}</strong>: {percent}%
            </p>
          ))
        )}
      </div>
    </section>
  );
}