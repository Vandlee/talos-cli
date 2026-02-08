#!/usr/bin/env node

import { Command } from "commander";
import { helloCommand } from "./commands/hello";

import packageJson from "../package.json";
import { executeCommand } from "./commands/e";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main() {
  const program = new Command()
    .name("talos")
    .description("Manage everything.")
    .version(
      packageJson.version || "1.0.0",
      "-v, --version",
      "display the version number",
    )
    .enablePositionalOptions();

  program.addCommand(helloCommand);
  program.addCommand(executeCommand);

  program.parse();
}

main();
