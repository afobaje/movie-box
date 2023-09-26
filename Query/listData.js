const data = require("./db");
const db = data();

function selectRows() {
  return new Promise((resolve, reject) => {
    const mov = [];
    db.each(
      `SELECT * FROM movieList`,
      (error, row) => {
        if (error) {
          reject(error);
        }
        mov.push(row);
      },
      () => {
        resolve(mov);
      }
    );
  });
}

module.exports = selectRows;
