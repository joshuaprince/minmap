import { promises as fs } from "fs";
import path from "path";

import { Casino } from "../interface/casino";

const sampleFilePath = "data/sample.json";

export const getCasinoDataFromJson = async (): Promise<Casino[]> => {
  const jsonFile = path.join(process.cwd(), sampleFilePath);
  const jsonContent = await fs.readFile(jsonFile, "utf-8");
  const data = JSON.parse(jsonContent);
  return data as Casino[];  // TBD: Parsing validity..
}

export const dumpCasinoDataToJson = async (casinos: Casino[]) => {
  const jsonFile = path.join(process.cwd(), sampleFilePath);
  await fs.writeFile(jsonFile, JSON.stringify(casinos), { encoding: "utf-8" });
}
