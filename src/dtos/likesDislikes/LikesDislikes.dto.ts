import z from "zod";

export interface LikesDislikesInputDTO {
  userId: string;
  postId: string;
  like: number
}

export interface LikesDislikesOutputDTO {
  userId: string;
  postId: string;
  like: number
}

export const LikesDislikesSchema = z
  .object({
    userId: z.string().min(3), 
    postId: z.string().min(3), 
    like: z.number().max(1).default(0), 
  })
  .transform((data) => data as LikesDislikesInputDTO);