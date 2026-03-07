import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { loadTrials } from './utils/dataLoader';
import defenseImg from './assets/images/defense.png';
import defense2Img from './assets/images/Defense 2.png';
import prosecutionImg from './assets/images/prosecution.png';
import prosecution2Img from './assets/images/prosecution2.png';
import courtroomImg from './assets/images/courtroom.png';
import judgeImg from './assets/images/judge.png';
import judge2Img from './assets/images/judge2.png';
import waiLogo from './assets/images/wai.png';

// Character options per role
const DEFENSE_CHARS = [
  { id: 'clippy', img: defenseImg, label: 'Clippy' },
  { id: 'harvey', img: defense2Img, label: 'Harvey' },
];
const PROSECUTION_CHARS = [
  { id: 'robot', img: prosecutionImg, label: 'Robot' },
  { id: 'kent', img: prosecution2Img, label: 'Kent' },
];
const JUDGE_CHARS = [
  { id: 'thinker', img: judge2Img, label: 'Thinker' },
  { id: 'robo-judge', img: judgeImg, label: 'Robo Judge' },
];

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
  const [defenseChar, setDefenseChar] = useState(0);
  const [prosecutionChar, setProsecutionChar] = useState(0);
  const [judgeChar, setJudgeChar] = useState(0);
  const [showPanels, setShowPanels] = useState(true);

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
        {/* Toggle button for character panels */}
        <button
          className="char-panel-toggle"
          onClick={() => setShowPanels(prev => !prev)}
          title={showPanels ? 'Hide character selectors' : 'Show character selectors'}
        >
          {showPanels ? '−' : '+'}
        </button>

        {/* Character selection panels */}
        {showPanels && (
          <>
            <div className="char-panel char-panel-defense">
              {DEFENSE_CHARS.map((ch, i) => (
                <button
                  key={ch.id}
                  className={`char-thumb${defenseChar === i ? ' active' : ''}`}
                  onClick={() => setDefenseChar(i)}
                  title={ch.label}
                >
                  <img src={ch.img} alt={ch.label} />
                </button>
              ))}
            </div>

            <div className="char-panel char-panel-judge">
              {JUDGE_CHARS.map((ch, i) => (
                <button
                  key={ch.id}
                  className={`char-thumb${judgeChar === i ? ' active' : ''}`}
                  onClick={() => setJudgeChar(i)}
                  title={ch.label}
                >
                  <img src={ch.img} alt={ch.label} />
                </button>
              ))}
            </div>

            <div className="char-panel char-panel-prosecution">
              {PROSECUTION_CHARS.map((ch, i) => (
                <button
                  key={ch.id}
                  className={`char-thumb${prosecutionChar === i ? ' active' : ''}`}
                  onClick={() => setProsecutionChar(i)}
                  title={ch.label}
                >
                  <img src={ch.img} alt={ch.label} />
                </button>
              ))}
            </div>
          </>
        )}

        {showDefense && (
          <img src={DEFENSE_CHARS[defenseChar].img} alt="Defense" className="avatar defense-avatar speaking" />
        )}
        {showProsecution && (
          <img src={PROSECUTION_CHARS[prosecutionChar].img} alt="Prosecution" className="avatar prosecution-avatar speaking" />
        )}
        {showJudge && (
          <img src={JUDGE_CHARS[judgeChar].img} alt="Judge" className="avatar judge-avatar speaking" />
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
