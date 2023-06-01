import z from "zod";

export interface CreatePostInputDTO {
  token: string;
  creatorId: string;
  content: string;
}

export interface CreatePostOutputDTO {
  message: string;
  post: {
    id: string;
    creatorId: string;
    content: string;
    createdAt: string;
    likes: number;
  };
}

export const CreatePostSchema = z
  .object({
    token: z.string().min(1),
    creatorId: z.string(),
    content: z.string().min(4),
  })
  .transform((data) => data as CreatePostInputDTO);