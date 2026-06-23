import { useState, useRef } from "react";

export default function SpanishTranslator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("breakdown");
  const [direction, setDirection] = useState("en-es"); // "en-es" or "es-en"
  const textareaRef = useRef(null);

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, direction }),
      });

      const parsed = await response.json();
      if (!response.ok || parsed.error) {
        throw new Error(parsed.error || "Request failed");
      }
      setResult(parsed);
      setHistory((prev) => [{ input, result: parsed }, ...prev.slice(0, 4)]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      translate();
    }
  };

  const posColors = {
    noun: "#f59e0b",
    verb: "#10b981",
    adjective: "#6366f1",
    adverb: "#ec4899",
    pronoun: "#14b8a6",
    preposition: "#f97316",
    article: "#8b5cf6",
    conjunction: "#06b6d4",
    default: "#94a3b8",
  };

  const getPosColor = (pos) => {
    const key = pos?.toLowerCase().split("/")[0].trim();
    return posColors[key] || posColors.default;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e2e0d8",
      padding: "0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #c8b89a 40px, #c8b89a 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #c8b89a 40px, #c8b89a 41px)`,
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.3em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 12 }}>
            Idioma · Language
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#f0ede6" }}>
            Spanish Learning<br />
            <em style={{ color: "#c8a96e", fontStyle: "italic" }}>Translator</em>
          </h1>
          <p style={{ marginTop: 16, fontSize: 15, color: "#8a8880", maxWidth: 420, margin: "16px auto 0", lineHeight: 1.6 }}>
            Type in English or Spanish. Get the translation plus grammar, tense, and sentence structure lessons.
          </p>
        </div>

        {/* Input area */}
        <div style={{
          background: "#13131a",
          border: "1px solid #2a2830",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          {/* Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: direction === "en-es" ? 700 : 400, color: direction === "en-es" ? "#f0ede6" : "#4a4860", transition: "all 0.2s" }}>
              🇺🇸 English → Spanish 🇪🇸
            </span>
            <div
              onClick={() => { setDirection(d => d === "en-es" ? "es-en" : "en-es"); setInput(""); setResult(null); }}
              style={{
                width: 52, height: 28, borderRadius: 14,
                background: direction === "es-en" ? "#c8a96e" : "#2a2830",
                cursor: "pointer", position: "relative", transition: "background 0.3s",
                border: "1px solid #3a3848", flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute", top: 3,
                left: direction === "es-en" ? 27 : 3,
                width: 20, height: 20, borderRadius: "50%",
                background: "#f0ede6", transition: "left 0.3s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: direction === "es-en" ? 700 : 400, color: direction === "es-en" ? "#f0ede6" : "#4a4860", transition: "all 0.2s" }}>
              🇪🇸 Spanish → English 🇺🇸
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={direction === "en-es" ? "Type a sentence in English..." : "Escribe una oración en español..."}
            rows={3}
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none",
              color: "#f0ede6", fontSize: 18, fontFamily: "inherit", resize: "none",
              lineHeight: 1.6, boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #2a2830" }}>
            <span style={{ fontSize: 12, color: "#4a4860" }}>Press Enter to translate</span>
            <button
              onClick={translate}
              disabled={loading || !input.trim()}
              style={{
                background: loading ? "#2a2830" : "linear-gradient(135deg, #c8a96e, #e8c98e)",
                color: loading ? "#4a4860" : "#0a0a0f",
                border: "none", borderRadius: 10, padding: "10px 28px",
                fontSize: 14, fontWeight: 700, letterSpacing: "0.05em",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                textTransform: "uppercase", transition: "all 0.2s",
              }}
            >
              {loading ? "Translating..." : "Translate →"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#2d1515", border: "1px solid #5a2020", borderRadius: 12, padding: 16, marginBottom: 24, color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 16, animation: "spin 2s linear infinite", display: "inline-block" }}>⟳</div>
            <div style={{ color: "#8a8880", fontSize: 14, letterSpacing: "0.1em" }}>TRANSLATING...</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ animation: "fadeIn 0.4s ease", marginBottom: 32 }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* Translation card */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
              background: "#13131a", border: "1px solid #2a2830",
              borderRadius: 16, overflow: "hidden", marginBottom: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}>
              <div style={{ padding: 28, borderRight: "1px solid #2a2830" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 12 }}>
                  {direction === "en-es" ? "🇺🇸 English" : "🇪🇸 Spanish"}
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.6, color: "#e2e0d8" }}>{result.original}</div>
              </div>
              <div style={{ padding: 28, background: "#0f0f18" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 12 }}>
                  {direction === "en-es" ? "🇪🇸 Spanish" : "🇺🇸 English"}
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.6, color: "#f0ede6", fontStyle: "italic" }}>{result.translation}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#13131a", padding: 6, borderRadius: 12, border: "1px solid #2a2830" }}>
              {[
                { id: "breakdown", label: "Word Breakdown" },
                { id: "grammar", label: "Grammar" },
                { id: "tense", label: "Tense & Structure" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, padding: "8px 16px", borderRadius: 8, border: "none",
                    background: activeTab === tab.id ? "#c8a96e" : "transparent",
                    color: activeTab === tab.id ? "#0a0a0f" : "#8a8880",
                    fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400,
                    cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: "#13131a", border: "1px solid #2a2830", borderRadius: 16, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

              {activeTab === "breakdown" && (
                <div>
                  <h3 style={{ margin: "0 0 20px", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8a96e" }}>Word-by-Word</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                    {result.wordBreakdown?.map((w, i) => (
                      <div key={i} style={{
                        background: "#0a0a0f", borderRadius: 10, padding: "12px 16px",
                        borderLeft: `3px solid ${getPosColor(w.partOfSpeech)}`,
                        minWidth: 120,
                      }}>
                        <div style={{ fontSize: 17, fontWeight: 600, color: "#f0ede6", marginBottom: 4 }}>{w.original}</div>
                        <div style={{ fontSize: 13, color: "#a8a8a0", marginBottom: 6 }}>{w.translation}</div>
                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: getPosColor(w.partOfSpeech) }}>
                          {w.partOfSpeech}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 16, borderTop: "1px solid #2a2830" }}>
                    {Object.entries(posColors).filter(([k]) => k !== "default").map(([pos, color]) => (
                      <div key={pos} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6a6860" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                        {pos}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "grammar" && (
                <div>
                  <h3 style={{ margin: "0 0 20px", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8a96e" }}>Grammar Notes</h3>
                  {result.grammarNotes?.map((note, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 16, marginBottom: 16, padding: "14px 18px",
                      background: "#0a0a0f", borderRadius: 10,
                    }}>
                      <div style={{ color: "#c8a96e", fontWeight: 700, fontSize: 14, minWidth: 20 }}>{i + 1}.</div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#c8c6be" }}>{note}</div>
                    </div>
                  ))}

                  {result.tips && (
                    <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 10 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 8 }}>💡 Learner Tip</div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: "#c8c6be" }}>{result.tips}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tense" && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8a96e" }}>Verb Tense</h3>
                    <div style={{ fontSize: 15, lineHeight: 1.8, color: "#c8c6be", padding: "16px 18px", background: "#0a0a0f", borderRadius: 10 }}>
                      {result.tenseInfo}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8a96e" }}>Sentence Structure</h3>
                    <div style={{ fontSize: 15, lineHeight: 1.8, color: "#c8c6be", padding: "16px 18px", background: "#0a0a0f", borderRadius: 10 }}>
                      {result.sentenceStructure}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4a4860", textTransform: "uppercase", marginBottom: 12 }}>Recent</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.slice(1).map((h, i) => (
                <div
                  key={i}
                  onClick={() => { setInput(h.input); setResult(h.result); }}
                  style={{
                    padding: "12px 16px", background: "#13131a", border: "1px solid #2a2830",
                    borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between",
                    alignItems: "center", transition: "border-color 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = "#c8a96e"}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = "#2a2830"}
                >
                  <span style={{ fontSize: 14, color: "#8a8880" }}>{h.input}</span>
                  <span style={{ fontSize: 14, color: "#6a6860", fontStyle: "italic" }}>→ {h.result.translation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
