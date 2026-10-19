/** One canonical collection shared by both supported runtimes. User skills may override it. */
export const builtins = [
  {
    name: "cow-plan",
    description: "Turn a substantial task into a concrete implementation plan with milestones and validation.",
    content:
      "Read the applicable repository instructions and inspect the existing implementation. State the desired behavior, identify the smallest useful milestones, and explain how each will be verified. Identify dependencies and work that can run in parallel. Distinguish facts, assumptions and decisions. Respect the user's requested scope and approval requirements. Do not make code changes unless requested.",
  },
  {
    name: "cow-investigate",
    description: "Investigate a bug using a reproducible baseline, evidence and a focused fix.",
    content:
      "Read the applicable repository instructions. Reproduce the reported behavior on an explicit baseline revision before changing code. Trace inputs, state and failures to the owning source. Preserve user work and credentials. Make the smallest fix supported by the evidence, add a regression test that fails before the fix, and verify the result. Report observed facts separately from remaining uncertainty. Do not deploy or send external messages without the required authorization.",
  },
  {
    name: "cow-verify",
    description: "Check a completed change against its original goal and exercise the actual user workflow.",
    content:
      "Read the user's goal and applicable repository instructions, inspect the final diff and run the relevant checks. Verify the actual workflow when practical, including failure paths, missing values, cancellation and recovery. Inspect browser or runtime evidence instead of treating successful compilation as proof of behavior. Report what was tested, the result, and material gaps. Never claim a deployment, send, or live outcome from a local check alone.",
  },
] as const
