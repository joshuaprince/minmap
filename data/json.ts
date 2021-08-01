import { promises as fs } from "fs";
import path from "path";

import { Casino } from "../interface/casino";

export const getCasinoDataFromJson = async (): Promise<Casino[]> => {
  const jsonFile = path.join(process.cwd(), "data/sample.json");
  const jsonContent = await fs.readFile(jsonFile, "utf-8");
  const data = JSON.parse(jsonContent);
  return data as Casino[];  // TBD: Parsing validity..
}
