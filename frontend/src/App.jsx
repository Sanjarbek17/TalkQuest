import { useEffect, useState } from "react";
import { getTodaysChallenge, submitAudio } from "./api";

export default function App() {
  const [challenge, setChallenge] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    getTodaysChallenge().then(setChallenge).catch((e) => setError(e.message));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await submitAudio(file));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <h1>TalkQuest</h1>
      <p className="tag">Today's speaking challenge</p>

      {error && <div className="card error">{error}</div>}

      {challenge && (
        <section className="card">
          <h2>{challenge.topic}</h2>
          <p>{challenge.instructions}</p>
          <p className="phrase">
            Code phrase to say out loud: <strong>{challenge.code_phrase}</strong>
          </p>
        </section>
      )}

      <form className="card" onSubmit={onSubmit}>
        <label className="upload">
          <span>Upload your recording</span>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? "Evaluating…" : "Submit"}
        </button>
      </form>

      {result && (
        <section className={`card result ${result.passed ? "pass" : "fail"}`}>
          <h2>{result.passed ? "✅ Passed" : "❌ Not yet"}</h2>

          <div className="badges">
            <span className={result.checks.code_phrase_ok ? "ok" : "no"}>
              {result.checks.code_phrase_ok ? "✓" : "✗"} code phrase
            </span>
            <span className={result.checks.topic_ok ? "ok" : "no"}>
              {result.checks.topic_ok ? "✓" : "✗"} on topic
            </span>
          </div>

          <p>✅ <strong>Did well:</strong> {result.feedback.strength}</p>
          <p>🔧 <strong>To improve:</strong> {result.feedback.improvement}</p>

          {result.matched_elements.length > 0 && (
            <ul className="matched">
              {result.matched_elements.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="link"
            onClick={() => setShowTranscript((v) => !v)}
          >
            {showTranscript ? "Hide" : "Show"} transcript
          </button>
          {showTranscript && <pre className="transcript">{result.transcript}</pre>}
        </section>
      )}
    </main>
  );
}
