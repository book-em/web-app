import type { AxiosResponse } from "axios";
import { axiosInstanceRatings } from "./util"; 

export type RatingTargetType = "host" | "room";

export interface CreateRatingDTO {
  score: number;
  comment?: string;
}

export interface RatingDTO {
  username: string;
  score: number;
  comment: string;
  time: string;
}

export interface RatingsWithAverageDTO {
  average: number;
  ratings: RatingDTO[];
}

export class RatingAPI {
  static getRatingsWithAvg(id: number | string, type: RatingTargetType): Promise<AxiosResponse<RatingsWithAverageDTO>> {
    return axiosInstanceRatings.get(`/ratings/all/${id}`, {params: { type },});
  }

  static createOrUpdateRating(targetId: number | string, type: RatingTargetType, data: CreateRatingDTO): Promise<AxiosResponse<unknown>> {
    return axiosInstanceRatings.post(`/ratings/${targetId}`, data, {params: { type },});
  }

  static deleteMyRating(targetId: number | string, type: RatingTargetType): Promise<AxiosResponse<void>> {
    return axiosInstanceRatings.delete(`/ratings/${targetId}`, {params: { type },});
  }
}
