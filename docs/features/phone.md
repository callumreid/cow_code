# 🚪 THE BARN DOOR

the whole barn on your phone, from anywhere, without a spinner.

this page is <https://github.com/callumreid/cow_code/blob/dev/docs/features/phone.md>.
🎬 the phone has its own segment in the [hype film](../../artifacts/hype-video/README.md).

## two ways in

**same network.** type `/qr` in the terminal, or hit ⌘K → connect phone in the
desktop app, and point your camera at one of the squares marked _same network_.
your phone has to be on the same wifi or tailnet as that mac, and the mac has to
be awake. good for the couch. useless on a walk.

**anywhere.** the barn door. the box (the mac mini that runs the cow all day) has
three things stacked in front of it:

- the **cow** itself, the server, on the box.
- a **gate** in front of it that only opens for a key. no key, no barn. the key
  rides in the link the first time and in a cookie after that (thirty days,
  refreshed every visit).
- a **tunnel** in front of the gate: a public https address on cloudflare that
  reaches the gate and nothing else. https, so the microphone works.

one link is the address plus the key. that link works on cellular, on hotel wifi,
in the line at the coffee place. it is the link this page is about.

## getting the link

- **the desktop app.** ⌘K → connect phone. the first square is now the door,
  labelled _the barn door · works anywhere_, with when it opened under it. the
  same-network squares are still there underneath.
- **the laptop.** `cow-phone-url` prints the current link and draws a QR.
- **the cow's DM.** whenever the address moves, the cow DMs you the new link:
  _the barn door moved: … open it once on your phone and re-add it to your home
  screen_. this is the one copy that stays right on its own. (the DMs start once
  Callum says yes to them; until then the box only watches and logs.)

the link is the key. it goes in a DM, never in a channel.

## park it on your home screen

1. open the link from the DM in safari (not in slack's built-in browser).
2. while the address bar still shows `?_cowcode_gate=…`, before you tap anything,
   hit share → add to home screen. call it cow code.
3. launch it from the icon. it walks in the door with the key.

why the fuss: a home-screen app is its own little browser with its own cookies,
so it has to carry the key on every launch, not just the first. the box hands the
phone a web-app manifest whose start address carries the key, and the page you
added from carries it too, so either way the icon comes in keyed.

when the address moves the icon dies, because it points at the old door. delete
it and add it again from the new DM link. that is the whole ritual.

## the screens you might see

- **this door needs its key.** you arrived without the key: an icon or a tab made
  from a page that had lost it, or a cookie that aged out. open the link from the
  cow's DM, or scan the square in the desktop app.
- **the cow is getting up, back in a moment.** the server is restarting, usually a
  deploy. the page retries itself every five seconds. wait.
- **could not reach the barn … retrying automatically.** the app loaded but the
  server is not answering: the box is down, its internet is down, or the door
  moved under you. it retries on its own. if it is a blip you are back in
  seconds; if not, check the DM for a new link.
- **a cloudflare page, error 1033.** that address does not exist any more. the
  door moved. check the DM.
- **a spinner that never ends.** you are on the retired address (below), or safari
  is nursing a dead tab. close it and open the DM link.

## when it breaks

nothing. the box checks the door every two minutes, from inside and from the
internet. if the tunnel is wedged (the box is online, the gate answers, the
internet does not, for five minutes) the box restarts the tunnel and DMs you the
new link. if the door has been shut for ten minutes you get a DM saying so; when
it opens again you get one more. if it stays broken the DM says that too, and
which piece it thinks is at fault: the box's internet, the tunnel, or the gate.
the daily box health DM counts a shut door as a problem.

what you do: open the newest link the cow sent you.

## the retired address

before the door there was a tailscale serve address for the mini (its `ts.net`
name, and the bare tailnet ip with a port). the work tailnet only lets ssh
through to the box, so those addresses never answer; safari spins on them for a
minute and then says the server stopped responding. that was the 2026-09-10
walk. delete their tabs and icons from your phone. the door is the only address
now.

## honest caveats

- **the address changes when the door restarts.** a box reboot or a tunnel
  restart hands out a new random address. every saved link, tab and icon from the
  old one dies; the DM has the new one within a minute.
- **a permanent address needs Callum.** either a domain (so the tunnel can have a
  name that stays put) or a change to the coval tailnet ACL (so the phone can
  reach the mini directly). the box cannot do either itself.
- **the box has to be awake and on the internet.** it sits on wifi (the
  ethernet port is empty), and its internet blips for a few seconds now and then;
  no tunnel setting survives the box losing its network. a cable helps more than
  any flag.

← back to [the feature reel](README.md)
