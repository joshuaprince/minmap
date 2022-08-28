import { GoogleSpreadsheet, GoogleSpreadsheetCell, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import { Casino, Minimum, TimeFrame } from "../interface/casino";

export const getCasinoDataFromGoogleSheet = async (
  sheetIdMins: string,
  apiKey: string,
  ignoredSheets: string[] = [],
): Promise<Casino[]> => {
  const doc = new GoogleSpreadsheet(sheetIdMins);
  doc.useApiKey(apiKey);
  await doc.loadInfo();
  console.log("Minimums sheet title: " + doc.title);

  let casinos: Casino[] = [];
  let uid = 0;
  for (const [sheetName, sheet] of Object.entries(doc.sheetsByTitle)) {
    if (ignoredSheets?.includes(sheetName)) continue;

    await sheet.loadCells();
    const sheetMap = sheetToKeyValues(sheetName, sheet);

    if (sheetMap.length === 0) continue;

    for (let row of sheetMap) {
      let name, city, state;
      switch (sheetName) {
        case "Non-Nevada":
          name = row.get("OtherNV Casino");
          row.delete("OtherNV Casino");
          city = row.get("City");
          row.delete("City");
          state = row.get("State");
          row.delete("State");
          break;
        case "Other Nevada":
          const [hdr, vlu] = row.entries().next().value;  /* first column */
          const regex = /(.*) \((.*)\)/;  /* split city name out of first column */
          name = vlu.match(regex)?.[1]
          city = vlu.match(regex)?.[2]
          state = "NV";
          row.delete(hdr);
          break;
        default:
          const [header, value] = row.entries().next().value;  /* first column */
          name = value;
          city = sheetName;
          state = "NV";
          row.delete(header);
      }

      if (!name) throw new Error("Missing casino name from " + [...row.entries()]);
      if (!city) throw new Error("Missing city from " + [...row.entries()]);
      if (!state) throw new Error("Missing state from " + [...row.entries()]);

      const coords = parseCoords(row.get("Coordinates"));
      if (!coords) {
        console.warn("Missing or mis-formatted coordinates for " + name + ", " + city + ", " + state);
      }
      row.delete("Coordinates");

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
        city: city,
        state: state,
        coords: coords,
        updated: updated,
        minimums: mins,
        extras: extras,
      });
    }
  }

  return casinos;
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

const parseCoords = (value: string | undefined): [number, number] | null => {
  if (!value) return null;

  const regex = /([\d.-]+)\s*,\s*([\d.-]+)/;
  const match = value.match(regex);
  if (!match) {
    return null;
  }

  return [parseFloat(match[1]), parseFloat(match[2])];
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

  /* Validate "Min" headers are present */
  outer:
  for (const header of Object.values(TimeFrame)) {
    for (const mapEntry of headerName.values()) {
      if (header === mapEntry) continue outer;
    }
    console.error("Missing " + header + " header from sheet " + sheetName + ".");
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
