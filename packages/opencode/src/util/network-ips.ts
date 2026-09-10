import { networkInterfaces } from "os"

// Ranks LAN addresses phones are most likely to reach: home/office subnets
// first, then CGNAT space (Tailscale et al), then anything else.
function rank(address: string) {
  if (address.startsWith("192.168.") || address.startsWith("10.")) return 0
  if (isCgnat(address)) return 1
  return 2
}

function isCgnat(address: string) {
  const second = Number(address.split(".")[1])
  return address.startsWith("100.") && second >= 64 && second <= 127
}

export function getNetworkIPs() {
  const nets = networkInterfaces()
  const results: string[] = []

  for (const name of Object.keys(nets)) {
    const net = nets[name]
    if (!net) continue

    for (const netInfo of net) {
      // Skip internal and non-IPv4 addresses
      if (netInfo.internal || netInfo.family !== "IPv4") continue

      // Skip Docker bridge networks (typically 172.x.x.x)
      if (netInfo.address.startsWith("172.")) continue

      results.push(netInfo.address)
    }
  }

  return results.sort((a, b) => rank(a) - rank(b))
}
