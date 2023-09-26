const cheerio = require("cheerio");
const axios = require("axios");
const cron = require("node-cron");
const url = `https://www.tfpdl.is`;
const latestMovies = `/category/movies`;
const readMovieDetails = require("../movieDetailsList.json");
const client = require("../client");
const insertRow = require("../Query/insertData");
const puppeteer = require("puppeteer");
const selectRows = require("./../Query/listData");
const { trimName, trimNamefromFirst, getSlug } = require("./../Utils/helper");
const {
  updateRow,
  updateTable,
  updateDownload,
} = require("../Query/updateData");

async function scrapeData() {
  const { data } = await axios.get(`${url}${latestMovies}`);
  let $ = cheerio.load(`${data}`, null, false);
  let listItems = $(".item-list");
  listItems.each((idx, el) => {
    let untrimmedTitle = $(el).find(".post-title a").text();
    let untrimmedDescription = $(el).find(".entry p").text();
    let untrimmedImgSrc = $(el).find(".entry p img").attr("src");
    const link = $(el).find(".post-title a").attr("href");
    const imgSrc = trimName(untrimmedImgSrc, "?");
    const slug = getSlug(link);
    const title = trimName(untrimmedTitle, " x");
    const description = trimName(untrimmedDescription, "\n");
    insertRow(title, link, imgSrc, slug, description);
  });
}

cron.schedule("5 10 * * wed", scrapeData);
cron.schedule("6 10 * * wed", getEveryMovieDetails);
cron.schedule("7 10 * * wed", getAllActualDownloadLink);

async function getMovieRedirectLink(url) {
  try {
    const { data } = await axios.get(url);
    const $ = await cheerio.load(`${data}`, null, false);
    let downloadLink = $(".post-inner").find(".button").attr("href");
    return downloadLink;
  } catch (error) {
    console.log(error);
  }
}

async function getEveryMovieDetails() {
  try {
    let data = await selectRows();
    await Promise.all(
      data.map((val) => {
        if (val.downloadLink !== null) {
          return;
        }
        getMovieRedirectLink(val.link)
          .then((res) => {
            updateRow(val.ID, res);
          })
          .catch((err) => console.error(err, "couldnt fetch"));
      })
    );
    console.log("File written successfully");
  } catch (err) {
    console.error(err, "couldn't write");
  }
}

async function getAllActualDownloadLink() {
  try {
    let data = await selectRows();
    await Promise.all(
      data.map((val) => {
        if (val.DOWNLOAD !== null) {
          return;
        }
        getActualMovieLink(val.downloadLink)
          .then((res) => {
            updateDownload(val.ID, res);
          })
          .catch((err) => console.error(err, "couldnt get link"));
      })
    );
  } catch (error) {
    console.log("couldnt write successfully");
  }
}

async function getActualMovieLink(url) {
  try {
    const { data } = await axios.get(url);
    const $ = await cheerio.load(`${data}`, null, false);
    let link = $("form").attr("action");
    let rel = $("input[name=_wp_http_referer]").val();
    let trimmedRel = trimNamefromFirst(rel, "/");
    let newLink = link.concat(trimmedRel);
    return newLink;
  } catch (error) {
    console.error("couldnt get file", error);
  }
}

async function downloadMovie() {
  const browser = await puppeteer.launch({headless:'new'});
  const page = await browser.newPage();
  await page.goto(
    "https://www.nairaland.com"
  )
  await page.$$eval('html',html=>{
    return html.map(val=>console.log(val.DOCUMENT_NODE))
  })
  
  await browser.close()

  
}

downloadMovie();

async function getItem(req, res, next) {
  let data = await selectRows();
  res.status(200).json(data || {});
  next();
}

function getMovie(req, res, next) {
  res.status(200).json(readMovieDetails);
  next();
}

async function postItem(req, res, next) {
  const newRequest = await req.body;
  console.log(newRequest, "melo melo");
  // const result = await getDetails(newRequest.link);
  res.status(200).json({ bnxn: "foreplay" });
  next();
}

module.exports = {
  getItem,
  getMovie,
  postItem,
};
