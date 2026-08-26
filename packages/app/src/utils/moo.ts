import { showToast } from "@/utils/toast"
import { playSoundById } from "@/utils/sound"

export const moo = () => {
  showToast("mooooo")
  void playSoundById("moo-01")
}
