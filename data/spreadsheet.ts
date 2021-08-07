import { GoogleSpreadsheet, GoogleSpreadsheetCell, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import { Casino, Minimum, TimeFrame } from "../interface/casino";

export const getCasinoDataFromGoogleSheet = async (
  sheetIdMins: string,
  sheetIdCoords: string,
  apiKey: string,
): Promise<Casino[]> => {
  const doc = new GoogleSpreadsheet(sheetIdMins);
  doc.useApiKey(apiKey);
  await doc.loadInfo();
  console.log("Minimums sheet title: " + doc.title);

  const coordMap = await getCoordinateMap(sheetIdCoords, apiKey);

  let casinos: Casino[] = [];
  let uid = 0;
  for (const [sheetName, sheet] of Object.entries(doc.sheetsByTitle)) {
    await sheet.loadCells();
    const sheetMap = sheetToKeyValues(sheetName, sheet);

    if (sheetMap.length === 0) continue;

    /* Transform input data to be consistent */
    if (sheetName === "Non-Nevada") {
      /* Non-Nevada sheet: Casino names are split across 3 columns */
      const combineColHeaders = ["OtherNV Casnio", "City", "State"];
      for (let rowMap of sheetMap) {
        const name = combineColHeaders.map(h => rowMap.get(h) || "").join(", ");
        combineColHeaders.forEach(h => rowMap.delete(h));
        rowMap.set("Name", name);
      }
    } else {
      /* Other sheets: Casino name is the first column (first added in the Map) */
      for (let rowMap of sheetMap) {
        const [nameColHeader, name] = rowMap.entries().next().value;
        rowMap.delete(nameColHeader);
        rowMap.set("Name", name);
      }
    }

    for (let row of sheetMap) {
      const name = row.get("Name");
      if (!name) throw new Error("Missing casino name from " + row.entries());
      const coords = coordMap[name] || null;
      if (!coords) {
        console.error("Missing coordinates for " + name);
        continue;
      }

      let mins: any = {}
      let updated: string = "Unknown"
      let extras: Casino['extras'] = {}
      for (let [header, value] of row) {
        if (Object.values(TimeFrame).includes(header as TimeFrame)) {
          /* Cell is a table minimum */
          mins[header] = parseMinimum(value);
        } else if (header === "Last Update") {
          updated = value
        } else if (header !== "Name") {
          if (value && value !== "Unknown") {
            extras[header] = value;
          }
        }
      }

      casinos.push({
        uniqueId: uid++,
        name: name,
        coords: coords,
        updated: updated,
        minimums: mins,
        extras: extras,
      });
    }
  }

  return casinos;
}

/**
 * Get a mapping from Casino name to its coordinates in the world, by referring to
 * https://docs.google.com/spreadsheets/d/1RWX7TwDwgV2glC2MxuPCVaTbNIoUDiMrKQh_vBBT3j0/edit#gid=0
 */
const getCoordinateMap = async (sheetId: string, apiKey: string) => {
  const HEADER_ROW_ID = 0;
  const NAME_COL_ID = 0;
  const LAT_COL_ID = 1;
  const LON_COL_ID = 2;

  const doc = new GoogleSpreadsheet(sheetId);
  doc.useApiKey(apiKey)
  await doc.loadInfo();
  console.log("Coordinates sheet title: " + doc.title);
  const sheet = doc.sheetsByIndex[0]
  await sheet.loadCells()

  let ret: { [key: string]: [number, number] | null } = {};
  for (let row = HEADER_ROW_ID + 1;; row++) {
    const casinoName = sheet.getCell(row, NAME_COL_ID).value?.toString();
    if (!casinoName) break;

    const lat = parseFloat(sheet.getCell(row, LAT_COL_ID).formattedValue);
    const lon = parseFloat(sheet.getCell(row, LON_COL_ID).formattedValue);
    if (!lat || !lon) {
      ret[casinoName] = null;
    } else {
      ret[casinoName] = [lat, lon];
    }
  }

  return ret;
}

const parseMinimum = (value: string): Minimum => {
  if (value.match(/^\d+$/)) {
    return { low: parseInt(value), high: null };
  }

  const rangeMatch = value.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return { low: parseInt(rangeMatch[1]), high: parseInt(rangeMatch[2]) };
  }

  return null;
}

const sheetToKeyValues = (
  sheetName: string,
  sheet: GoogleSpreadsheetWorksheet
): Map<string, string>[] => {

  const HEADER_ROW_ID = 0;
  const GUARANTEED_COL_ID = 0; /* This column must have data; else the sheet will stop being read */

  let ret: Map<string, string>[] = [];

  /* A sheet-wide mapping from column number to the header name of that column */
  let headerName = new Map<number, string>();
  let cell: GoogleSpreadsheetCell;
  for (let col = 0; (cell = sheet.getCell(HEADER_ROW_ID, col)); col++) {
    if (!cell.value) break;
    headerName.set(col, cell.formattedValue);
  }

  outer:
  for (let row = HEADER_ROW_ID + 1;; row++) {
    const mapForRow = new Map<string, string>();
    for (let [col, header] of headerName) {
      const cellText = sheet.getCell(row, col).formattedValue;
      if (col === GUARANTEED_COL_ID && !cellText) break outer;
      mapForRow.set(header, cellText || "");
    }
    ret.push(mapForRow);
  }

  return ret;
}
