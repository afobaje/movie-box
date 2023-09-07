const express = require("express");
const router = express.Router();
const { getItem, getMovie, postItem } = require("../Controller/Controller");

router.route("/").get(getItem).post(postItem);

router.get("/movie", getMovie);
module.exports = router;
