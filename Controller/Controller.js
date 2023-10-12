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
  updateDownloadLinks,
} = require("../Query/updateData");

const tableData = selectRows();

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

async function downloadMovie(browser, xproxxLink) {
  // const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setDefaultTimeout(120000);
  // await page.setDefaultNavigationTimeout(120000)
  await page.goto(xproxxLink, { waitUntil: "domcontentloaded" });

  await page
    .locator("#soralink-human-verif-main")
    .setEnsureElementIsInTheViewport()
    .setTimeout(60000)
    .click()
    .then(async () => {
      await page
        .locator(" #generater")
        .setEnsureElementIsInTheViewport()
        .click();
    })
    .then(async () => {
      await page
        .locator("img#showlink")
        .setEnsureElementIsInTheViewport()
        .click();
    });
  return new Promise(async (resolve) => {
    browser.on("targetcreated", async function (target) {
      let url = target.url();
      if (url) {
        let urlObject = new URL(url);
        if (urlObject.host === "safetxt.net") {
          let targetPage = await target.page();
          let pageCookies = await targetPage.cookies();
          resolve([url, pageCookies]);
        }
      }
    });
  });
}

async function disableJavascript(page) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "script") {
      request.abort();
    } else {
      request.continue();
    }
  });
}

async function getDownloadLinksFromSafeTxt(browser, safeTxt, linkId) {
  let page = await browser.newPage();
  await disableJavascript(page);
  try {
    await page.goto(safeTxt, {
      waitUntil: "domcontentloaded",
      timeout: 10 * 1000,
    });
  } catch {}

  let pageContent = await page.content();
  let token = pageContent.match(/token\:\s?\'(.*?)\'/)[1];
  let slug = pageContent.match(/slug\:\s?\'(.*?)\'/)[1];

  if (!token && !slug) {
    throw new Error("Couldnt extract token and slug from page");
  }
  const PASSWORD = "tfpdl";
  let API_URL = "https://safetxt.net/get-paste";
  console.log("fetching with axios..");
  let response = await axios.post(API_URL, {
    _token: token,
    password: PASSWORD,
    slug,
  });
  console.log("fetch done");
  let content = atob(response.data.content);
  content = decodeURIComponent(content.replace(/\+/g, "%20"));
  let $ = cheerio.load(`${content}`, null, false);
  let linkLists = $(".cm-url");

  let arrLinks = [];
  linkLists.each((id, el) => {
    let links = $(el).attr("href");
    arrLinks.push(links);
  });

  let stringLinks = JSON.stringify(arrLinks);
  updateDownloadLinks(linkId, stringLinks);
}

async function workOnLinks(batch, data, browser) {
  for (let i = 0; i < data.length; i += batch) {
    let eachBatch = data.slice(i, i + batch);
    for (const element of eachBatch) {
      if (element == undefined || element.DOWNLOADLINKS !== null) {
        continue;
      }

      try {
        const [url] = await downloadMovie(browser, element.DOWNLOAD);
        await getDownloadLinksFromSafeTxt(browser, url, element.ID);
      } catch (error) {
        console.error(error, "couldnt fetch");
      }
    }
  }
}

async function getActualSafeTxtLinks() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    let data = await selectRows();

    let batch = 10;
    await Promise.all(await workOnLinks(batch, data, browser));
  } catch (error) {
    console.error("error fetching xproxx", error);
  }
}

// getActualSafeTxtLinks();

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
