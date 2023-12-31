const express = require("express");
const cors = require("cors");
const app = express();
const dotenv=require('dotenv').config()
const port = process.env.PORT||3002;




const { urlencoded } = require("express");
const router = require("./Routes/Route");

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use("/", router);

app.listen(port, () => console.log(`Port running on ${port}`));

