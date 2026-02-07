import { Command } from "commander";

export const helloCommand = new Command("hello")
  .description("Say hello to the user!")
  .option("-n, --name <name>", "Name to greet", "World")
  .action((opts) => helloHandler(opts));

export async function helloHandler(options: { name?: string }) {
  console.log(`Hello, ${options.name}`);
}
