import { Show } from "solid-js"
import { useOffice } from "../context"
import { VoiceStrip } from "./strip"

export const OfficeVoice = () => {
  const office = useOffice()
  return (
    <Show when={office.voice()}>
      <VoiceStrip
        token={office.voiceToken}
        ask={(text, id) =>
          /^(?:(?:what(?:'s| is) (?:the )?)?status|status update|how many (?:tasks|workers)(?: are running)?)[?.!]*$/i.test(
            text.trim(),
          )
            ? office.status()
            : office.admitVoice(text, id)
        }
        attention={office.setAttention}
        catchUp={office.catchUp}
        subscribeOutcomes={office.onOutcome}
        current={office.outcomeCurrent}
        acknowledge={office.acknowledgeOutcome}
        onStop={() => office.setVoice(false)}
      />
    </Show>
  )
}
