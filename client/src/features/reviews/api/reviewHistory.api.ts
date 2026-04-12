import API from "../../../services/api";
import {
  normalizeStoredReviewResult,
  type StoredReviewResult,
} from "../../editor/api/review.api";

export type ReviewHistoryItem = StoredReviewResult & {
  updatedAt: string;
};

type ReviewHistoryResponse = {
  success: boolean;
  message: string;
  data: ReviewHistoryItem[];
};

export const fetchReviewHistory = async () => {
  const response = await API.get<ReviewHistoryResponse>("/reviews/history");
  return {
    ...response.data,
    data: Array.isArray(response.data.data)
      ? response.data.data.map((review: any) => ({
          ...normalizeStoredReviewResult(review),
          updatedAt:
            typeof review?.updatedAt === "string"
              ? review.updatedAt
              : typeof review?.createdAt === "string"
                ? review.createdAt
                : new Date(0).toISOString(),
        }))
      : [],
  };
};
