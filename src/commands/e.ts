import { input, select } from "@inquirer/prompts";
import cliSpinners from "cli-spinners";
import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import { findLocalCommandFile } from "../utils/files";
import { isPlaceholder } from "../utils/isPlaceholder";
import { parseExtras } from "../utils/parseExtras";

export const executeCommand = new Command("e")
  .description("Execute a command")
  .argument("<name>", "Name of the command")
  .argument("[extras...]", "Additional arguments and options")
  .allowUnknownOption()
  .passThroughOptions()
  .action((name, extras, opts) => executeHandler(name, opts, extras));

export async function executeHandler(
  name: string,
  options: any,
  extras?: string[],
) {
  const environment = await select({
    message: "Where does Talos need to look for the command?",
    choices: [
      { name: "Local", value: "local" },
      { name: "Internet", value: "internet" },
    ],
  });

  await findCommand(name, environment, { ...options, extras });
}

async function findCommand(name: string, environment: string, options: any) {
  if (environment === "local") {
    await findLocalCommand(name, options);
  } else if (environment === "internet") {
    console.log(`Looking for ${name} on the internet...`);
    // Implement internet command lookup logic here
  }
}

async function findLocalCommand(name: string, cliOptions: any = {}) {
  const searchCommandSpinner = ora({
    text: "Looking for command locally...",
    spinner: {
      frames: cliSpinners.circleHalves.frames,
      interval: 80,
    },
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation

  try {
    const file = await findLocalCommandFile(name);

    if (!file) {
      searchCommandSpinner.fail("Command not found locally.");
      return;
    }

    searchCommandSpinner.succeed("Command found locally.");

    if (file.body.length <= 0) {
      searchCommandSpinner.fail("No versions found for this command.");
      return;
    }

    let selectedVersion = file.body[0]; // Default to the first version

    if (file.body.length > 1) {
      const version = await select({
        message: "Select a command version to execute:",
        choices: file.body.map((cmd) => ({
          name: `${cmd.version}${cmd.label ? ` - ${cmd.label}` : ""}`,
          value: cmd,
        })),
      });

      selectedVersion = version || selectedVersion;
    }

    // Build CLI args from extras while prompting for missing values defined in the registry.
    const baseCliArgs: string[] = [];
    const extras = Array.isArray(cliOptions.extras) ? cliOptions.extras : [];

    const knownOptions = new Set(
      selectedVersion.commands.flatMap((cmd) => cmd.options),
    );
    const parsed = parseExtras(extras, knownOptions);

    // Preserve provided flags, unknown flags, and positional args as-is.
    const existingFlags = new Set(parsed.flags.map((item) => item.flag));
    for (const item of parsed.flags) {
      baseCliArgs.push(item.flag);
      if (item.value !== null) {
        baseCliArgs.push(item.value);
      }
    }
    baseCliArgs.push(...parsed.unknownTokens);
    baseCliArgs.push(...parsed.positionals);

    for (const cmd of selectedVersion.commands) {
      // Prompt for missing positional args (placeholders like <host> or [host]).
      const filledArgs: string[] = [];
      const placeholders = cmd.args.filter((arg) => isPlaceholder(arg));
      const defaults = cmd.args.filter((arg) => !isPlaceholder(arg));

      for (const placeholder of placeholders) {
        const label = placeholder.replace(/[\[\]<>]/g, "").trim() || "value";
        const value = await input({
          message: `What argument are you gonna send? (${label})`,
        });
        filledArgs.push(value);
      }

      filledArgs.unshift(...defaults);

      // Prompt for known options that are missing in the CLI.
      const cmdCliArgs = [...baseCliArgs];

      if (cmd.options.length > 0) {
        const hasProvided = cmd.options.some((option) =>
          existingFlags.has(option),
        );
        if (!hasProvided) {
          const primaryOption = cmd.options[0];
          const value = await input({
            message: `What do you want to use for "${primaryOption}" argument?`,
            default: "",
          });

          if (value !== "") {
            cmdCliArgs.push(primaryOption, value);
          }
        }
      }

      for (const cmd of selectedVersion.commands) {
        const commandSpinner = ora({
          text: `Executing command: ${cmd.name}...`,
          spinner: {
            frames: cliSpinners.circleHalves.frames,
            interval: 80,
          },
        }).start();

        try {
          commandSpinner.stop();

          // Merge JSON args with CLI args
          const mergedArgs = [...filledArgs, ...cmdCliArgs];

          console.log(`\n$ ${cmd.action} ${mergedArgs.join(" ")}\n`);

          await execa(cmd.action, mergedArgs, { stdio: "inherit" });

          console.log();
          commandSpinner.succeed(`Executed command: ${cmd.name}`);
        } catch (error) {
          commandSpinner.fail(`Failed to execute command: ${cmd.name}`);
          if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
          }
        }
      }
    }
  } catch (error) {}
}
