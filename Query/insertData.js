// const database = require("./db");
const database = require("./db");
const db = database();

function insertRow(title, link, imgSrc, slug, description) {
  const [name, color, weight] = process.argv.slice(2);
  db.run(
    `INSERT INTO movieList (title,link,imgSrc,slug,description) VALUES(?,?,?,?,?)`,
    [title, link, imgSrc, slug, description],
    function (error) {
      if (error) {
        console.error(error.message);
      }
      console.log(`Inserted a row with the ID: ${this.lastID}`);
    }
  );
}

// insertRow();
module.exports = insertRow;
