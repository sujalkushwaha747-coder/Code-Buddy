import axios from "axios";

import { debugCode } from "./debug.service";
import { reviewRepositoryFileAndStore } from "./review.service";

type GithubTreeItem = {
  path: string;
  sha: string;
  size?: number;
  type: string;
};

type GithubContentItem = {
  name: string;
  path: string;
  sha: string;
  size?: number;
  type: string;
};

const buildGithubHeaders = (githubToken: string) => ({
  Authorization: `token ${githubToken}`,
  Accept: "application/vnd.github+json",
});

const encodeRepositoryPath = (filePath: string) =>
  filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const inferLanguageFromPath = (filePath: string) => {
  const extension = filePath.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "java":
      return "java";
    case "cpp":
    case "cc":
    case "cxx":
    case "hpp":
    case "h":
      return "cpp";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "html":
      return "html";
    case "css":
      return "css";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    default:
      return "plaintext";
  }
};

export const fetchRepositoryFiles = async (
  owner: string,
  repo: string,
  githubToken: string,
  directoryPath = "",
) => {
  const encodedPath = directoryPath ? `/${encodeRepositoryPath(directoryPath)}` : "";
  const response = await axios.get(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${encodedPath}`,
    {
      headers: buildGithubHeaders(githubToken),
    },
  );

  if (!Array.isArray(response.data)) {
    throw new Error("The selected path is a file, not a folder");
  }

  const contents: GithubContentItem[] = response.data;

  return contents
    .map((item) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size ?? 0,
      type: item.type,
      language: item.type === "file" ? inferLanguageFromPath(item.path) : "folder",
    }))
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.path.localeCompare(b.path);
      }

      if (a.type === "dir") {
        return -1;
      }

      if (b.type === "dir") {
        return 1;
      }

      return a.path.localeCompare(b.path);
    });
};

export const fetchRepositoryFileContent = async (
  owner: string,
  repo: string,
  filePath: string,
  githubToken: string,
) => {
  const encodedPath = encodeRepositoryPath(filePath);
  const response = await axios.get(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`,
    {
      headers: buildGithubHeaders(githubToken),
    },
  );

  if (Array.isArray(response.data)) {
    throw new Error("The selected path is a directory, not a file");
  }

  const encoding = response.data?.encoding;
  const rawContent = response.data?.content;

  if (typeof rawContent !== "string" || encoding !== "base64") {
    throw new Error("GitHub did not return readable file content for this file");
  }

  const content = Buffer.from(rawContent, "base64").toString("utf8");

  return {
    name: response.data?.name || filePath.split("/").pop() || filePath,
    path: filePath,
    sha: response.data?.sha || "",
    size: response.data?.size || content.length,
    language: inferLanguageFromPath(filePath),
    content,
  };
};

export const reviewRepositoryFile = async (
  userId: string,
  owner: string,
  repo: string,
  filePath: string,
  githubToken: string,
) => {
  const file = await fetchRepositoryFileContent(owner, repo, filePath, githubToken);

  const storedReview = await reviewRepositoryFileAndStore({
    userId,
    owner,
    repo,
    path: filePath,
    code: file.content,
    language: file.language,
  });

  return {
    file,
    review: storedReview,
  };
};

export const debugRepositoryFile = async (
  owner: string,
  repo: string,
  filePath: string,
  githubToken: string,
) => {
  const file = await fetchRepositoryFileContent(owner, repo, filePath, githubToken);
  const debug = await debugCode(file.content, file.language);

  return {
    file,
    debug,
  };
};
