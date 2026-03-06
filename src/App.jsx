import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { loadTrials } from './utils/dataLoader';
import defenseImg from './assets/images/defense.png';
import prosecutionImg from './assets/images/prosecution.png';
import courtroomImg from './assets/images/courtroom.png';
import judgeImg from './assets/images/judge.png';
import waiLogo from './assets/images/wai.png';

// Helper: convert **text** markdown bold to <strong> elements
const renderBoldText = (text) => {
  if (!text) return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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
  const activeRole = currentStep?.role;
  const showDefense = activeRole === 'defense';
  const showProsecution = activeRole === 'prosecution';
  const showJudge = activeRole === 'judge';

  return (
    <div className="App">
      <div className="trial-selector">
        <img src={waiLogo} alt="WAI Logo" className="wai-logo" />
        <span className="header-title">B.A.I.L.I.F.F. Demonstration</span>
        <span className="cue-label">
          {selectedTrial
            ? `${selectedTrial.cue ? (selectedTrial.cue.charAt(0).toUpperCase() + selectedTrial.cue.slice(1)) : 'Unknown Cue'}: ${selectedTrial.cue_value} (${selectedTrial.cue_condition})`
            : ''}
        </span>
        <div className="custom-select">
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
      </div>

      <div className="stage" style={{ backgroundImage: `url(${courtroomImg})` }}>
        {showDefense && (
          <img src={defenseImg} alt="Defense" className="avatar defense-avatar speaking" />
        )}
        {showProsecution && (
          <img src={prosecutionImg} alt="Prosecution" className="avatar prosecution-avatar speaking" />
        )}
        {showJudge && (
          <img src={judgeImg} alt="Judge" className="avatar judge-avatar speaking" />
        )}

        <div className="dialogue-box">
          <div className="role-label">{activeRole ? activeRole.toUpperCase() : 'UNKNOWN'}</div>
          <div className="dialogue-text">
            {currentStep ? renderBoldText(currentStep.text) : "..."}
          </div>
        </div>
      </div>

      <div className="controls">
        <button onClick={handleBack}>Back</button>
        <div className="time-display">{currentTime}/{maxTime}</div>
        <input
          type="range"
          min="1"
          max={maxTime}
          step="1"
          value={currentTime}
          onChange={handleScrubberChange}
          className="scrubber"
        />
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default App;
