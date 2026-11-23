/**
 * Kasuni & Sachira – Wedding RSVP Web App
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1IxfWTUftgHDtbd_4WhIZazGc7wuhpcc1M-T7XA6vU5A/edit
 *
 * Sheet (created automatically if missing):
 *   - RSVP : Timestamp | Name | Attendance
 *
 * The website sends a POST (form-encoded) with:
 *   action = "rsvp", name = "<guest name>", guests = "1" (attending) | "0" (not attending)
 */

const SPREADSHEET_ID = "1IxfWTUftgHDtbd_4WhIZazGc7wuhpcc1M-T7XA6vU5A";
const RSVP_SHEET_NAME = "RSVP";
const TIMEZONE = "Asia/Colombo";

const RSVP_HEADERS = ["Timestamp", "Name", "Attendance"];

function doPost(e) {
  return handleRequest_(e);
}

function doGet(e) {
  // Opening the web app URL in a browser with no params shows a health check.
  if (!e || !e.parameter || !e.parameter.action) {
    return jsonResponse_({ ok: true, message: "Kasuni & Sachira RSVP service is running" });
  }
  return handleRequest_(e);
}

function handleRequest_(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // avoid two guests writing to the same row at once

    const params = parseParams_(e);
    const action = String(params.action || "").trim().toLowerCase();

    if (action === "rsvp") return jsonResponse_(saveRsvp_(params));

    return jsonResponse_({ ok: false, message: action ? "Invalid action" : "Missing action" });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : "Unexpected error",
    });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function saveRsvp_(params) {
  const name = clean_(params.name, 120);
  if (!name) return { ok: false, message: "Name is required" };

  const guests = String(params.guests || "").trim();
  const attendance = guests === "0" ? "Not Attending" : "Attending";

  const sheet = getSheet_(RSVP_SHEET_NAME, RSVP_HEADERS);
  sheet.appendRow([now_(), name, attendance]);

  // Colour the attendance cell for quick scanning
  const row = sheet.getLastRow();
  sheet.getRange(row, 3)
    .setBackground(attendance === "Attending" ? "#E6F4EA" : "#FCE8E6")
    .setFontColor(attendance === "Attending" ? "#137333" : "#A50E0E");

  return { ok: true, message: "RSVP saved" };
}

/* ---------- helpers ---------- */

function getSheet_(sheetName, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#8C6420")
      .setFontColor("#FDF8EC");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(2, 240);
    sheet.setColumnWidth(3, 140);
  }
  return sheet;
}

function now_() {
  return Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}

/** Trim, cap length, and stop spreadsheet formula injection (=, +, -, @). */
function clean_(value, maxLen) {
  let s = String(value || "").trim().slice(0, maxLen);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function parseParams_(e) {
  const params = Object.assign({}, (e && e.parameter) || {});
  const contents = e && e.postData && e.postData.contents ? String(e.postData.contents).trim() : "";
  if (!contents) return params;

  if (contents.charAt(0) === "{") {
    return Object.assign(params, JSON.parse(contents));
  }
  return Object.assign(params, parseFormEncoded_(contents));
}

function parseFormEncoded_(raw) {
  const result = {};
  String(raw || "").split("&").forEach(function (pair) {
    if (!pair) return;
    const parts = pair.split("=");
    const key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
    const value = decodeURIComponent((parts.slice(1).join("=") || "").replace(/\+/g, " "));
    if (key) result[key] = value;
  });
  return result;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor (▶ Run → setup) to create the RSVP sheet and grant permissions. */
function setup() {
  getSheet_(RSVP_SHEET_NAME, RSVP_HEADERS);
}
