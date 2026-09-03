import type { Component } from "solid-js"
import { SelectV2 } from "@opencode-ai/ui/v2/select-v2"
import { TextInputV2 } from "@opencode-ai/ui/v2/text-input-v2"
import { useSettings } from "@/context/settings"
import { useServerSDK } from "@/context/server-sdk"
import { setAutonomy } from "@/office/api"
import { SettingsListV2 } from "./parts/list"
import { SettingsRowV2 } from "./parts/row"
import "./settings-v2.css"

export const OFFICE_VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse", "marin", "cedar"]

const autonomyOptions: { value: "brief" | "act"; label: string }[] = [
  { value: "brief", label: "Brief me" },
  { value: "act", label: "Act for me" },
]

export const SettingsOfficeV2: Component = () => {
  const settings = useSettings()
  const sdk = useServerSDK()
  return (
    <div class="settings-v2-section">
      <h3 class="settings-v2-section-title">Farmer's Office</h3>
      <SettingsListV2>
        <SettingsRowV2 title="Voice model" description="The OpenAI realtime model the farmer speaks with.">
          <div class="w-full sm:w-[220px]">
            <TextInputV2
              data-action="settings-office-voice-model"
              type="text"
              appearance="base"
              value={settings.office.voiceModel()}
              onInput={(event) => settings.office.setVoiceModel(event.currentTarget.value)}
              placeholder="gpt-realtime-2.1"
              spellcheck={false}
              autocorrect="off"
              autocomplete="off"
              autocapitalize="off"
              aria-label="Voice model"
            />
          </div>
        </SettingsRowV2>
        <SettingsRowV2 title="Voice" description="How the farmer sounds in voice mode.">
          <SelectV2
            appearance="inline"
            data-action="settings-office-voice"
            options={OFFICE_VOICES}
            current={OFFICE_VOICES.find((voice) => voice === settings.office.voice()) ?? settings.office.voice()}
            placement="bottom-end"
            gutter={6}
            value={(voice) => voice}
            label={(voice) => voice}
            onSelect={(voice) => voice && settings.office.setVoice(voice)}
          />
        </SettingsRowV2>
        <SettingsRowV2
          title="Autonomy"
          description="Brief: the farmer reports and waits for you. Act: it also answers routine permissions and questions itself."
        >
          <SelectV2
            appearance="inline"
            data-action="settings-office-autonomy"
            options={autonomyOptions}
            current={autonomyOptions.find((option) => option.value === settings.office.autonomy())}
            placement="bottom-end"
            gutter={6}
            value={(option) => option.value}
            label={(option) => option.label}
            onSelect={(option) => {
              if (!option) return
              settings.office.setAutonomy(option.value)
              // The farmer enforces autonomy server-side; the setting is mirrored there.
              void setAutonomy(sdk(), option.value).catch(() => undefined)
            }}
          />
        </SettingsRowV2>
      </SettingsListV2>
    </div>
  )
}
