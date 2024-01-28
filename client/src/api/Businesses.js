// DemographyData.js
import axios from "axios";
import { API_URL } from "../config/config.js";

const apiName = 'businesses';

export const fetchPeriods = async (placeType, month, placeId) => {
    const response = await axios.get(`${API_URL}/${apiName}/period/${placeType}${month ? '/'+month + (placeId ? '/'+placeId : '') : ''}`);
    return response.data;
}

export const fetchHistory = async (placeId, month, participantId) => {
    const response = await axios.get(`${API_URL}/${apiName}/history/${placeId}/${month}/${participantId ? participantId : ''}`);
    return response.data;
}