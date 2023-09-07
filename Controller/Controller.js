const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const readData = require("../movieList.json");
const url = `https://www.tfpdl.is`;
const latestMovies = `/category/movies`;
const readMovie = require("../movieItem.json");

let num = 1;
const movieItems = [];
async function scrapeData() {
  const { data } = await axios.get(`${url}${latestMovies}`);
  let $ = cheerio.load(`${data}`, null, false);
  let listItems = $(".item-list");
  listItems.each((idx, el) => {
    let untrimmedTitle = $(el).find(".post-title a").text();
    let untrimmedDescription = $(el).find(".entry p").text();
    let untrimmedImgSrc = $(el).find(".entry p img").attr("src");
    const link = $(el).find(".post-title a").attr("href");
    // movieItems.push({untrimmedDescription,untrimmedImgSrc,untrimmedTitle,link})
    const imgSrc = trimName(untrimmedImgSrc, "?");
    const slug = getSlug(link);
    const title = trimName(untrimmedTitle, " x");
    let id = num++;
    const description = trimName(untrimmedDescription, "\n");
    movieItems.push({ id, title, link, imgSrc, slug, description });
  });

  

  

  let parsedData = JSON.stringify(movieItems);
  
  fs.writeFile("movieList.json", parsedData, (err) => {
    console.error(err, "error writing file");
  });
  
}








async function getDetails(url) {
  const { data } = await axios.get(url);
  const $ = await cheerio.load(`${data}`, null, false);
  let pageTitle = $("post-inner").find("h1 > span").text();
  let pageImg = $(".post-inner").find(".entry img").attr("src");
  let untrimmedDesc = $(".post-inner").find(".entry p").text();
  let downloadLink = $(".post-inner").find(".button").attr("href");
  let desc = trimName(untrimmedDesc, "Link");

  console.log(desc,'this is desc')

  let movie = {
    pageTitle,
    pageImg,
    desc,
    downloadLink,
  };
  //  movie;
  let movieData = JSON.stringify(movie);

  fs.writeFile("movieItem.json", movieData, (err) => console.error(err));
}

function getSlug(url) {
  const getUrl = new URL(url);
  return getUrl.pathname;
}

function trimName(value, trim) {
  let newVal = value.split(trim);
  newVal.pop();
  let trimmed = newVal.join("");
  return trimmed;
}

// scrapeData();




setInterval(() => {
  scrapeData();
}, 1000 * 3600);

function getItem(req, res, next) {
  res.status(200).json(readData);
  next();
}

function getMovie(req, res, next) {
  res.status(200).json(readMovie);
  next();
}

async function postItem(req, res, next) {
  const newRequest = await req.body;
  const result = await getDetails(newRequest.link);
  res.status(200).json({ bnxn: "foreplay" });
  next();
}

module.exports = {
  getItem,
  getMovie,
  postItem,
};
