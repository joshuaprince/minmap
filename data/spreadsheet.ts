import { GoogleSpreadsheet, GoogleSpreadsheetCell } from "google-spreadsheet";

import { Casino, Minimum, TimeFrame } from "../interface/casino";

export const getCasinoDataFromGoogleSheet = async (): Promise<Casino[]> => {
  const HEADER_ROW_ID = 0
  const NAME_COLUMN_ID = 0  // column "A" always has casino name

  const sheetsApiKey = process.env.SHEETS_API_KEY;
  if (!sheetsApiKey) {
    throw new Error("Google Sheets API key is not set.");
  }

  const sheetId = process.env.SHEET_ID_MINS;
  if (!sheetId) {
    throw new Error("Minimums Sheet ID is not set.");
  }

  const doc = new GoogleSpreadsheet(sheetId);
  doc.useApiKey(sheetsApiKey);
  await doc.loadInfo();
  console.log("Minimums sheet title: " + doc.title);

  const coordMap = await getCoordinateMap(sheetsApiKey);

  let casinos: Casino[] = [];
  for (const [sheetName, sheet] of Object.entries(doc.sheetsByTitle)) {
    await sheet.loadCells();
    let cell: GoogleSpreadsheetCell;

    /* Create a mapping from column number to the header name of that column */
    let headerName: { [key: number]: string } = {};
    for (let col = 0; (cell = sheet.getCell(HEADER_ROW_ID, col)); col++) {
      if (!cell.value) break;
      headerName[col] = cell.value.toString();
    }

    for (let row = HEADER_ROW_ID + 1;; row++) {
      const nameCell = sheet.getCell(row, NAME_COLUMN_ID);
      if (!nameCell.value) break;

      const coords = coordMap[nameCell.value.toString()];
      let mins: any = {}
      for (let colNumStr in Object.keys(headerName)) {
        const colNum = parseInt(colNumStr);
        const title = headerName[colNum];
        const cell = sheet.getCell(row, colNum);

        if (Object.values(TimeFrame).includes(title as TimeFrame)) {
          /* Cell is a table minimum */
          mins[title] = await parseMinimum(cell);
        }
      }

      casinos.push({
        name: nameCell.value.toString(),
        coords: coords,
        minimums: mins,
        extras: {},
      });
    }

    break;  // TODO: REMOVE!
  }

  return casinos;
}

/**
 * Get a mapping from Casino name to its coordinates in the world, by referring to
 * https://docs.google.com/spreadsheets/d/1RWX7TwDwgV2glC2MxuPCVaTbNIoUDiMrKQh_vBBT3j0/edit#gid=0
 */
const getCoordinateMap = async (apiKey: string) => {
  const HEADER_ROW_ID = 0;
  const NAME_COL_ID = 0;
  const LAT_COL_ID = 1;
  const LON_COL_ID = 2;

  const coordsSheetId = process.env.SHEET_ID_COORDINATES;
  if (!coordsSheetId) {
    throw new Error("Coordinates Sheet ID is not set.");
  }

  const doc = new GoogleSpreadsheet(coordsSheetId);
  doc.useApiKey(apiKey)
  await doc.loadInfo();
  console.log("Coordinates sheet title: " + doc.title);
  const sheet = doc.sheetsByIndex[0]
  await sheet.loadCells()

  let ret: { [key: string]: [number, number] } = {};
  for (let row = HEADER_ROW_ID + 1;; row++) {
    const casinoName = sheet.getCell(row, NAME_COL_ID).value?.toString();
    if (!casinoName) break;

    const lat = parseFloat(sheet.getCell(row, LAT_COL_ID).value?.toString());
    const lon = parseFloat(sheet.getCell(row, LON_COL_ID).value?.toString());

    ret[casinoName] = [lat, lon];
  }

  return ret;
}

const parseMinimum = async (cell: GoogleSpreadsheetCell): Promise<Minimum> => {
  const value = cell.value;

  if (typeof value === "number") {
    return { low: value, high: null };
  }

  if (typeof value === "string") {
    if (value.match(/^\d+$/)) {
      return { low: parseInt(value), high: null };
    }

    const rangeMatch = value.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      return { low: parseInt(rangeMatch[1]), high: parseInt(rangeMatch[2]) };
    }
  }

  return null;
}
