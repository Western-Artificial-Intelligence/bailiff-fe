import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { loadTrials } from './utils/dataLoader';
import defenseImg from './assets/images/defense.png';
import prosecutionImg from './assets/images/prosecution.png';
import courtroomImg from './assets/images/courtroom.png';

// Placeholder for other roles or default
const AVATARS = {
  defense: defenseImg,
  prosecution: prosecutionImg,
  // judge: ... (no image provided, maybe hide or use a placeholder if needed, but for now we only have 2 images)
};

function App() {
  const [trials, setTrials] = useState([]);
  const [selectedTrialId, setSelectedTrialId] = useState(null);
  const [currentTime, setCurrentTime] = useState(1);

  useEffect(() => {
    loadTrials().then(loadedTrials => {
      setTrials(loadedTrials);
      if (loadedTrials.length > 0) {
        setSelectedTrialId(loadedTrials[0].trial_id);
      }
    });
  }, []);

  const selectedTrial = useMemo(() => {
    return trials.find(t => t.trial_id === selectedTrialId);
  }, [trials, selectedTrialId]);

  const currentStep = useMemo(() => {
    if (!selectedTrial) return null;
    // Find the step whose index matches currentTime (1-based integer)
    const step = selectedTrial.timeline.find(s => s.index === currentTime);
    return step ?? selectedTrial.timeline[0];
  }, [selectedTrial, currentTime]);

  // maxTime = total number of chunks (last index value)
  const maxTime = selectedTrial ? selectedTrial.timeline[selectedTrial.timeline.length - 1].index : 1;

  const handleNext = () => {
    if (!selectedTrial || !currentStep) return;
    const nextIndex = currentStep.index + 1;
    if (nextIndex <= maxTime) {
      setCurrentTime(nextIndex);
    }
  };

  const handleBack = () => {
    if (!selectedTrial || !currentStep) return;
    const prevIndex = currentStep.index - 1;
    setCurrentTime(Math.max(1, prevIndex));
  };

  const handleScrubberChange = (e) => {
    setCurrentTime(parseInt(e.target.value, 10));
  };

  if (!selectedTrial) return <div className="loading">Loading or No Data...</div>;

  // Determine which avatar to show
  // If role is defense, show defense. If prosecution, show prosecution.
  // If judge, maybe show nothing or a generic label?
  // The image shows avatars overlaid on the courtroom.
  const activeRole = currentStep?.role;
  const showDefense = activeRole === 'defense';
  const showProsecution = activeRole === 'prosecution';

  return (
    <div className="App">
      <div className="trial-selector">
        <select
          value={selectedTrialId}
          onChange={(e) => {
            setSelectedTrialId(e.target.value);
            setCurrentTime(1);
          }}
        >
          {trials.map(t => (
            <option key={t.trial_id} value={t.trial_id}>
              {t.trial_id}
            </option>
          ))}
        </select>
      </div>

      <div className="stage" style={{ backgroundImage: `url(${courtroomImg})` }}>
        {showDefense && (
          <img src={defenseImg} alt="Defense" className="avatar defense-avatar speaking" />
        )}
        {showProsecution && (
          <img src={prosecutionImg} alt="Prosecution" className="avatar prosecution-avatar speaking" />
        )}

        {/* If it's a judge or other, maybe we just don't show an avatar but still show text */}

        <div className="dialogue-box">
          <div className="role-label">{activeRole ? activeRole.toUpperCase() : 'UNKNOWN'}</div>
          <div className="dialogue-text">
            {currentStep ? currentStep.text : "..."}
          </div>
        </div>
      </div>

      <div className="controls">
        <button onClick={handleBack}>Back</button>
        <input
          type="range"
          min="1"
          max={maxTime}
          step="1"
          value={currentTime}
          onChange={handleScrubberChange}
          className="scrubber"
        />
        <div className="time-display">{currentTime}/{maxTime}</div>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default App;
