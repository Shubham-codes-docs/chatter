import { z } from "zod";

export const sendMessageSchema = z.object({
  tempId: z.string().optional(),
  conversationId: z.string().min(1, "Conversation ID is required"),
  content: z.string().min(1, "Content is required"),
  type: z
    .enum(["text", "image", "file", "audio", "video"])
    .optional()
    .default("text"),
  replyToId: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
});

export const markReadSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const messageDeliveredSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  messageId: z.string().min(1, "Message ID is required"),
});

export type SendMessagePayload = z.infer<typeof sendMessageSchema>;
export type MarkReadPayload = z.infer<typeof markReadSchema>;
export type MarkDeliveredPayload = z.infer<typeof messageDeliveredSchema>;
