import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MonacoEditor from "../components/MonacoEditor";
import ReviewResultsPanel from "../components/ReviewResultsPanel";
import DebugResultsPanel from "../components/DebugResultsPanel";
import { submitCodeReview } from "../api/review.api";
import type { StoredReviewResult } from "../api/review.api";
import { submitCodeDebug } from "../api/debug.api";
import type { DebugResult } from "../api/debug.api";
import PageHeader from "../../../components/ui/PageHeader";
import StatusBanner from "../../../components/ui/StatusBanner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";

const languages = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

type AnalysisMode = "review" | "debug";

const CodeEditorPage = () => {
  const [code, setCode] = useState("// Start typing your code...");
  const [language, setLanguage] = useState("javascript");
  const [mode, setMode] = useState<AnalysisMode>("review");
  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<StoredReviewResult | null>(null);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!code.trim()) {
      setErrorMessage("Please enter code before running the review.");
      return;
    }

    if (code.length < 10) {
      setErrorMessage("Code is too short for review. Add a bit more context and try again.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      if (mode === "review") {
        const response = await submitCodeReview({
          code,
          language,
        });

        setReviewResult(response.data);
        setDebugResult(null);
      } else {
        const response = await submitCodeDebug({
          code,
          language,
        });

        setDebugResult(response.data);
        setReviewResult(null);
      }
    } catch (error: any) {
      console.error("Error submitting code:", error);
      setReviewResult(null);
      setDebugResult(null);
      const status = error?.response?.status;
      const backendMessage = getApiErrorMessage(
        error,
        "Unable to reach the review service right now.",
      );

      setErrorMessage(
        status === 401
          ? "Your session expired or is missing. Please login again and retry the review."
          : backendMessage ||
              backendMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <PageHeader
            title="Code Buddy"
            description="Submit pasted code and switch between AI Review and AI Debug to inspect issues, explanations, scores, and corrected code output."
            actions={
              <>
                <button
                  onClick={() => navigate("/reviews")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Review History
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Dashboard
                </button>
              </>
            }
          />
        </div>

        {errorMessage && !loading ? (
          <StatusBanner tone="warning" title="Review Notice" message={errorMessage} />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {mode === "review" ? "Paste Review" : "Paste Debug"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a language, then run either AI review or AI debug on the current code.
                </p>
              </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1">
                      {[
                        { label: "Review", value: "review" },
                        { label: "Debug", value: "debug" },
                      ].map((option) => {
                        const active = mode === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setMode(option.value as AnalysisMode);
                              setErrorMessage("");
                              setReviewResult(null);
                              setDebugResult(null);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                              active
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:bg-white"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                  {loading ? (mode === "review" ? "Reviewing..." : "Debugging...") : mode === "review" ? "Review Code" : "Debug Code"}
                  </button>
                </div>
              </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <MonacoEditor
                value={code}
                onChange={setCode}
                language={language}
              />
            </div>
          </section>

          {mode === "review" ? (
            <ReviewResultsPanel
              loading={loading}
              result={reviewResult}
              errorMessage={errorMessage}
            />
          ) : (
            <DebugResultsPanel
              loading={loading}
              result={debugResult}
              errorMessage={errorMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
