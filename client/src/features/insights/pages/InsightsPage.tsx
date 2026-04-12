import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchReviewInsights,
  type BreakdownItem,
  type ReviewInsights,
  type SecurityTrendPoint,
} from "../api/reviewInsights.api";
import PageHeader from "../../../components/ui/PageHeader";
import Spinner from "../../../components/ui/Spinner";
import StatusBanner from "../../../components/ui/StatusBanner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";

const emptyInsights: ReviewInsights = {
  totals: {
    reviews: 0,
    issues: 0,
    pasteReviews: 0,
    repositoryReviews: 0,
  },
  averages: {
    complexityScore: 0,
    securityScore: 0,
    overallScore: 0,
    complexityApproximation: 0,
    lineCount: 0,
  },
  issueTypeBreakdown: [],
  languageBreakdown: [],
  sourceTypeBreakdown: [],
  securityTrend: [],
  reviewVolumeTrend: [],
  highlights: {
    mostCommonIssueType: null,
    highestSecurityScore: 0,
    nestedLoopHeavyReviews: 0,
  },
};

const TrendChart = ({ points }: { points: SecurityTrendPoint[] }) => {
  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No security trend data yet. Run a few reviews to populate this chart.
      </div>
    );
  }

  const width = 520;
  const height = 220;
  const padding = 28;
  const maxScore = 100;
  const stepX = points.length === 1 ? 0 : (width - padding * 2) / (points.length - 1);

  const polyline = points
    .map((point, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (point.score / maxScore) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
        {points.map((point, index) => {
          const x = padding + index * stepX;
          const y = height - padding - (point.score / maxScore) * (height - padding * 2);

          return (
            <g key={`${point.label}-${index}`}>
              <circle cx={x} cy={y} r="4.5" fill="#2563eb" />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {point.label}
              </text>
              <text
                x={x}
                y={Math.max(14, y - 10)}
                textAnchor="middle"
                className="fill-slate-700 text-[10px] font-semibold"
              >
                {point.score}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const BreakdownBars = ({
  title,
  subtitle,
  items,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  items: BreakdownItem[];
  emptyMessage: string;
}) => {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-blue-600"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const InsightsPage = () => {
  const [insights, setInsights] = useState<ReviewInsights>(emptyInsights);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setErrorMessage("");
        const response = await fetchReviewInsights();
        setInsights(response.data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error, "Failed to load review insights."));
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const topLanguages = useMemo(() => insights.languageBreakdown.slice(0, 5), [insights]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Insights Dashboard"
          description="Explore your review activity, average complexity and security trends, and the issue patterns that show up most often across saved AI reviews."
          actions={
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/reviews")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Review History
              </button>
            </>
          }
        />

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Spinner label="Loading insights dashboard..." />
          </section>
        ) : errorMessage ? (
          <StatusBanner tone="error" title="Insights" message={errorMessage} />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Reviews", value: insights.totals.reviews },
                { label: "Average Complexity", value: insights.averages.complexityScore },
                { label: "Average Security", value: insights.averages.securityScore },
                { label: "Total Issues", value: insights.totals.issues },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Security Trend</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Recent security scores from your latest saved reviews.
                </p>
                <div className="mt-5">
                  <TrendChart points={insights.securityTrend} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Most Frequent Issue Type
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {insights.highlights.mostCommonIssueType || "Not enough data"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Highest Security Score
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {insights.highlights.highestSecurityScore}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Nested Loop Heavy Reviews
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {insights.highlights.nestedLoopHeavyReviews}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Average Complexity Approximation
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {insights.averages.complexityApproximation}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <BreakdownBars
                title="Issue Type Distribution"
                subtitle="Most common issue categories across all saved reviews."
                items={insights.issueTypeBreakdown}
                emptyMessage="No issues have been stored yet."
              />

              <BreakdownBars
                title="Review Source Breakdown"
                subtitle="How many reviews came from pasted code versus repository files."
                items={insights.sourceTypeBreakdown}
                emptyMessage="No review source data is available yet."
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Review Volume Trend</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Saved review counts grouped by review day.
                </p>

                {insights.reviewVolumeTrend.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No review volume trend is available yet.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {insights.reviewVolumeTrend.map((point) => {
                      const maxCount = Math.max(
                        ...insights.reviewVolumeTrend.map((entry) => entry.count),
                        1,
                      );

                      return (
                        <div key={point.label}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-700">{point.label}</span>
                            <span className="text-sm font-semibold text-slate-900">{point.count}</span>
                          </div>
                          <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                            <div
                              className="h-2.5 rounded-full bg-emerald-500"
                              style={{ width: `${(point.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Top Languages Reviewed</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Languages that appear most often in your saved review history.
                </p>

                {topLanguages.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No language data is available yet.
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {topLanguages.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.count} review(s)</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Average Overall Score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {insights.averages.overallScore}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Average Line Count
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {insights.averages.lineCount}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
