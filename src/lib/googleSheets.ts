// Google Sheets utility (server-side only)
// This file will handle authentication and row appending
import {google} from "googleapis";
import {
  GOOGLE_SHEET_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
} from "./env";

export async function appendToSheet({
  values,
  tabName,
}: {
  values: string[];
  tabName: string;
}) {
  const sheetId = GOOGLE_SHEET_ID;
  const clientEmail = GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  // Handle multiline keys (for local dev)
  privateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({version: "v4", auth});

  // Ensure the tab exists, duplicate from "default" template if not
  const spreadsheet = await sheets.spreadsheets.get({spreadsheetId: sheetId});

  const sheetExists = spreadsheet.data.sheets?.some(
    (s) => s.properties?.title === tabName
  );

  if (!sheetExists) {
    // Find the "default" template tab
    const defaultSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "default"
    );

    console.log("defaultSheet", defaultSheet);

    if (
      !defaultSheet ||
      defaultSheet.properties?.sheetId === undefined ||
      defaultSheet.properties?.sheetId === null
    ) {
      throw new Error(
        'Default template tab not found. Please create a tab named "default" in your Google Sheet to use as a template.'
      );
    }

    // Duplicate the default tab with the new name
    const duplicateResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            duplicateSheet: {
              sourceSheetId: defaultSheet.properties.sheetId,
              newSheetName: tabName,
            },
          },
        ],
      },
    });

    // Get the new sheet ID from the response
    const newSheetId =
      duplicateResponse.data.replies?.[0]?.duplicateSheet?.properties?.sheetId;

    if (newSheetId !== undefined) {
      // Get all named ranges to find any tables that need renaming
      const spreadsheetData = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        includeGridData: false,
      });

      const namedRanges = spreadsheetData.data.namedRanges || [];
      const tablesToRename = namedRanges.filter(
        (range) => range.range?.sheetId === newSheetId
      );

      // Rename any tables/named ranges to 'Attendees'
      if (tablesToRename.length > 0) {
        const renameRequests = tablesToRename.map((table) => ({
          updateNamedRange: {
            namedRange: {
              namedRangeId: table.namedRangeId,
              name: "Attendees",
              range: table.range,
            },
            fields: "name",
          },
        }));

        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: renameRequests,
          },
        });
      }
    }
  }

  // Append the row
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {values: [values]},
  });
}

export async function getSheetTitle() {
  const sheetId = GOOGLE_SHEET_ID;
  const clientEmail = GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  privateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({version: "v4", auth});

  const spreadsheet = await sheets.spreadsheets.get({spreadsheetId: sheetId});
  // Return the Google Sheet file name (spreadsheet title)
  return spreadsheet.data.properties?.title || "EventReg";
}
