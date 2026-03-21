import React, { useState } from "react";
import { addDoc, collection, serverTimestamp, GeoPoint } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../context/authContext";
import { images } from "../constants/images";

const MOODS = [
  { label: "Happy", image: images.happyEmoji, score: 5 },
  { label: "Anxious", image: images.anxiousEmoji, score: 2 },
  { label: "Sad", image: images.sadEmoji, score: 1 },
  { label: "Angry", image: images.angryEmoji, score: 1 },
  { label: "Hungry", image: images.hungryEmoji, score: 3 },
  { label: "Flirty", image: images.flirtyEmoji, score: 4 },
];

const STEPS = ["Mood", "Journal", "Location", "Done"];

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [journal, setJournal] = useState("");
  const [charCount, setCharCount] = useState(0);
  const { user } = useAuth();

  const progress = (step / (STEPS.length - 1)) * 100;

  const handleMoodSelect = (moodObj) => {
    setMood(moodObj);
    setTimeout(() => setStep(1), 300);
  };

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    if (!journal.trim()) return;
    setStep(2);
  };

  const handleJournalChange = (e) => {
    if (e.target.value.length <= 300) {
      setJournal(e.target.value);
      setCharCount(e.target.value.length);
    }
  };

  const handleLocationChoice = (choice) => {
    if (choice === "yes" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => saveResponse({ mood, journal, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
        () => saveResponse({ mood, journal, location: null })
      );
    } else {
      saveResponse({ mood, journal, location: null });
    }
    setStep(3);
  };

  const saveResponse = async (data) => {
    try {
      await addDoc(collection(db, "moods"), {
        userId: user?.uid ?? "anonymous",
        mood: data.mood.label.toLowerCase(),
        moodScore: data.mood.score,
        journal: data.journal,
        location: data.location ? new GeoPoint(data.location.lat, data.location.lng) : null,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving response:", error);
    }
  };

  const showMentalHealthLink = mood?.label === "Sad" || mood?.label === "Angry" || mood?.label === "Anxious";

  return (
    <>
      <div className="quiz-wrapper">
        <div className="quiz-card">
          {/* Header */}
          <div className="quiz-header">
            <span className="quiz-title">MoodMap</span>
            <span className="step-badge">{STEPS[step]} · {step + 1}/{STEPS.length}</span>
          </div>

          {/* Progress */}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Step 0 — Mood */}
          {step === 0 && (
            <div className="step-content">
              <p className="section-label">Check in</p>
              <h2 className="main-heading">How are you feeling <span>today?</span></h2>
              <div className="mood-grid">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    className={`mood-btn ${mood?.label === m.label ? "selected" : ""}`}
                    onClick={() => handleMoodSelect(m)}
                  >
                    <img src={m.image} alt={m.label} style={{ width: 50, height: 50, objectFit: "contain" }} />
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Journal */}
          {step === 1 && (
            <div className="step-content">
              <p className="section-label">Journal Entry</p>
              <h2 className="main-heading">What made you feel <span>{mood?.label}?</span></h2>

              {mood && (
                <div className="selected-mood-chip">
                  <img src={mood.image} alt={mood.label} style={{ width: 40, height: 40, objectFit: "contain" }} />
                  {mood.label}
                </div>
              )}

              <form onSubmit={handleJournalSubmit}>
                <textarea
                  className="journal-textarea"
                  rows={5}
                  placeholder="Write your thoughts here..."
                  value={journal}
                  onChange={handleJournalChange}
                  required
                />
                <div className="journal-footer">
                  <span className="char-count">{charCount}/300</span>
                </div>

                {showMentalHealthLink && (
                  <div className="mental-health-card">
                    <span style={{ fontSize: 20 }}>💜</span>
                    <p>
                      You're not alone.{" "}
                      <a href="https://www.lsu.edu/shc/mental-health/index.php" target="_blank" rel="noopener noreferrer">
                        LSU Mental Health Resources →
                      </a>
                    </p>
                  </div>
                )}

                <button type="submit" className="btn-primary">
                  Continue →
                </button>
              </form>
            </div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <div className="step-content">
              <p className="section-label">Location</p>
              <h2 className="main-heading">Share your <span>location?</span></h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                This helps us build a mood hotspot map around the LSU area. Your data stays anonymous.
              </p>
              <div className="location-options">
                <button className="btn-location btn-location-yes" onClick={() => handleLocationChoice("yes")}>
                  <span className="location-icon">📍</span>
                  Yes, share
                </button>
                <button className="btn-location btn-location-no" onClick={() => handleLocationChoice("no")}>
                  <span className="location-icon">🚫</span>
                  No thanks
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <div className="step-content" style={{ textAlign: "center", padding: "20px 0" }}>
              <span className="done-icon">💜</span>
              <h2 className="done-heading">Thank you for sharing</h2>
              <p className="done-sub">
                Your response has been recorded and added to the LSU mood map.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}