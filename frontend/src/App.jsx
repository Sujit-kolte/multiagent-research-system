import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Download,
  FileText,
  Globe2,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";

const stages = [
  { key: "search_results", label: "Web scan", icon: Search },
  { key: "scraped_content", label: "Source read", icon: Globe2 },
  { key: "research_report", label: "Synthesis", icon: FileText },
  { key: "evaluation", label: "Critique", icon: Check },
];

function App() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [activeStage, setActiveStage] = useState("research_report");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Server returned an invalid response (${response.status}).`);
      }
      if (!response.ok)
        throw new Error(data.error || "The research run failed.");
      setResult(data);
      setActiveStage("research_report");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const activeContent = result?.[activeStage];

  function downloadReport() {
    if (!result) return;
    const report = [
      `RESEARCH ROOM\n${topic}`,
      "=".repeat(70),
      "\nRESEARCH REPORT\n",
      result.research_report,
      "\n\nSOURCES AND SEARCH RESULTS\n",
      result.search_results,
      "\n\nSCRAPED SOURCE CONTENT\n",
      result.scraped_content,
      "\n\nCRITIQUE\n",
      result.evaluation,
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "research-report"
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Research Room home">
          <span className="brand-mark">
            <Sparkles size={15} />
          </span>
          <span>Research Room</span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" /> Agent workspace{" "}
          <span className="divider" /> v0.1
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <span>01</span> Intelligence brief
        </div>
        <h1>
          Turn a question into
          <br />
          <em>something useful.</em>
        </h1>
        <p className="hero-copy">
          A focused research desk for finding signal, reading the source, and
          shaping a clear point of view.
        </p>
        <form className="research-form" onSubmit={handleSubmit}>
          <Search size={19} className="input-icon" />
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="What should we investigate?"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !topic.trim()}>
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <ArrowUpRight size={17} />
            )}
            {loading ? "Working" : "Research"}
          </button>
        </form>
        <div className="prompt-row">
          <span>Try a direction</span>
          {["AI in education", "Future of cities", "Climate adaptation"].map(
            (prompt) => (
              <button
                type="button"
                key={prompt}
                onClick={() => setTopic(prompt)}>
                {prompt} <ChevronRight size={13} />
              </button>
            ),
          )}
        </div>
      </section>

      <section className="workspace">
        <aside className="rail">
          <div className="rail-heading">
            <span>Pipeline</span>
            {result && (
              <span className="complete-label">
                <Check size={12} /> Complete
              </span>
            )}
          </div>
          <div className="stage-list">
            {stages.map(({ key, label, icon: Icon }, index) => (
              <button
                className={`stage ${activeStage === key ? "active" : ""} ${result ? "ready" : ""}`}
                key={key}
                onClick={() => result && setActiveStage(key)}
                disabled={!result}>
                <span className="stage-number">0{index + 1}</span>
                <Icon size={16} />
                <span>{label}</span>
                {result && <Check className="stage-check" size={14} />}
              </button>
            ))}
          </div>
          <div className="rail-note">
            <BookOpen size={15} />
            <p>
              Every run uses live search, source extraction, and a second-pass
              critique.
            </p>
          </div>
        </aside>

        <div className="content-panel">
          {error && (
            <div className="error-banner">
              <CircleAlert size={18} />
              <span>{error}</span>
            </div>
          )}
          {!result && !loading && <EmptyState onPick={setTopic} />}
          {loading && <LoadingState />}
          {result && !loading && (
            <>
              <div className="content-heading">
                <div>
                  <div className="eyebrow">Research output</div>
                  <h2>
                    {stages.find((stage) => stage.key === activeStage)?.label}
                  </h2>
                </div>
                <div className="heading-actions">
                  <span className="topic-chip">{topic}</span>
                  <button
                    className="download-button"
                    onClick={downloadReport}
                    title="Download complete report">
                    <Download size={15} /> <span>Download</span>
                  </button>
                </div>
              </div>
              <StageContent stage={activeStage} result={result} />
            </>
          )}
        </div>
      </section>
      <footer>
        <span>Research Room</span>
        <span>Powered by your multi-agent pipeline</span>
      </footer>
    </main>
  );
}

function StageContent({ stage, result }) {
  if (stage === "search_results")
    return <SearchResults content={result.search_results} />;
  if (stage === "evaluation") return <Evaluation content={result.evaluation} />;
  return (
    <article className="result-copy">
      <FormattedText
        content={
          stage === "research_report"
            ? result.research_report
            : result.scraped_content
        }
      />
    </article>
  );
}

function FormattedText({ content }) {
  return String(content || "")
    .split(/(https?:\/\/[^\s]+)/g)
    .map((part, index) => {
      if (!part.match(/^https?:\/\//))
        return <span key={`${part}-${index}`}>{part}</span>;
      return (
        <a
          key={`${part}-${index}`}
          href={part.replace(/[),.;]+$/, "")}
          target="_blank"
          rel="noreferrer">
          {part}
        </a>
      );
    });
}

function SearchResults({ content }) {
  const blocks = String(content || "No search results found.")
    .split(/(?=Title: )/g)
    .filter(Boolean);
  return (
    <div className="source-grid">
      {blocks.map((block, index) => {
        const title =
          block.match(/Title:\s*(.*)/)?.[1] || `Source ${index + 1}`;
        const snippet =
          block.match(/Snippet:\s*([\s\S]*?)(?=URL:|$)/)?.[1]?.trim() ||
          "No excerpt available.";
        const url = block.match(/URL:\s*(https?:\/\/\S+)/)?.[1];
        return (
          <article className="source-card" key={`${title}-${index}`}>
            <div className="source-index">0{index + 1}</div>
            <h3>{title}</h3>
            <p>{snippet}</p>
            {url && (
              <a
                className="source-link"
                href={url}
                target="_blank"
                rel="noreferrer">
                Open source <ArrowUpRight size={14} />
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Evaluation({ content }) {
  const text = String(content || "");
  const score =
    text.match(/score\s*:\s*([^\n]+)/i)?.[1]?.trim() || "Not provided";
  const improvements =
    text
      .match(
        /areas of improvement\s*:\s*([\s\S]*?)(?=one line verdict|feedback|$)/i,
      )?.[1]
      ?.trim() || "Not provided";
  const verdict =
    text
      .match(/one line verdict\s*:\s*([\s\S]*?)(?=feedback|$)/i)?.[1]
      ?.trim() || "Not provided";
  const feedback =
    text.match(/feedback\s*:\s*([\s\S]*)/i)?.[1]?.trim() || "Not provided";
  return (
    <div className="evaluation-grid">
      <div className="score-card">
        <span className="field-label">Score</span>
        <strong>{score}</strong>
        <span className="score-caption">Agent assessment</span>
      </div>
      <div className="evaluation-card">
        <span className="field-label">One line verdict</span>
        <p>{verdict}</p>
      </div>
      <div className="evaluation-card">
        <span className="field-label">Areas of improvement</span>
        <p>{improvements}</p>
      </div>
      <div className="evaluation-card evaluation-wide">
        <span className="field-label">Feedback</span>
        <p>{feedback}</p>
      </div>
    </div>
  );
}

function EmptyState({ onPick }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Sparkles size={21} />
      </div>
      <h2>Your next brief starts here.</h2>
      <p>
        Enter a topic above and the agents will collect, distill, and
        pressure-test the information for you.
      </p>
      <button
        onClick={() => onPick("The impact of AI on scientific discovery")}>
        Use an example <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <LoaderCircle className="spin" size={24} />
      <h2>Agents are thinking</h2>
      <p>Searching the web, reading sources, and assembling your brief.</p>
    </div>
  );
}

export default App;
