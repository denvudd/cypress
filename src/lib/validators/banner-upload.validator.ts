import { z } from "zod";

export const BannerUploadValidator = z.object({
  banner: z.string({
    invalid_type_error: "Banner image is required",
  }).describe("Banner image"),
});

export type BannerUploadValidatorSchema = z.infer<typeof BannerUploadValidator>;
