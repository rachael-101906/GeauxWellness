import React, { useEffect, useState } from "react";
import { db } from "../../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import ChartComponent from "./chart";

export default function Insights() {
  const { user } = useAuth();
  const userId = user?.uid;
  const [error, setError] = useState(null);
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

        let timestamp = null;
        if (d.createdAt?.toMillis) {
          timestamp = d.createdAt.toMillis();
        } else if (d.createdAt?._seconds) {
          timestamp = d.createdAt._seconds * 1000;
        } else {
          return;
        }

        if (timestamp >= weekAgo) {
          all.push(d);
          if (d.userId === userId) mine.push(d);
        }
      });

      const userCounts = {};
      mine.forEach((e) => {
        userCounts[e.mood] = (userCounts[e.mood] || 0) + 1;
      });

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
  if (error) {
    return (
      <section className="Welcome">
        <h2>Insights</h2>
        <p style={{ color: "red" }}>Error loading insights: {error}</p>
      </section>
    );
  }

  return (
    <section className="insights">
      <h2>Insights</h2>

      {/* WEEKLY MOOD SUMMARY */}
      <div style={{ ...card, display: "flex", flex: 1, flexDirection: "column" }}>
        <h3>Your Weekly Mood Summary</h3>

        {Object.keys(userStats).length === 0 ? (
          <p>You haven’t logged any moods this week.</p>
        ) : (
          <ChartComponent
            type="bar"
            title="Your Moods This Week"
            labels={Object.keys(userStats)}
            data={Object.values(userStats)}
          />
        )}
      </div>

      {/* CAMPUS MOOD TRENDS */}
      <div style={{ ...card, display: "flex", flexDirection: "column" }}>
        <h3>Campus Mood Trends</h3>

        {Object.keys(communityStats).length === 0 ? (
          <p>No campus mood data yet.</p>
        ) : (
          <ChartComponent
            type="pie"
            title="Campus Mood Distribution"
            labels={Object.keys(communityStats)}
            data={Object.values(communityStats)}
          />
        )}
      </div>
    </section>
  );
}