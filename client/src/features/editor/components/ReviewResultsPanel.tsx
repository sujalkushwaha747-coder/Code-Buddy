import {
  formatLanguageLabel,
  normalizeCodeBlockContent,
  normalizeReviewMetrics,
  type ReviewIssue,
  type ReviewIssueType,
  type StoredReviewResult,
} from "../api/review.api";
import Spinner from "../../../components/ui/Spinner";

type ReviewResultsPanelProps = {
  loading: boolean;
  result: StoredReviewResult | null;
  errorMessage: string;
};

const issueSections: Array<{
  type: ReviewIssueType;
  title: string;
  description: string;
  accentClassName: string;
  badgeClassName: string;
}> = [
  {
    type: "bug",
    title: "Bugs",
    description: "Logic, runtime, and correctness issues.",
    accentClassName: "border-red-200 bg-red-50",
    badgeClassName: "bg-red-100 text-red-700",
  },
  {
    type: "performance",
    title: "Performance",
    description: "Efficiency and scalability problems.",
    accentClassName: "border-amber-200 bg-amber-50",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
  {
    type: "security",
    title: "Security",
    description: "Risks that could expose data or weaken protection.",
    accentClassName: "border-blue-200 bg-blue-50",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
];

const scoreTone = (score: number) => {
  if (score >= 80) {
    return {
      ringClassName: "ring-emerald-200",
      fillClassName: "bg-emerald-500",
      textClassName: "text-emerald-700",
    };
  }

  if (score >= 60) {
    return {
      ringClassName: "ring-amber-200",
      fillClassName: "bg-amber-500",
      textClassName: "text-amber-700",
    };
  }

  return {
    ringClassName: "ring-red-200",
    fillClassName: "bg-red-500",
    textClassName: "text-red-700",
  };
};

const renderIssueCard = (issue: ReviewIssue, index: number, badgeClassName: string) => (
  <div
    key={`${issue.type}-${issue.title}-${index}`}
    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${badgeClassName}`}>
        {issue.severity}
      </span>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
        Line {issue.line ?? "N/A"}
      </span>
    </div>

    <h3 className="mt-3 text-base font-semibold text-slate-900">{issue.title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{issue.description}</p>
    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
      <span className="font-semibold text-slate-900">Recommendation:</span>{" "}
      {issue.recommendation}
    </p>
  </div>
);

const ReviewResultsPanel = ({
  loading,
  result,
  errorMessage,
}: ReviewResultsPanelProps) => {
  if (loading) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Review Results</h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Spinner label="AI is analyzing your code and preparing categorized feedback." />
        </div>
      </aside>
    );
  }

  if (errorMessage) {
    return (
      <aside className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-900">Review Failed</h2>
        <p className="mt-3 text-sm leading-6 text-red-700">{errorMessage}</p>
      </aside>
    );
  }

  if (!result) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Review Results</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Submit code to see bugs, performance issues, security issues, and a refactored version
          of your code.
        </p>
      </aside>
    );
  }

  const metrics = normalizeReviewMetrics(result.metrics);
  const issues = Array.isArray(result.issues) ? result.issues : [];
  const improvedCode = normalizeCodeBlockContent(result.improvedCode, result.language);
  const languageLabel = formatLanguageLabel(result.language);

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          AI Review Output
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Review Results</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
            {languageLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Reviewed as {languageLabel} code
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{result.summary}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Complexity", value: result.scores.complexity },
          { label: "Security", value: result.scores.security },
          { label: "Overall", value: result.scores.overall },
        ].map((scoreCard) => {
          const tone = scoreTone(scoreCard.value);

          return (
            <div
              key={scoreCard.label}
              className={`rounded-2xl bg-slate-50 p-4 ring-1 ${tone.ringClassName}`}
            >
              <p className="text-sm font-medium text-slate-500">{scoreCard.label} Score</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className={`text-3xl font-bold ${tone.textClassName}`}>
                  {scoreCard.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  /100
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${tone.fillClassName}`}
                  style={{ width: `${scoreCard.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Code Metrics</h3>
          <p className="mt-1 text-sm text-slate-500">
            Static code metrics calculated from your submission for optimization insights.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Lines", value: metrics.lineCount },
            { label: "Functions", value: metrics.functionCount },
            { label: "Loops", value: metrics.loopCount },
            { label: "Nested Loops", value: metrics.nestedLoopDepth },
            { label: "Complexity Approx", value: metrics.complexityApproximation },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold text-slate-900">Optimization Insights</h4>
          <div className="mt-3 space-y-2">
            {metrics.optimizationInsights.map((insight, index) => (
              <p
                key={`${insight}-${index}`}
                className="rounded-xl bg-white p-3 text-sm leading-6 text-slate-700"
              >
                {insight}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Categorized Issues</h3>
          <p className="mt-1 text-sm text-slate-500">
            Feedback is grouped by bug, performance, and security impact.
          </p>
        </div>

        {issues.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            No major review issues were reported by the AI for this code.
          </div>
        ) : (
          <div className="space-y-6">
            {issueSections.map((section) => {
              const sectionIssues = issues.filter((issue) => issue.type === section.type);

              if (sectionIssues.length === 0) {
                return null;
              }

              return (
                <section key={section.type} className={`rounded-2xl border p-4 ${section.accentClassName}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{section.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${section.badgeClassName}`}>
                      {sectionIssues.length} issue{sectionIssues.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {sectionIssues.map((issue, index) =>
                      renderIssueCard(issue, index, section.badgeClassName),
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Refactored Code</h3>
            <p className="mt-1 text-sm text-slate-500">
              AI-suggested improved version of the submitted code.
            </p>
          </div>
        </div>

        <pre className="mt-4 max-h-[32rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code>{improvedCode}</code>
        </pre>
      </div>
    </aside>
  );
};

export default ReviewResultsPanel;
