// Google Sheets utility (server-side only)
// This file will handle authentication and row appending
import { google } from 'googleapis';
import { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY } from './env';

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
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Ensure the tab exists, create if not
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetExists = spreadsheet.data.sheets?.some(
    (s) => s.properties?.title === tabName
  );
  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: tabName } } },
        ],
      },
    });
  }

  // Append the row
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function getSheetTitle() {
  const sheetId = GOOGLE_SHEET_ID;
  const clientEmail = GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  // Return the Google Sheet file name (spreadsheet title)
  return spreadsheet.data.properties?.title || 'EventReg';
}
