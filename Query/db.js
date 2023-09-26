const sql = require("sqlite3").verbose();
const fs = require("fs");

const filepath = "./Database/movieList.db";

function createDbConnection() {
  if (fs.existsSync(filepath)) {
    return new sql.Database(filepath);
  } else {
    const db = new sql.Database(filepath, (error) => {
      if (error) {
        console.error(error.message);
      }
      createTable(db);
    });
    console.log("Connection with SQLite has been established");
    return db;
  }
}

function createTable(db) {
  db.exec(
    `CREATE TABLE movieList (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(1000) NOT NULL,
      link VARCHAR(1000) NOT NULL,
      imgSrc VARCHAR(2000) NOT NULL,
      slug VARCHAR(1000) NOT NULL,
      description VARCHAR(5000) NOT NULL
    )`
  );
}

module.exports = createDbConnection;
