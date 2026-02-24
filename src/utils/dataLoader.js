
// Helper to parse JSONL content
const parseJSONL = (content) => {
    const lines = content.trim().split('\n');
    return lines.map(line => {
        try {
            return JSON.parse(line);
        } catch (e) {
            console.error("Failed to parse line", e);
            return null;
        }
    }).filter(x => x !== null);
};

// Helper to process a single trial into a timeline
const processTrial = (trial) => {
    const timeline = [];

    if (!trial.utterances) return null;

    let index = 1; // 1-based integer index per chunk

    trial.utterances.forEach((utterance, utteranceIndex) => {
        // Split content by double newline
        const chunks = utterance.content.split(/\n\n+/);

        chunks.forEach((chunk, chunkIndex) => {
            timeline.push({
                index: index++,
                role: utterance.role,
                text: chunk,
                originalUtteranceIndex: utteranceIndex,
                chunkIndex: chunkIndex,
                totalChunks: chunks.length
            });
        });
    });

    return {
        ...trial,
        timeline
    };
};

export const loadTrials = async () => {
    // Use require.context to load all .jsonl files from ../assets/transcripts
    const context = require.context('../assets/transcripts', false, /\.jsonl$/);

    const trials = [];

    for (const key of context.keys()) {
        const fileUrl = context(key);
        try {
            const response = await fetch(fileUrl);
            const text = await response.text();
            const jsonObjects = parseJSONL(text);

            // Each file might contain multiple trials (lines)
            jsonObjects.forEach(trial => {
                const processed = processTrial(trial);
                if (processed) {
                    trials.push(processed);
                }
            });
        } catch (error) {
            console.error(`Error loading trial file ${key}:`, error);
        }
    }

    return trials;
};
