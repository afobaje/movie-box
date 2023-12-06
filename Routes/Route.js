const express = require("express");
const router = express.Router();
const {  getMovie, postItem, getPages, getSelectedMovie, } = require("../Controller/Controller");
const selectRows = require("../Query/listData");


router.route('/').get(getPages).post(postItem)



router.get('/selected',getSelectedMovie)


router.get("/movie", getMovie);
module.exports = router;
