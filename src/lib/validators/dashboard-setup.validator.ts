import { z } from "zod";

export const DashboardSetupValidator = z.object({
  workspaceName: z.string().min(1, { message: "Workspace name is required" }),
  logo: z.any(),
});

export type DashboardSetupValidatorScheme = z.infer<
  typeof DashboardSetupValidator
>;
