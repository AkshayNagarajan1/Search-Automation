// Google Apps Script backend functions
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Word Search App');
}

function searchMultipleWords(wordToSearch) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  let foundLocations = [];

  // Loop through each sheet in the spreadsheet
  for (const currentSheet of sheets) {
    if (currentSheet.getName() === "Search Sheet") continue;

    const data = currentSheet.getRange(1, 3, currentSheet.getLastRow(), 4).getValues(); // Get data from columns C, D, E, F

    // Loop through each row in the current sheet to find the word
    for (let j = 0; j < data.length; j++) {
      const englishWord = data[j][1].toString().toLowerCase(); // Column D (index 1)
      if (englishWord === wordToSearch || englishWord.includes(wordToSearch) || levenshteinDistance(englishWord, wordToSearch) <= 2) {
        foundLocations.push({
          sheetName: currentSheet.getName(),
          rowNumber: j + 1,
          subject: data[j][0], // Column C
          originalWord: data[j][1], // Column D
          tamilWord: data[j][2], // Column E
          sentence: data[j][3] // Column F
        });
      }
    }
  }

  return foundLocations;
}

function updateDetailsFromSelection(originalWord, selectedSubject) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  let foundLocation = null;

  for (const currentSheet of sheets) {
    if (currentSheet.getName() === "Search Sheet") continue;

    const data = currentSheet.getRange(1, 3, currentSheet.getLastRow(), 4).getValues();

    for (let j = 0; j < data.length; j++) {
      const englishWord = data[j][1].toString().toLowerCase();
      const subject = data[j][0].toString().toLowerCase();

      if (originalWord === englishWord && selectedSubject === subject) {
        foundLocation = {
          sheetName: currentSheet.getName(),
          rowNumber: j + 1,
          subject: data[j][0],
          originalWord: data[j][1],
          tamilWord: data[j][2],
          sentence: data[j][3]
        };
        break;
      }
    }
    if (foundLocation) break;
  }

  return foundLocation;
}

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
