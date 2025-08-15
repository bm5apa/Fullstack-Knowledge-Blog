import { z } from "zod";

export const postInput = z.object({
  title: z.string().min(1, "title required").max(120),
  content: z.string().min(1, "content required"),
  published: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional().default([]),
});
export type PostInput = z.infer<typeof postInput>;
export const postPatchInput = postInput.partial();
