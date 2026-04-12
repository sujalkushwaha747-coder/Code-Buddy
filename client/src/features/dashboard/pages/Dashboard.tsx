import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Spinner from "../../../components/ui/Spinner";
import StatusBanner from "../../../components/ui/StatusBanner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";

type DashboardTheme = "light" | "dark";

const Dashboard: React.FC = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoMessage, setRepoMessage] = useState("");
  const [repoError, setRepoError] = useState("");
  const [githubStatus, setGithubStatus] = useState("");
  const [theme, setTheme] = useState<DashboardTheme>("light");
  const navigate = useNavigate();

  const githubAccountHint =
    "GitHub will connect the account currently signed in on github.com. To switch to a different GitHub account, log out of this app, switch accounts on GitHub or use an incognito window, then sign back in here and click Connect GitHub again.";

  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboardTheme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const githubToken = params.get("github_token");
    const githubError = params.get("github_error");
    const githubConnectionStatus = params.get("github_status");
    const githubUser = params.get("github_user");

    if (githubToken) {
      localStorage.removeItem("githubToken");
      setGithubStatus(
        githubUser
          ? `GitHub connected successfully: ${githubUser}`
          : "GitHub connected successfully.",
      );
      window.history.replaceState(null, "", "/dashboard");
    }

    if (githubError) {
      setRepoError(githubError);
      window.history.replaceState(null, "", "/dashboard");
    }

    if (githubConnectionStatus === "connected") {
      setGithubStatus(
        githubUser
          ? `GitHub connected successfully: ${githubUser}`
          : "GitHub connected successfully.",
      );
      window.history.replaceState(null, "", "/dashboard");
    }

    fetchRepos();
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardTheme", theme);
  }, [theme]);

  const resetGithubUiState = () => {
    localStorage.removeItem("githubToken");
    setRepos([]);
    setGithubStatus("");
    setRepoError("");
    setRepoMessage("Connect GitHub to load your repositories.");
  };

  const handleLogout = async () => {
    try {
      await API.post("/github/disconnect");
    } catch (_error) {
      // Ignore disconnect failures during logout and still clear the local session.
    } finally {
      resetGithubUiState();
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const connectGithub = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    localStorage.removeItem("githubToken");
    setGithubStatus("");
    setRepoError("");
    setRepoMessage("Complete GitHub authorization to load repositories for this account.");
    setRepos([]);

    window.location.href = `http://localhost:5002/api/github/login?token=${encodeURIComponent(token)}`;
  };

  const fetchRepos = async () => {
    try {
      setRepoError("");
      const res = await API.get("/github/repos");
      setRepos(res.data);
      setRepoMessage(
        res.data.length === 0
          ? "GitHub is connected, but no repositories were returned."
          : "",
      );
    } catch (err: any) {
      const status = err?.response?.status;
      const message = getApiErrorMessage(err, "Failed to load repos");

      if (status === 400 && message.toLowerCase().includes("github token not found")) {
        setRepoMessage("Connect GitHub to load your repositories.");
        setRepos([]);
        return;
      }

      if (status === 401) {
        setRepoError("Your session expired. Please login again.");
        return;
      }

      setRepoError(message);
    } finally {
      setLoading(false);
    }
  };

  const dashboardSurfaceClassName = isDark
    ? "border-slate-800 bg-slate-900/90 text-slate-100"
    : "border-white/70 bg-white/90 text-slate-900";

  const mutedSurfaceClassName = isDark
    ? "border-slate-800 bg-slate-900 text-slate-100"
    : "border-slate-200 bg-white text-slate-900";

  const subtleSurfaceClassName = isDark
    ? "border-slate-800 bg-slate-950/70 text-slate-100"
    : "border-slate-200 bg-slate-50 text-slate-900";

  const secondaryTextClassName = isDark ? "text-slate-300" : "text-slate-600";
  const badgeClassName = isDark
    ? "bg-slate-800 text-slate-200"
    : "bg-slate-100 text-slate-700";
  const secondaryButtonClassName = isDark
    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <div
      className={`min-h-screen px-4 py-6 transition-colors sm:px-6 lg:px-8 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Dashboard"
          description="Navigate the Code Buddy workspace, connect GitHub, inspect repositories, and jump into saved history or quality insights."
          className={dashboardSurfaceClassName}
          titleClassName={isDark ? "text-white" : ""}
          descriptionClassName={secondaryTextClassName}
          actions={
            <>
              <button
                onClick={toggleTheme}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${secondaryButtonClassName}`}
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={handleLogout}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${secondaryButtonClassName}`}
              >
                Logout
              </button>
            </>
          }
        />

        {githubStatus ? (
          <StatusBanner
            tone="success"
            title="GitHub"
            message={githubStatus}
            className={isDark ? "border-emerald-900 bg-emerald-950/40 text-emerald-200" : ""}
          />
        ) : null}

        <StatusBanner
          tone="info"
          title="GitHub Account"
          message={githubAccountHint}
          className={isDark ? "border-blue-900 bg-blue-950/40 text-blue-200" : ""}
        />

        {repoError ? (
          <StatusBanner
            tone="error"
            title="Repositories"
            message={repoError}
            className={isDark ? "border-red-900 bg-red-950/40 text-red-200" : ""}
          />
        ) : null}

        {repoMessage ? (
          <StatusBanner
            tone="info"
            title="Repositories"
            message={repoMessage}
            className={isDark ? "border-blue-900 bg-blue-950/40 text-blue-200" : ""}
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Code Review",
              description: "Paste code and run AI review.",
              onClick: () => navigate("/editor"),
              tone: "bg-slate-900 text-white hover:bg-slate-800",
            },
            {
              label: "Review History",
              description: "Open your saved review records.",
              onClick: () => navigate("/reviews"),
              tone: "bg-white text-slate-900 hover:bg-slate-50",
            },
            {
              label: "Repository Review",
              description: "Browse GitHub files and review them.",
              onClick: () => navigate("/repositories"),
              tone: "bg-white text-slate-900 hover:bg-slate-50",
            },
            {
              label: "Insights Dashboard",
              description: "Track issue and score trends.",
              onClick: () => navigate("/insights"),
              tone: "bg-white text-slate-900 hover:bg-slate-50",
            },
            {
              label: "Connect GitHub",
              description: "Authorize repo access for file review.",
              onClick: connectGithub,
              tone: "bg-blue-600 text-white hover:bg-blue-700",
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`rounded-3xl border p-5 text-left shadow-sm transition ${
                action.label === "Code Review" ||
                action.label === "Connect GitHub"
                  ? action.tone
                  : isDark
                    ? "border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : `border-slate-200 ${action.tone}`
              }`}
            >
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="mt-2 text-sm leading-6 opacity-80">{action.description}</p>
            </button>
          ))}
        </section>

        <section className={`rounded-3xl border p-5 shadow-sm ${mutedSurfaceClassName}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Need another GitHub account?
              </h2>
              <p className={`mt-1 text-sm leading-6 ${secondaryTextClassName}`}>
                Open GitHub login in a new tab, switch to the correct GitHub account there, then
                come back and click Connect GitHub.
              </p>
            </div>
            <a
              href="https://github.com/login"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition ${secondaryButtonClassName}`}
            >
              Open GitHub Login
            </a>
          </div>
        </section>

        <section className={`rounded-3xl border p-6 shadow-sm backdrop-blur ${dashboardSurfaceClassName}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Your GitHub Repositories
              </h2>
              <p className={`mt-2 text-sm leading-6 ${secondaryTextClassName}`}>
                Connected repositories appear here for quick access and repository review.
              </p>
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-medium ${badgeClassName}`}>
              {repos.length} repo{repos.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className={`mt-6 rounded-2xl border p-5 ${subtleSurfaceClassName}`}>
              <Spinner
                label="Loading repositories..."
                className={isDark ? "text-slate-300 [&>span:first-child]:border-slate-700" : ""}
              />
            </div>
          ) : repos.length === 0 ? (
            <div className={`mt-6 rounded-2xl border p-5 text-sm ${subtleSurfaceClassName} ${secondaryTextClassName}`}>
              No repositories found yet. Connect GitHub to sync your repositories here.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {repos.map((repo) => (
                <article
                  key={repo.id}
                  className={`rounded-3xl border p-5 transition ${
                    isDark
                      ? "border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {repo.name}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}>
                      {repo.private ? "Private" : "Public"}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${secondaryTextClassName}`}>
                    {repo.description || "No description available for this repository."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate("/repositories")}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Open Review
                    </button>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${secondaryButtonClassName}`}
                    >
                      View Repo
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
