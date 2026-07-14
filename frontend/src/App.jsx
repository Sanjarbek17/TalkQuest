import { useEffect, useState } from "react";
import { getTodaysChallenge, submitAudio } from "./api";

export default function App() {
  const [challenge, setChallenge] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTodaysChallenge().then(setChallenge).catch((e) => setError(e.message));
  }, []);

  // Count up while evaluating so the wait (transcribe + grade, ~20-40s) feels alive.
  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [loading]);

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
          {loading ? `Evaluating… ${elapsed}s` : "Submit"}
        </button>
        {loading && (
          <p className="hint">Usually ~20–40s — transcribing, then grading.</p>
        )}
      </form>

      {result && (
        <section className={`card result ${result.passed ? "pass" : "fail"}`}>
          <h2>{result.passed ? "✅ Passed" : "❌ Not yet"}</h2>

          <div className="badges">
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

          <h3 className="transcript-heading">Transcript</h3>
          <pre className="transcript">{result.transcript}</pre>
        </section>
      )}
    </main>
  );
}
