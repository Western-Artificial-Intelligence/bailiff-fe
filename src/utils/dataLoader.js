
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

// Helper: split a text into sub-chunks at sentence boundaries so that
// each sub-chunk stays ≤ 150 characters when possible. If a single
// sentence exceeds 150 chars it becomes its own chunk.
const splitAtSentenceBoundary = (text, maxLen = 150) => {
    if (text.length <= maxLen) return [text];

    // Split on sentence-ending punctuation followed by a space or end of string
    const sentences = text.match(/[^.!?]*[.!?]+(?:\s+|$)|[^.!?]+$/g);
    if (!sentences) return [text];

    const result = [];
    let buffer = '';

    for (const sentence of sentences) {
        const trimmed = sentence.trimEnd();
        if (buffer.length === 0) {
            buffer = trimmed;
        } else if ((buffer + ' ' + trimmed).length <= maxLen) {
            buffer += ' ' + trimmed;
        } else {
            // Current buffer is already over the limit or adding would exceed it
            result.push(buffer);
            buffer = trimmed;
        }
    }
    if (buffer.length > 0) result.push(buffer);

    return result;
};

// Helper to process a single trial into a timeline
const processTrial = (trial) => {
    const timeline = [];

    if (!trial.utterances) return null;

    let index = 1; // 1-based integer index per chunk

    trial.utterances.forEach((utterance, utteranceIndex) => {

        // End on internal audit
        if (utterance.phase === "audit") {
            return;
        }


        // Split content by double newline
        const chunks = utterance.content.split(/\n\n+/);

        chunks.forEach((chunk) => {
            // Further split long chunks at sentence boundaries
            const subChunks = splitAtSentenceBoundary(chunk);

            subChunks.forEach((subChunk) => {
                if (!subChunk.includes("\"verdict\"")) {
                    timeline.push({
                        index: index++,
                        role: utterance.role,
                        text: subChunk,
                        originalUtteranceIndex: utteranceIndex,
                    });
                }
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
