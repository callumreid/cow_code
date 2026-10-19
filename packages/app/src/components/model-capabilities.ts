/** Missing provider-specific metadata is unknown, never assumed from a model name. */
export function imageCapability(
  model:
    | {
        capabilities?: { input: { image?: boolean } | readonly string[] }
        modalities?: { input?: readonly string[] }
      }
    | undefined,
): "supported" | "unsupported" | "unknown" {
  const input = model?.capabilities?.input
  if (Array.isArray(input)) return input.includes("image") ? "supported" : "unsupported"
  if (input && "image" in input && typeof input.image === "boolean") return input.image ? "supported" : "unsupported"
  if (model?.modalities?.input) return model.modalities.input.includes("image") ? "supported" : "unsupported"
  return "unknown"
}
