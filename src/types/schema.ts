import z from "zod";

export const CommandSchema = z.object({
  name: z.string(),
  options: z.array(z.string()),
  args: z.array(z.string()),
  action: z.string(),
});

export const CommandBodySchema = z.object({
  label: z.string().optional(),
  version: z.string(),
  commands: z.array(CommandSchema),
});

export const RegistrySchema = z.object({
  name: z.string(),
  body: z.array(CommandBodySchema),
});

export type Command = z.infer<typeof CommandSchema>;
export type CommandBody = z.infer<typeof CommandBodySchema>;
export type registrySchema = z.infer<typeof RegistrySchema>;
