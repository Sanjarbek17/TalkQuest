import { useEffect, useRef, useState } from "react";
import { getTodaysChallenge, submitAudio } from "./api";

// First MIME the browser can actually record. Safari only does mp4; Chrome/FF do webm/opus.
const MIME_CANDIDATES = [
  { type: "audio/webm;codecs=opus", ext: "webm" },
  { type: "audio/webm", ext: "webm" },
  { type: "audio/mp4", ext: "mp4" },
];

function pickMime() {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((c) => MediaRecorder.isTypeSupported(c.type)) ?? null;
}

// Estimate how long the transcribe + grade round-trip will take, from the clip length.
function estimateSeconds(audioSeconds) {
  const secs = audioSeconds > 0 ? audioSeconds : 30;
  return Math.min(90, Math.max(12, Math.round(8 + 0.8 * secs)));
}

export default function App() {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);

  // Recording flow: "idle" -> "recording" -> "recorded"
  const [recState, setRecState] = useState("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const [recordedFile, setRecordedFile] = useState(null);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Evaluation flow
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [estTotal, setEstTotal] = useState(30);
  const [result, setResult] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recSecondsRef = useRef(0); // mirrors recSeconds for the onstop closure

  useEffect(() => {
    getTodaysChallenge().then(setChallenge).catch((e) => setError(e.message));
  }, []);

  // Tick the recording timer (also mirror to a ref for the onstop closure).
  useEffect(() => {
    if (recState !== "recording") return;
    const id = setInterval(
      () => setRecSeconds((s) => ((recSecondsRef.current = s + 1), s + 1)),
      1000
    );
    return () => clearInterval(id);
  }, [recState]);

  // Tick the evaluation progress.
  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 0.5), 500);
    return () => clearInterval(id);
  }, [loading]);

  // Clean up stream + object URL on unmount.
  useEffect(() => {
    return () => {
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function resetToIdle() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordedFile(null);
    setAudioSeconds(0);
    setRecSeconds(0);
    setResult(null);
    setError(null);
    setRecState("idle");
  }

  async function startRecording() {
    setError(null);
    setResult(null);
    const mime = pickMime();
    if (!mime) {
      setError("Recording isn't supported in this browser — upload a file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: mime.type });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime.type });
        const file = new File([blob], `recording.${mime.ext}`, { type: mime.type });
        const url = URL.createObjectURL(blob);
        setRecordedFile(file);
        setPreviewUrl(url);
        setAudioSeconds(recSecondsRef.current);
        setRecState("recorded");
        stopStream();
      };
      recorderRef.current = rec;
      setRecSeconds(0);
      recSecondsRef.current = 0;
      rec.start();
      setRecState("recording");
    } catch (e) {
      stopStream();
      setError(
        e?.name === "NotAllowedError"
          ? "Microphone permission was denied — allow it, or upload a file instead."
          : `Couldn't start recording (${e?.name || e}). Try uploading a file instead.`
      );
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  // Upload fallback — read duration from metadata, then converge on the preview flow.
  function onPickFile(e) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setRecordedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    const probe = new Audio();
    probe.preload = "metadata";
    probe.onloadedmetadata = () =>
      setAudioSeconds(Number.isFinite(probe.duration) ? probe.duration : 0);
    probe.src = url;
    setRecState("recorded");
  }

  async function onSubmit() {
    if (!recordedFile) return;
    setEstTotal(estimateSeconds(audioSeconds));
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await submitAudio(recordedFile));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const remaining = Math.max(0, Math.ceil(estTotal - elapsed));
  const progress = Math.min(97, (elapsed / estTotal) * 100);

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

      <section className="card recorder">
        {recState === "idle" && (
          <>
            <button type="button" onClick={startRecording} disabled={loading}>
              🎙️ Record
            </button>
            <label className="upload-fallback">
              or{" "}
              <span className="link-like">upload a file</span>
              <input type="file" accept="audio/*" onChange={onPickFile} disabled={loading} />
            </label>
          </>
        )}

        {recState === "recording" && (
          <>
            <p className="rec-status">
              <span className="rec-dot" /> Recording… {recSeconds}s
            </p>
            <button type="button" onClick={stopRecording}>
              ⏹ Stop
            </button>
          </>
        )}

        {recState === "recorded" && (
          <>
            {previewUrl && <audio className="preview" controls src={previewUrl} />}
            <div className="rec-actions">
              <button type="button" onClick={onSubmit} disabled={loading}>
                {loading ? "Evaluating…" : "Submit"}
              </button>
              <button type="button" className="secondary" onClick={resetToIdle} disabled={loading}>
                Re-record
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="progress-wrap">
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="hint">
              {remaining > 0 ? `Evaluating… ~${remaining}s left` : "Finishing up…"} · transcribing,
              then grading
            </p>
          </div>
        )}
      </section>

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
