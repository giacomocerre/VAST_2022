// DemographyData.js
import axios from "axios";
import { API_URL } from "../config/config.js";

const apiName = 'buildings';

export const fetchMap = async () => {
    const response = await axios.get(`${API_URL}/${apiName}/map`);
    return response.data;
}

export const fetchPlace = async (id) => {
    const response = await axios.get(`${API_URL}/${apiName}/place/${id}`);
    return response.data;
}