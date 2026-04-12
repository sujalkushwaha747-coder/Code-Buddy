import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ReviewResultsPanel from "../../editor/components/ReviewResultsPanel";
import type { StoredReviewResult } from "../../editor/api/review.api";
import PageHeader from "../../../components/ui/PageHeader";
import Spinner from "../../../components/ui/Spinner";
import StatusBanner from "../../../components/ui/StatusBanner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";
import {
  getRepos,
  getRepositoryFile,
  getRepositoryFiles,
  reviewRepositoryFile,
  type GithubRepository,
  type RepositoryFileContent,
  type RepositoryFileEntry,
} from "../../../services/github/githubService";

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Repositories = () => {
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepository | null>(null);
  const [files, setFiles] = useState<RepositoryFileEntry[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [currentFolderPath, setCurrentFolderPath] = useState("");
  const [selectedFile, setSelectedFile] = useState<RepositoryFileEntry | null>(null);
  const [fileContent, setFileContent] = useState<RepositoryFileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewResult, setReviewResult] = useState<StoredReviewResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setReposError("");
        const data = await getRepos();
        setRepos(data);
      } catch (error: any) {
        setReposError(getApiErrorMessage(error, "Failed to load GitHub repositories."));
      } finally {
        setReposLoading(false);
      }
    };

    loadRepositories();
  }, []);

  useEffect(() => {
    if (!selectedRepo) {
      return;
    }

    const loadRepositoryFiles = async () => {
      try {
        setFilesLoading(true);
        setFilesError("");
        setFiles([]);
        const response = await getRepositoryFiles(
          selectedRepo.owner.login,
          selectedRepo.name,
          currentFolderPath,
        );
        setFiles(response.data);
      } catch (error: any) {
        setFilesError(getApiErrorMessage(error, "Failed to load files and folders for this repository."));
      } finally {
        setFilesLoading(false);
      }
    };

    loadRepositoryFiles();
  }, [selectedRepo, currentFolderPath]);

  useEffect(() => {
    if (!selectedRepo || !selectedFile) {
      return;
    }

    const loadFileContent = async () => {
      try {
        setFileLoading(true);
        setFileError("");
        const response = await getRepositoryFile(
          selectedRepo.owner.login,
          selectedRepo.name,
          selectedFile.path,
        );
        setFileContent(response.data);
      } catch (error: any) {
        setFileContent(null);
        setFileError(getApiErrorMessage(error, "Failed to load the selected file content."));
      } finally {
        setFileLoading(false);
      }
    };

    loadFileContent();
  }, [selectedRepo, selectedFile]);

  const filteredFiles = useMemo(() => {
    const search = fileSearch.trim().toLowerCase();

    if (!search) {
      return files;
    }

    return files.filter((file) => file.path.toLowerCase().includes(search));
  }, [files, fileSearch]);

  const handleSelectRepository = (repo: GithubRepository) => {
    setSelectedRepo(repo);
    setCurrentFolderPath("");
    setFileSearch("");
    setFileError("");
    setFilesError("");
    setSelectedFile(null);
    setFileContent(null);
    setReviewResult(null);
    setReviewError("");
  };

  const openFolder = (path: string) => {
    setCurrentFolderPath(path);
    setSelectedFile(null);
    setFileContent(null);
    setReviewResult(null);
    setReviewError("");
    setFileError("");
  };

  const handleSelectEntry = (entry: RepositoryFileEntry) => {
    if (entry.type === "dir") {
      openFolder(entry.path);
      return;
    }

    setSelectedFile(entry);
    setReviewResult(null);
    setReviewError("");
  };

  const handleReviewSelectedFile = async () => {
    if (!selectedRepo || !selectedFile) {
      setReviewError("Select a repository file before running AI review.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError("");
      const response = await reviewRepositoryFile({
        owner: selectedRepo.owner.login,
        repo: selectedRepo.name,
        path: selectedFile.path,
      });

      setReviewResult(response.data);
    } catch (error: any) {
      setReviewResult(null);
      setReviewError(getApiErrorMessage(error, "Failed to review the selected repository file."));
    } finally {
      setReviewLoading(false);
    }
  };

  const breadcrumbSegments = currentFolderPath
    ? currentFolderPath.split("/").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Repository File Review"
          description="Choose a GitHub repository, inspect its files, fetch secure file content, and run AI review on a selected file. Repository-based reviews are saved separately in your history."
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

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_minmax(360px,0.95fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Repositories</h2>
                <p className="mt-1 text-sm text-slate-500">Select a repo to load its file tree.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {repos.length} repos
              </span>
            </div>

            {reposLoading ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Spinner label="Loading GitHub repositories..." />
              </div>
            ) : reposError ? (
              <StatusBanner tone="error" message={reposError} className="mt-4" />
            ) : repos.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No repositories found for the connected GitHub account.
              </div>
            ) : (
              <div className="mt-4 max-h-[42rem] space-y-3 overflow-auto pr-1">
                {repos.map((repo) => {
                  const isActive = selectedRepo?.id === repo.id;

                  return (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => handleSelectRepository(repo)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-blue-300 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{repo.name}</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-600">
                          {repo.private ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {repo.description || "No description available for this repository."}
                      </p>
                      <p className="mt-3 text-xs font-medium text-slate-400">{repo.full_name}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Repository Files</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedRepo
                      ? `Browsing ${selectedRepo.full_name}${currentFolderPath ? ` / ${currentFolderPath}` : ""}`
                      : "Choose a repository to fetch its files."}
                  </p>
                </div>

                <input
                  value={fileSearch}
                  onChange={(event) => setFileSearch(event.target.value)}
                  placeholder="Search file path"
                  disabled={!selectedRepo || filesLoading}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              {filesError ? <StatusBanner tone="error" message={filesError} className="mt-4" /> : null}

              {!selectedRepo ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Select a repository from the left panel to load its file list.
                </div>
              ) : filesLoading ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Spinner label="Fetching repository files..." />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {files.length === 0
                    ? "No files were returned for this repository."
                    : "No files matched your search."}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openFolder("")}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        currentFolderPath
                          ? "bg-slate-100 text-slate-600"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      Root
                    </button>
                    {breadcrumbSegments.map((segment, index) => {
                      const path = breadcrumbSegments.slice(0, index + 1).join("/");
                      const active = path === currentFolderPath;

                      return (
                        <button
                          key={path}
                          type="button"
                          onClick={() => openFolder(path)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {segment}
                        </button>
                      );
                    })}
                  </div>

                  <div className="max-h-80 space-y-2 overflow-auto pr-1">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFile?.path === file.path;
                    const isFolder = file.type === "dir";

                    return (
                      <button
                        key={file.sha || file.path}
                        type="button"
                        onClick={() => handleSelectEntry(file)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium">
                            {isFolder ? `${file.name}/` : file.name}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                              isSelected
                                ? "bg-white/15 text-slate-100"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isFolder ? "folder" : file.language}
                          </span>
                        </div>
                        <p
                          className={`mt-2 text-xs ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {file.path}
                        </p>
                        {!isFolder ? (
                          <p
                            className={`mt-1 text-xs ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {formatFileSize(file.size)}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Selected File Preview</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Open folders to browse deeper, then choose a file to preview and review.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReviewSelectedFile}
                  disabled={!selectedRepo || !selectedFile || fileLoading || reviewLoading}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {reviewLoading ? "Reviewing File..." : "Review Selected File"}
                </button>
              </div>

              {selectedRepo && selectedFile ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {selectedRepo.full_name}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {selectedFile.language}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              ) : null}

              {fileError ? <StatusBanner tone="error" message={fileError} className="mt-4" /> : null}

              {reviewError ? <StatusBanner tone="error" message={reviewError} className="mt-4" /> : null}

              {!selectedFile ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Choose a file from the repository browser to fetch and preview its code.
                </div>
              ) : fileLoading ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Spinner label="Loading file content..." />
                </div>
              ) : !fileContent ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  File content is not available yet.
                </div>
              ) : (
                <pre className="mt-4 max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                  <code>{fileContent.content}</code>
                </pre>
              )}
            </div>
          </section>

          <ReviewResultsPanel
            loading={reviewLoading}
            result={reviewResult}
            errorMessage={reviewError}
          />
        </div>
      </div>
    </div>
  );
};

export default Repositories;
