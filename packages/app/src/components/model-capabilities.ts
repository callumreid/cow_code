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

type Model = NonNullable<Parameters<typeof imageCapability>[0]> & {
  id: string
  name: string
  provider: { id: string }
  capabilities?: {
    input: { image?: boolean } | readonly string[]
    output?: { text?: boolean } | readonly string[]
    toolcall?: boolean
    tools?: boolean
  }
  modalities?: { input?: readonly string[]; output?: readonly string[] }
}

/** Suggest models that can continue this coding conversation, including tools. */
export function imageModelSuggestions<T extends Model>(
  models: readonly T[],
  current: { provider: { id: string } } | undefined,
  recent: readonly ({ id: string; provider: { id: string } } | undefined)[] = [],
) {
  const order = new Map(recent.flatMap((model, index) => (model ? [[`${model.provider.id}/${model.id}`, index]] : [])))
  return models
    .filter((model) => {
      if (imageCapability(model) !== "supported") return false
      if ((model.capabilities?.toolcall ?? model.capabilities?.tools) !== true) return false
      const output = model.capabilities?.output
      if (Array.isArray(output)) return output.includes("text")
      if (output && "text" in output && typeof output.text === "boolean") return output.text
      return model.modalities?.output?.includes("text") ?? true
    })
    .sort(
      (a, b) =>
        Number(b.provider.id === current?.provider.id) - Number(a.provider.id === current?.provider.id) ||
        (order.get(`${a.provider.id}/${a.id}`) ?? Infinity) - (order.get(`${b.provider.id}/${b.id}`) ?? Infinity) ||
        a.name.localeCompare(b.name) ||
        a.provider.id.localeCompare(b.provider.id),
    )
    .slice(0, 3)
}
