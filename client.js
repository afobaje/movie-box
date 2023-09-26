const axios = require("axios");
const config = require("./config");



const client = axios.create({
  baseURL: config.BASE_URL,

});


module.exports = client;
