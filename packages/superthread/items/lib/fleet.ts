// the fleet, in its order: generated from marks/fleet.json; edit the manifest, then run bun run build in packages/superthread
// desc is the line under a ship's name in the rail's tab. Each mark is a file name under the consumer's mark base;
// hrefs are the consumer's.

export const fleet = [
  {
    "id": "orbit",
    "name": "orbit",
    "desc": "tasks, direction and the agents' board",
    "angle": 45,
    "mark": {
      "light": "orbit.svg",
      "dark": "orbit-dark.svg"
    }
  },
  {
    "id": "quanta",
    "name": "quanta",
    "desc": "learning chapters",
    "angle": 90,
    "mark": {
      "light": "quanta.svg",
      "dark": "quanta-dark.svg"
    }
  },
  {
    "id": "trisys",
    "name": "trisys",
    "desc": "essays and decks",
    "angle": 27,
    "mark": {
      "light": "trisys.svg",
      "dark": "trisys-dark.svg"
    }
  },
  {
    "id": "constellation",
    "name": "constellation",
    "desc": "a personal graph",
    "angle": 63,
    "mark": {
      "light": "constellation.svg",
      "dark": "constellation-dark.svg"
    }
  },
  {
    "id": "artifacts",
    "name": "artifacts",
    "desc": "reports and documents",
    "angle": 135,
    "mark": {
      "light": "artifacts.svg",
      "dark": "artifacts-dark.svg"
    }
  },
  {
    "id": "soliton",
    "name": "soliton",
    "desc": "the server",
    "angle": 117,
    "mark": {
      "light": "soliton.svg",
      "dark": "soliton-dark.svg"
    }
  },
  {
    "id": "pilot",
    "name": "pilot",
    "desc": "a new star",
    "angle": 1,
    "mark": {
      "light": "pilot.svg",
      "dark": "pilot-dark.svg"
    }
  }
] as const

export type Ship = (typeof fleet)[number]
export type ShipId = Ship["id"]
