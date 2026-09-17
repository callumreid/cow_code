# 🐄 THE PASTURE

<div align="center">

<img src="pasture/pasture-pens.gif" alt="the pasture: cows in five pens, the hand of god lifting one into the next pen" width="840" />

### ▶️ [WATCH THE FILM WITH SOUND](https://cdn.jsdelivr.net/gh/callumreid/cow_code@dev/docs/features/pasture/pasture-pens.mp4) ▶️

*17 seconds. a real mooo. the hand of god makes an appearance.*

</div>

**share it:** the film plays in any browser at
<https://cdn.jsdelivr.net/gh/callumreid/cow_code@dev/docs/features/pasture/pasture-pens.mp4>
(github's own file page only offers a download for videos: <https://github.com/callumreid/cow_code/blob/dev/docs/features/pasture/pasture-pens.mp4>).
this page is <https://github.com/callumreid/cow_code/blob/dev/docs/features/pasture.md>.

## what you are looking at

a green field under the farmer's office in the sidebar. five fenced pens with
wooden signs and live headcounts:

| pen | who grazes there |
| --- | --- |
| **drafts** | your draft pull requests |
| **awaiting review** | open, not a draft, nobody has approved yet (also where "checks not green" and "unresolved comments" wait) |
| **changes requested** | a reviewer asked for changes, or you asked them to look again |
| **ready to merge** | approved, green, nothing unresolved, or already in the merge queue |
| **merged** | out back with the pond. today by default; the header switches it to this week, this month, this quarter, or any number of days |

only your own pull requests. never everyone's.

## the cows

one cow per pull request. thirty-two breeds — hereford, belted galloway, brahman,
angus, highland, holstein, jersey, texas longhorn, ankole-watusi, nguni, chianina,
dexter and twenty more — with coats painted on the fly onto one texture atlas per
breed, so a few hundred fit in a frame. the breed is decided by the PR itself, so
the same PR is always the same cow, and it keeps its markings as it moves from pen
to pen. every cow wears your collar, with a brass bell. they wander, graze, flick
their tails and stay out of the pond.

- **hover** a cow: its PR, repo and number, and what is holding it up.
- **click** a cow: it is lifted into the air, legs dangling, and the inspector
  opens with the PR, its stage, review and CI state, when it was opened and
  updated, and for merged cows who merged it, when, and the diff size.
- **double-click**: opens the PR on github.
- **moo**: a button on the selected cow. it mooos. pitched by breed size, so a
  dexter squeaks and a chianina rumbles. **moo on move** in the header makes every
  cow moo as the hand of god picks it up.
- **drag** to look around, scroll to zoom. escape puts the cow down.
- a cow in the **merge queue** hovers off the grass and turns slowly until its turn.

## the hand of god

when a pull request changes stage, the hand of god descends from the sky, curls its
fingers round the cow, lifts it, carries it in an arc to its new pen and sets it
down. a brand-new PR is lowered in from above. a merged one is carried out back.
one time in ten a **flying saucer** turns up instead and does the job with a tractor
beam. a PR **closed without merging** is a cow that catches fire where it stands:
it chars, collapses into the grass and leaves a scorch mark that fades.

a cow whose PR just vanished from the open list waits in its pen for a few minutes
so github's merged search can catch up; that way a merge reads as a move to the back
pen, not a disappearance. if a whole herd changes at once (you switched the
timeframe), the field just updates. the hand is for moments, not migrations.

## the residents

kobi the farmer walks the fences with a pitchfork, moon and bean at his heels. click
him and he tells you to get back to work. waffles, felix and haru run laps around the
pens having a nice time; hover any of them for an introduction. john pork lives in
the barn loft and shows his face at the window now and again.

when a datadog monitor goes into alert, a **wolf** comes out of the trees and prowls
the fence line until it clears (up to eight; hover for the monitor, click to open
it). when an alert clears, moon or bean chases the wolf off.

## the sky, the city, the party

the sky over the field is san francisco's: the sun sits where it really is and the
light and shadows follow it, the colours run night to golden hour to day, stars and
a moon come out, clouds thicken with the cloud cover, and it rains on the field
when it rains in the city. off past the barn are the bay, the skyline and the golden
gate bridge; this is a farm, so they are a long way off.

when the team has an **event** on (the coval luma calendar), the barn doors swing
open fifteen minutes early and inside there is a disco ball: beams sweeping, lights
twinkling across the floor and out over the grass, bulbs blinking along the eave.

## the tour

**tour** in the header turns the camera loose like a screensaver: a slow push in on
each pen, a low pass along the fences, a look at the barn, back out wide. touch it
and it holds still for a minute. every fifteen minutes of tour it is **UPSIDEDOWN
TIME**: the world rolls over, every cow falls off the earth into the sky, it fades
to black, and the tour carries on as if nothing happened.

## where it comes from

- the open pens are fed by the same github data as the pull requests panel, re-read
  every minute while the field is open.
- the merged pen is a github search for your merged PRs in the timeframe, refreshed
  every couple of minutes.
- closed PRs, firing alerts and the event on right now are read by the desktop on the
  field's behalf. alerts and the calendar feed come from `~/.config/cow/pasture.json`
  (`datadog.apiKey`/`appKey`/`site`/`query`, `eventsIcs`, or a hand-written `events`
  list) or the same-named environment variables; without them there are no wolves and
  no party, and everything else still works.
- the weather is open-meteo, read straight from the app every ten minutes; the sun is
  arithmetic.
- everything is drawn with three.js from primitives and canvas textures. there are
  no model files to ship. the same field, for a whole team on a tv, lives at
  <https://github.com/callumreid/pasture>.

← back to [the feature reel](README.md)
