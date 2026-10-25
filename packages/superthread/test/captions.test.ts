import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Caption keys: every textured place the site captions has a key, as each component detail does, so a page prints
// its caption from the package by key instead of writing its own. The details' captions are the world's own
// (tokens/details.json); the places' are the package's (texture/places.json), each linked to the world's place by name.

const root = join(import.meta.dir, "..");
const json = (rel: string) => JSON.parse(readFileSync(join(root, rel), "utf8"));

type Caption = { key: string; detail: string; job: string };
const details: (Caption & { component: string })[] = json("tokens/details.json").DETAILS;
const places: (Caption & { place: string })[] = json("texture/places.json").places;
const worldPlaces: string[] = json("tokens/master.json").texture.places;

test("every place the world screens has a caption key, in the world's order", () => {
  const detailNames = new Set(details.map((d) => `${d.component}: ${d.detail}`));
  // a world place reads "<name> (<note>)"; the component details are listed beside the five places
  const names = worldPlaces.filter((place) => !detailNames.has(place)).map((place) => place.replace(/ \(.*\)$/, ""));
  expect(names).toHaveLength(5);
  expect(places.map((p) => p.place)).toEqual(names);
});

test("the progress edge takes the key its utility names, texture-ramp", () => {
  expect(places.find((p) => p.place === "state fields")).toMatchObject({ key: "ramp", detail: "progress edge" });
});

test("caption keys are unique across places and details, and every caption is lowercase words", () => {
  const all: Caption[] = [...details, ...places];
  const keys = all.map((c) => c.key);
  expect(new Set(keys).size).toBe(keys.length);
  for (const { key, detail, job } of all) {
    expect(key).toMatch(/^[a-z][a-z-]*$/);
    expect({ key, detail, job }).toEqual({ key, detail: detail.toLowerCase(), job: job.toLowerCase() });
    expect(detail.length * job.length).toBeGreaterThan(0);
    expect(`${detail} ${job}`).not.toMatch(/—/);
  }
});
