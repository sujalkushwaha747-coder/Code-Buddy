import { useState } from "react";

import type { DebugResult } from "../api/debug.api";
import { formatLanguageLabel } from "../api/review.api";
import Spinner from "../../../components/ui/Spinner";

type DebugResultsPanelProps = {
  loading: boolean;
  result: DebugResult | null;
  errorMessage: string;
};

const DebugResultsPanel = ({
  loading,
  result,
  errorMessage,
}: DebugResultsPanelProps) => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  if (loading) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Debug Results</h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Spinner label="AI is debugging your code and preparing fixes." />
        </div>
      </aside>
    );
  }

  if (errorMessage) {
    return (
      <aside className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-900">Debug Failed</h2>
        <p className="mt-3 text-sm leading-6 text-red-700">{errorMessage}</p>
      </aside>
    );
  }

  if (!result) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Debug Results</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Submit code in Debug mode to see detected errors, explanations, and a corrected code output.
        </p>
      </aside>
    );
  }

  const languageLabel = formatLanguageLabel(result.language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.fixedCode);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch (_error) {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          AI Debug Output
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Debug Results</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase text-violet-700">
            {languageLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Debugged as {languageLabel} code
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{result.explanation}</p>
        {result.sourceType === "repository" && result.repositoryFullName ? (
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Repository:</span>{" "}
              {result.repositoryFullName}
            </p>
            {result.filePath ? (
              <p>
                <span className="font-semibold text-slate-900">File:</span> {result.filePath}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Detected Errors</h3>
          <p className="mt-1 text-sm text-slate-500">
            These are the main syntax or logic problems detected in the submitted code.
          </p>
        </div>

        {result.errors.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            No major debug issues were reported by the AI for this code.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {result.errors.map((error, index) => (
              <div
                key={`${error.issue}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold uppercase text-red-700">
                    Error {index + 1}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Line {error.line ?? "N/A"}
                  </span>
                </div>
                <h4 className="mt-3 text-base font-semibold text-slate-900">{error.issue}</h4>
                <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Fix:</span> {error.fix}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fixed Code</h3>
            <p className="mt-1 text-sm text-slate-500">
              Corrected version generated by the AI debugger.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Copy Failed"
                : "Copy Fixed Code"}
          </button>
        </div>

        <pre className="mt-4 max-h-[32rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code>{result.fixedCode}</code>
        </pre>
      </div>
    </aside>
  );
};

export default DebugResultsPanel;
