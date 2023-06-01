import z from "zod";

export interface UpdatePostInputDTO {
  token: string;
  idPostToEdit: string;
  content: string;
}

export interface UpdatePostOutputDTO {
  message: string;
  post: {
    id: string;
    creatorId: string;
    content: string;
    createdAt: string;
    likes: number;
  };
}

export const UpdaterPostSchema = z
  .object({
    token: z.string().min(1),
    idPostToEdit: z.string(),
    content: z.string().min(4),
  })
  .transform((data) => data as UpdatePostInputDTO);