import { createSignal } from "solid-js"

// Whether the Farmer's Office panel is open, readable from anywhere without the
// office context: the notification layer uses it to stay quiet while the farmer
// is already surfacing every thread event as a card.
const [officeOpen, setOfficeOpen] = createSignal(false)

export { officeOpen, setOfficeOpen }
