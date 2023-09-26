function getSlug(url) {
  const getUrl = new URL(url);
  return getUrl.pathname;
}


function trimNamefromFirst(value, trim) {
  let newVal = value.split(trim);
  newVal.unshift();
  let trimmed = newVal.join("");
  return trimmed;
}




function trimName(value, trim) {
  let newVal = value.split(trim);
  newVal.pop();
  let trimmed = newVal.join("");
  return trimmed;
}

module.exports = {
  getSlug,
  trimName,
  trimNamefromFirst
};
