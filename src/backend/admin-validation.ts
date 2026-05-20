import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Use a valid admin email."),
  password: z.string().min(1, "Password is required.").max(200)
});

export const adminMediaSchema = z.object({
  title: z.string().trim().min(1, "Project title is required.").max(120),
  category: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).max(80).default("Portrait")
  ),
  mediaType: z.preprocess(
    emptyStringToUndefined,
    z.enum(["Photo", "Video", "Gallery"]).default("Photo")
  ),
  description: z.string().trim().max(1000).default("")
});

export const projectStatusUpdateSchema = z.object({
  status: z.enum(["Draft", "Review", "Published", "Featured"])
});

export const contactMessageSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: z.string().trim().email("Use a valid email address.").max(160),
  phone: z.string().trim().max(40).default(""),
  service: z.string().trim().min(1, "Choose a service.").max(80),
  message: z.string().trim().min(10, "Message should be at least 10 characters.").max(1200)
});

export const portfolioReviewSchema = z.object({
  name: z.string().trim().max(80).default("Guest"),
  rating: z.coerce.number().int().min(1).max(5),
  note: z.string().trim().min(3, "Note should be at least 3 characters.").max(500)
});

export const messageStatusUpdateSchema = z.object({
  status: z.enum(["Unread", "Open", "Replied"])
});

export const siteSettingsSchema = z.object({
  homepage: z.object({
    heroVideoEnabled: z.boolean(),
    featuredProjectsEnabled: z.boolean(),
    ratingCommentsEnabled: z.boolean(),
    bookingCtaEnabled: z.boolean(),
    heroEyebrow: z.string().trim().min(1).max(80),
    heroHeadline: z.string().trim().min(1).max(80),
    heroSubtitle: z.string().trim().min(1).max(240),
    heroVideoUrl: z.string().trim().url().max(500),
    heroImageUrl: z.string().trim().url().max(500),
    heroPrimaryLabel: z.string().trim().min(1).max(80),
    heroSecondaryLabel: z.string().trim().min(1).max(80),
    featuredSectionTitle: z.string().trim().min(1).max(80),
    bookingCta: z.string().trim().min(1).max(80)
  }),
  channels: z.object({
    displayName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(160),
    instagram: z.string().trim().min(1).max(80),
    tiktok: z.string().trim().min(1).max(80)
  })
});

export function getValidationError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid request data.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Invalid request data.";
}
