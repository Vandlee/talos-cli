import { confirm } from "@inquirer/prompts";
import * as fs from "fs/promises";
import os from "os";
import path from "path";
import { z } from "zod";
import { RegistrySchema } from "../types/schema";

// Constants
const TALOS_FOLDER_NAME = ".talos";

/**
 * Gets the path to the .talos directory in the user's home folder
 */
function getTalosPath(): string {
  return path.join(os.homedir(), TALOS_FOLDER_NAME);
}

/**
 * Gets the path to a subfolder within .talos
 */
function getTalosSubfolderPath(subFolder: string): string {
  return path.join(getTalosPath(), subFolder);
}

/**
 * Checks if a directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath);
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensures the .talos directory exists, and optionally a subfolder within it.
 * Creates them if they don't exist.
 * This function should be called before any local operations.
 *
 * @param subFolder - Optional subfolder name within .talos (e.g., "commands")
 * @param askBeforeCreate - If true, asks for confirmation before creating directories
 * @returns The path to the .talos directory or subfolder, or null if user declined creation
 */
export async function ensureTalosDirectory(
  subFolder?: string,
  askBeforeCreate = false,
): Promise<string | null> {
  const talosPath = getTalosPath();

  // Ensure .talos folder exists
  if (!(await directoryExists(talosPath))) {
    if (askBeforeCreate) {
      const shouldCreate = await confirm({
        message: `The .talos directory does not exist in your home folder. Do you want to create it at ${talosPath}?`,
        default: true,
      });

      if (!shouldCreate) {
        return null;
      }
    }
    await fs.mkdir(talosPath, { recursive: true });
  }

  // If a subfolder is specified, ensure it exists too
  if (subFolder) {
    const subFolderPath = getTalosSubfolderPath(subFolder);
    if (!(await directoryExists(subFolderPath))) {
      if (askBeforeCreate) {
        const shouldCreate = await confirm({
          message: `The .talos/${subFolder} directory does not exist. Do you want to create it?`,
          default: true,
        });

        if (!shouldCreate) {
          return null;
        }
      }
      await fs.mkdir(subFolderPath, { recursive: true });
    }
    return subFolderPath;
  }

  return talosPath;
}

/**
 * @deprecated Use ensureTalosDirectory() instead
 */
export async function ensureTalosFolder() {
  await ensureTalosDirectory();
}

/**
 * Finds and reads a local command file from the .talos/commands directory
 *
 * @param name - The name of the command (without .json extension)
 * @returns The parsed command schema or undefined if not found
 * @throws Error with specific message about what went wrong
 */
export async function findLocalCommandFile(
  name: string,
): Promise<z.infer<typeof RegistrySchema> | undefined> {
  const commandsFolder = await ensureTalosDirectory("commands", false);

  if (!commandsFolder) {
    throw new Error("Commands directory is not available");
  }

  const filePath = path.join(commandsFolder, `${name}.json`);

  try {
    await fs.access(filePath);
  } catch {
    return undefined;
  }

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsedCommand = JSON.parse(raw);
    return RegistrySchema.parse(parsedCommand);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Command file "${name}.json" contains invalid JSON: ${error.message}`,
      );
    }
    if (error instanceof z.ZodError) {
      throw new Error(
        `Command file "${name}.json" has invalid schema: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw new Error(
      `Failed to read command file "${name}.json": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Checks if the .talos folder exists
 *
 * @returns true if .talos exists, false otherwise
 */
export async function findTalosFolder(): Promise<boolean> {
  return directoryExists(getTalosPath());
}

/**
 * Finds a specific folder within .talos
 *
 * @param folderName - The name of the folder to find
 * @returns The full path to the folder or undefined if not found
 */
export async function findFolder(
  folderName: string,
): Promise<string | undefined> {
  const folderPath = getTalosSubfolderPath(folderName);

  if (await directoryExists(folderPath)) {
    return folderPath;
  }

  return undefined;
}
