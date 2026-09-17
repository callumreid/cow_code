/**
 * Everyone on the field who is not a cow: the farmer, and the office pets
 * from #moon-bean-appreciation, who run laps around the pens having a nice time.
 */
export type CritterKind = "dog" | "cat" | "farmer" | "wolf" | "pig"

export type Critter = {
  id: string
  name: string
  kind: CritterKind
  /** One line for the hover card. */
  blurb: string
  /** Coat colour; the farmer's is his hoodie. */
  body: string
  /** Second colour: a muzzle and chest for dogs, unused for cats. */
  patch?: string
  eyes: string
  /** Relative size; a cow is 1. */
  size: number
  /** floppy: hangs from the side. up: semi-erect with folded tips. point: a cat's. long: a spaniel's curls. */
  ears: "floppy" | "up" | "point" | "long"
  legs: "short" | "regular"
  /** A cocker spaniel is mostly fur. */
  fluffy?: boolean
  /** Cruising speed in field units per second. */
  speed: number
  /** Whose heels this one stays on. */
  follows?: string
}

export const FARMER_ID = "kobi"

export const CRITTERS: Critter[] = [
  {
    id: FARMER_ID,
    name: "Kobi",
    kind: "farmer",
    blurb: "The farmer. Walks the fences. Do not click.",
    body: "#1c1c1c",
    eyes: "#1d1917",
    size: 1,
    ears: "up",
    legs: "regular",
    speed: 1.6,
  },
  {
    id: "moon",
    name: "Moon",
    kind: "dog",
    blurb: "Kobi's queen. Blue coat, blue eyes, does NOT want to go on a walk.",
    body: "#5b5652",
    eyes: "#a9bcc8",
    size: 0.9,
    ears: "floppy",
    legs: "regular",
    speed: 3.4,
    follows: FARMER_ID,
  },
  {
    id: "bean",
    name: "Bean",
    kind: "dog",
    blurb: "Best dog in the office. Sits like a person. Famous for the bean lean.",
    body: "#e6d7bd",
    patch: "#f7f2ea",
    eyes: "#4a2e1c",
    size: 0.76,
    ears: "up",
    legs: "regular",
    speed: 3,
    follows: FARMER_ID,
  },
  {
    id: "waffles",
    name: "Waffles",
    kind: "dog",
    blurb: "Mallory's prince. Cocker spaniel, 21 pounds, every photo a renaissance painting.",
    body: "#e2cba0",
    patch: "#efe0c2",
    eyes: "#2b1d14",
    size: 0.52,
    ears: "long",
    legs: "regular",
    speed: 3.6,
    fluffy: true,
  },
  {
    id: "felix",
    name: "Felix",
    kind: "cat",
    blurb: "Office cat, north corner. Profoundly masculine.",
    body: "#141414",
    eyes: "#7bd389",
    size: 0.58,
    ears: "point",
    legs: "regular",
    speed: 2.8,
  },
  {
    id: "haru",
    name: "Haru",
    kind: "cat",
    blurb: "Office cat, south corner. It's her desk now.",
    body: "#181818",
    eyes: "#f0c419",
    size: 0.52,
    ears: "point",
    legs: "regular",
    speed: 3.2,
  },
]

/** He lives in the barn loft and only shows his face now and again. */
export const JOHN_PORK: Critter = {
  id: "john-pork",
  name: "John Pork",
  kind: "pig",
  blurb: "John Pork is calling. Do not answer.",
  body: "#f2b7b0",
  eyes: "#1d1917",
  size: 1,
  ears: "up",
  legs: "regular",
  speed: 0,
}

export const critterByID = (id: string) => (id === JOHN_PORK.id ? JOHN_PORK : CRITTERS.find((critter) => critter.id === id))

/** What the farmer says when you click him. He is busy. */
export const FARMER_LINES = [
  "Get back to work.",
  "Those PRs won't review themselves.",
  "I'm not paying you to click on me.",
  "Cows to move. Comments to resolve. Chop chop.",
  "Ship it. Then we'll talk.",
  "You've got three unresolved threads and you're poking a farmer?",
  "Queues are lookin' healthy. Your PR isn't.",
]
