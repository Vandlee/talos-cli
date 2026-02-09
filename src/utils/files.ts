import * as fs from "fs/promises";
import os from "os";
import path from "path";
import { z } from "zod";
import { RegistrySchema } from "../types/schema";

export async function findLocalCommandFile(
  name: string,
): Promise<z.infer<typeof RegistrySchema> | undefined> {
  try {
    const folder = await findFolder("commands");
    if (!folder) {
      console.error("Commands folder not found.");
      return;
    }
    const filePath = path.join(folder, `${name}.json`);

    const raw = await fs.readFile(filePath, "utf-8");
    const parsedCommand = JSON.parse(raw);

    return RegistrySchema.parse(parsedCommand);
  } catch (error) {
    console.error(`Error finding command file: ${error}`);
    return;
  }
}

export async function findTalosFolder() {
  const homeDir = os.homedir();
  const talosDir = path.join(homeDir, ".talos");

  try {
    await fs.access(talosDir);
    return true;
  } catch (error) {
    return false;
  }
}

export async function findFolder(folderName: string) {
  const homeDir = os.homedir();

  if (await findTalosFolder()) {
    try {
      const folderPath = path.join(homeDir, ".talos", folderName);
      await fs.access(folderPath);
      return folderPath;
    } catch (error) {
      console.error(`Error finding folder: ${error}`);
      return;
    }
  }
}
