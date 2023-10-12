const data = require("./db");
const db = data();

function updateRow(id, downloadLink) {
  db.run(
    `UPDATE movieList SET downloadLink=? WHERE ID=?`,
    [downloadLink, id],
    (error) => {
      if (error) {
        console.error(error.message);
      }
      console.log(`Row ${id} has been updated`);
    }
  );
}

function updateDownload(id, DOWNLOAD) {
  db.run(
    `UPDATE movieList SET DOWNLOAD=? WHERE ID=?`,
    [DOWNLOAD, id],
    (error) => {
      if (error) {
        console.error(error.message);
      }
      console.log(`Row ${id} has been updated`);
    }
  );
}

function updateDownloadLinks(id, DOWNLOADLINKS) {
  db.run(
    `UPDATE movieList SET DOWNLOADLINKS=? WHERE ID=?`,
    [DOWNLOADLINKS, id],
    (error) => {
      if (error) {
        console.error(error.message, "couldnt update JSON files");
      }
      console.log(`Row ${id} has been updated with requested JSON files`);
    }
  );
}

function updateTable() {
  db.run(`ALTER TABLE movieList ADD COLUMN DOWNLOADLINKS TEXT`, (error) => {
    if (error) {
      console.error(error.message);
    }
    console.error("table has been updated successfully");
  });
}

module.exports = { updateRow, updateTable, updateDownload,updateDownloadLinks };
