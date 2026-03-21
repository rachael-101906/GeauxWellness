import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  LinearProgress,
  Link,
} from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../context/authContext";

const MOODS = ["Happy", "Anxious", "Sad", "Angry", "Hungry", "Flirty"];

const STEPS = ["Mood", "Journal", "Location", "Done"];

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState("");
  const [journal, setJournal] = useState("");
  const { db } = useAuth(); 

  const progress = (step / (STEPS.length - 1)) * 100;

  const handleMoodSelect = (option) => {
    setMood(option);
    setStep(1);
  };

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    if (!journal.trim()) return;
    setStep(2);
  };

  const handleLocationChoice = (choice) => {
    if (choice === "yes" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          saveResponse({
            mood,
            journal,
            location: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          });
        },
        () => saveResponse({ mood, journal, location: "denied" })
      );
    } else {
      saveResponse({ mood, journal, location: "not shared" });
    }
    setStep(3);
  };

  const saveResponse = async (data) => {
    try {
        await addDoc(collection(db, "responses"), {
          ...data,
          createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error saving response:", error);
    }
    console.log("Saving:", data);
  };

  const showMentalHealthLink =
    mood === "Sad" || mood === "Angry" || mood === "Anxious";

  return (
    <Box maxWidth={400} mx="auto" mt={8} px={2}>

      {/* Progress bar */}
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />

      {/* Step 0 - Mood Selection */}
      {step === 0 && (
        <Box textAlign="center">
          <Typography variant="h5" mb={3}>
            How are you feeling today?
          </Typography>
          {MOODS.map((opt) => (
            <Button
              key={opt}
              variant="outlined"
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => handleMoodSelect(opt)}
            >
              {opt}
            </Button>
          ))}
        </Box>
      )}

      {/* Step 1 - Journal */}
      {step === 1 && (
        <Box textAlign="center">
          <Typography variant="h5" mb={3}>
            What made you feel <strong>{mood}</strong> today?
          </Typography>
          <form onSubmit={handleJournalSubmit}>
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="Write your thoughts here..."
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Next
            </Button>
          </form>

          {showMentalHealthLink && (
            <Typography mt={3}>
              You're not alone.{" "}
              <Link
                href="https://www.lsu.edu/shc/mental-health/index.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                LSU Mental Health Resources
              </Link>
            </Typography>
          )}
        </Box>
      )}

      {/* Step 2 - Location */}
      {step === 2 && (
        <Box textAlign="center">
          <Typography variant="h5" mb={1}>
            Share your location?
          </Typography>
          <Typography color="text.secondary" mb={3}>
            This helps us gather data for our map.
          </Typography>
          <Button
            variant="contained"
            sx={{ mr: 2 }}
            onClick={() => handleLocationChoice("yes")}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleLocationChoice("no")}
          >
            No
          </Button>
        </Box>
      )}

      {/* Step 3 - Done */}
      {step === 3 && (
        <Box textAlign="center">
          <Typography variant="h5">Thank you for sharing 💙</Typography>
          <Typography color="text.secondary" mt={1}>
            Your response has been recorded.
          </Typography>
        </Box>
      )}
    </Box>
  );
}