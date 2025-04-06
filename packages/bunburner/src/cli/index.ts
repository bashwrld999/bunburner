#! /usr/bin/env bun

import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "BunBurner",
    description: "CLI to push files directly to bitburner using its remote API",
    version: "0.1.0",
  },
  subCommands: {
    dev: () => import("./commands/dev").then((r) => r.default),
    // build: () => import("./commands/build").then((r) => r.default),
    // prepare: () => import("./commands/prepare").then((r) => r.default),
    // task: () => import("./commands/task").then((r) => r.default),
  },
});

runMain(main);