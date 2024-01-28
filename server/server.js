import express from "express";
import API from "./api/index.js";
import cors from 'cors';
import dotenv from 'dotenv';
import { loadData } from "./helper/loader.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

const { BuildingAPI, DemographyAPI, EconomyAPI, ParticipantsAPI, BusinessesAPI } = API;

app.use(cors());
const api_url = "/api";

// Building API
app.use(`${api_url}/buildings`, BuildingAPI);
// Demography API
app.use(`${api_url}/demography`, DemographyAPI);
// Economy API
app.use(`${api_url}/economy`, EconomyAPI);
// Participants API
app.use(`${api_url}/participants`, ParticipantsAPI);
// Businesses API
app.use(`${api_url}/businesses`, BusinessesAPI);

app.get("/", (req, res) => {
  res.send("Money Talks server API!");
});

// Start server after load all data
loadData().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
