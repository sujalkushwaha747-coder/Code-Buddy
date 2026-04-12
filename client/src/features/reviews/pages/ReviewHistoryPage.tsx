import { useEffect, useState } from "react";

import { fetchReviewHistory, type ReviewHistoryItem } from "../api/reviewHistory.api";
import {
  formatLanguageLabel,
  normalizeCodeBlockContent,
  normalizeReviewMetrics,
} from "../../editor/api/review.api";
import PageHeader from "../../../components/ui/PageHeader";
import Spinner from "../../../components/ui/Spinner";
import StatusBanner from "../../../components/ui/StatusBanner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const ReviewHistoryPage = () => {
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetchReviewHistory();
        setHistory(response.data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error, "Failed to load review history"));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Review History"
          description="Browse your previously saved AI code reviews, issue lists, score snapshots, and improved code output."
        />

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Spinner label="Loading review history..." />
          </section>
        ) : errorMessage ? (
          <StatusBanner tone="error" title="History" message={errorMessage} />
        ) : history.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              No saved reviews found yet. Run a code review from the editor to create your first
              history entry.
            </p>
          </section>
        ) : (
          <div className="space-y-5">
            {history.map((review) => {
              const metrics = normalizeReviewMetrics(review.metrics);
              const languageLabel = formatLanguageLabel(review.language);
              const originalCode = normalizeCodeBlockContent(review.originalCode, review.language);
              const improvedCode = normalizeCodeBlockContent(review.improvedCode, review.language);

              return (
                <article
                  key={review.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          review.sourceType === "repository"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {review.sourceType === "repository" ? "Repository Review" : "Paste Review"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                        {languageLabel}
                      </span>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {review.issues.length} issue{review.issues.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-slate-900">{review.summary}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Reviewed on {formatDate(review.createdAt)}
                    </p>
                    {review.sourceType === "repository" && review.repositoryFullName ? (
                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-900">Repository:</span>{" "}
                          {review.repositoryFullName}
                        </p>
                        {review.filePath ? (
                          <p>
                            <span className="font-semibold text-slate-900">File:</span>{" "}
                            {review.filePath}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase text-slate-400">Complexity</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {review.scores.complexity}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase text-slate-400">Security</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {review.scores.security}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase text-slate-400">Overall</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {review.scores.overall}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  <section>
                    <h3 className="text-base font-semibold text-slate-900">Stored Metrics</h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        { label: "Lines", value: metrics.lineCount },
                        { label: "Functions", value: metrics.functionCount },
                        { label: "Loops", value: metrics.loopCount },
                        { label: "Nested Loops", value: metrics.nestedLoopDepth },
                        {
                          label: "Complexity Approx",
                          value: metrics.complexityApproximation,
                        },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-medium uppercase text-slate-400">
                            {metric.label}
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-900">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <h3 className="text-base font-semibold text-slate-900">Optimization Insights</h3>
                      <div className="mt-3 space-y-2">
                        {metrics.optimizationInsights.map((insight, index) => (
                          <p
                            key={`${review.id}-insight-${index}`}
                            className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                          >
                            {insight}
                          </p>
                        ))}
                      </div>
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-slate-900">Saved Issues</h3>
                    <div className="mt-3 space-y-3">
                      {review.issues.length === 0 ? (
                        <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                          No issues were stored for this review.
                        </p>
                      ) : (
                        review.issues.map((issue, index) => (
                          <div
                            key={`${review.id}-${issue.title}-${index}`}
                            className="rounded-2xl border border-slate-200 p-4"
                          >
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-600">
                                {issue.type}
                              </span>
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase text-amber-700">
                                {issue.severity}
                              </span>
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Line {issue.line ?? "N/A"}
                              </span>
                            </div>
                            <h4 className="mt-3 font-semibold text-slate-900">{issue.title}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {issue.description}
                            </p>
                            <p className="mt-3 text-sm text-slate-700">
                              <span className="font-semibold">Recommendation:</span>{" "}
                              {issue.recommendation}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Original Code</h3>
                      <pre className="mt-3 max-h-64 overflow-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                        <code>{originalCode}</code>
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Improved Code</h3>
                      <pre className="mt-3 max-h-64 overflow-auto rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-100">
                        <code>{improvedCode}</code>
                      </pre>
                    </div>
                  </section>
                </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewHistoryPage;
