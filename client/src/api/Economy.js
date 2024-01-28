// DemographyData.js
import axios from "axios";
import { API_URL } from "../config/config.js";

const apiName = 'economy';

export const fetchGlobalVariables = async (type) => {
    const response = await axios.get(`${API_URL}/${apiName}/global/${type}`);
    return response.data;
}
export const fetchTrends = async (filter, type ) => {
    const response = await axios.get(`${API_URL}/${apiName}/trends/${filter}/${type}`);
    return response.data;
}

export const fetchLorenzCurve = async (type ) => {
    const response = await axios.get(`${API_URL}/${apiName}/lorenz/${type}`);
    return response.data;
}

export const fetchDistribution = async (filter, type ) => {
    const response = await axios.get(`${API_URL}/${apiName}/distribution/${filter}${type ? '/'+type : '' }`);
    return response.data; 
}