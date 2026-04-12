import axios from "axios";

export const fetchUserRepos = async (githubToken: string) => {
  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${githubToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching GitHub repos:", error.message);
    throw new Error("Failed to fetch repositories");
  }
};
