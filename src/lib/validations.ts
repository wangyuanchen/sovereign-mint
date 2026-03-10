import { z } from "zod";

// Form validation schemas
export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  background: z.string().optional(),
});

export const roadmapItemSchema = z.object({
  quarter: z.string().min(1, "Quarter is required"),
  year: z.string().min(1, "Year is required"),
  milestones: z.string().min(1, "Milestones are required"),
});

export const generateFormSchema = z.object({
  // Section 1 - Basics
  projectName: z.string().min(1, "Project name is required"),
  tagline: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  problemStatement: z.string().optional(),
  solution: z.string().optional(),
  targetAudience: z.string().optional(),

  // Section 2 - Token (optional)
  hasToken: z.boolean().default(false),
  tokenName: z.string().optional(),
  tokenSymbol: z.string().optional(),
  totalSupply: z.string().optional(),
  tokenDistribution: z.string().optional(),
  tokenUtility: z.string().optional(),

  // Section 3 - Team (optional)
  teamMembers: z.array(teamMemberSchema).optional(),

  // Section 4 - Roadmap
  roadmap: z.array(roadmapItemSchema).optional(),

  // Section 5 - Output preference
  model: z.string().optional(), // AI model to use
  outputType: z.enum(["whitepaper", "landing_page"]).default("whitepaper"),
  language: z.enum(["english", "chinese", "both"]).default("english"),
});

export type GenerateFormData = z.infer<typeof generateFormSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type RoadmapItem = z.infer<typeof roadmapItemSchema>;
