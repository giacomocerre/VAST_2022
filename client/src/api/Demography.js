// DemographyData.js
import axios from "axios";
import { API_URL } from "../config/config.js";

const apiName = 'demography';

export const fetchParticipants = async () => {
    const response = await axios.get(`${API_URL}/${apiName}/participants`);
    return response.data;
}

export const fetchParticipant = async (id) => {
    const response = await axios.get(`${API_URL}/${apiName}/participant/${id}`);
    return response.data;
}

export const fetchAverages = async (type) => {
    const response = await axios.get(`${API_URL}/${apiName}/average/${type}`);
    return response.data;
}