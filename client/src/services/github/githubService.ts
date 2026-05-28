import API from "../api";
import {
  normalizeStoredReviewResult,
  type ReviewApiResponse,
} from "../../features/editor/api/review.api";
import {
  normalizeDebugResult,
  type DebugResult,
} from "../../features/editor/api/debug.api";

export type GithubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  owner: {
    login: string;
  };
};

export type RepositoryFileEntry = {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  language: string;
};

export type RepositoryFileContent = {
  name: string;
  path: string;
  sha: string;
  size: number;
  language: string;
  content: string;
};

type RepositoryFilesResponse = {
  success: boolean;
  message: string;
  data: RepositoryFileEntry[];
};

type RepositoryFileResponse = {
  success: boolean;
  message: string;
  data: RepositoryFileContent;
};

type RepositoryDebugResponse = {
  success: boolean;
  message: string;
  data: DebugResult;
};

export const getRepos = async () => {
  const response = await API.get<GithubRepository[]>("/github/repos");
  return response.data;
};

export const getRepositoryFiles = async (
  owner: string,
  repo: string,
  path = "",
) => {
  const response = await API.get<RepositoryFilesResponse>(
    `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/files`,
    {
      params: {
        path,
      },
    },
  );

  return response.data;
};

export const getRepositoryFile = async (
  owner: string,
  repo: string,
  path: string,
) => {
  const response = await API.get<RepositoryFileResponse>(
    `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file`,
    {
      params: {
        path,
      },
    },
  );

  return response.data;
};

export const reviewRepositoryFile = async (payload: {
  owner: string;
  repo: string;
  path: string;
}) => {
  const response = await API.post<ReviewApiResponse>("/repositories/review-file", payload);
  return {
    ...response.data,
    data: normalizeStoredReviewResult(response.data.data),
  };
};

export const debugRepositoryFile = async (payload: {
  owner: string;
  repo: string;
  path: string;
}) => {
  const response = await API.post<RepositoryDebugResponse>("/repositories/debug-file", payload);
  return {
    ...response.data,
    data: normalizeDebugResult(response.data.data),
  };
};
