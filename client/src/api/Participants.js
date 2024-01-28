// DemographyData.js
import axios from "axios";
import { API_URL } from "../config/config.js";

const apiName = 'participants';

export const fetchCalendar = async (type) => {
    const response = await axios.get(`${API_URL}/${apiName}/calendar/${type}`);
    return response.data;
}

export const fetchCalendarInfo = async (type, date, participants) => {
    const response = await axios.get(`${API_URL}/${apiName}/calendar/info/${type}/${date}${participants ? '/'+participants : '' }`);
    return response.data;
}

export const fetchParticipantsDistributions = async (type, date, sort) => {
    const response = await axios.get(`${API_URL}/${apiName}/distribution/${type}/${date}/${sort}`);
    return response.data;
}

export const fetchWageAndament = async (participants) => {
    const response = await axios.get(`${API_URL}/${apiName}/wage/andament${participants ? '/'+participants : '' }`)
    return response.data;
}

export const fetchPaths =  async (type, date, participants) => {
    const response = await axios.get(`${API_URL}/${apiName}/path/${type}/${date}${participants ? '/'+participants : '' }`);
    return response.data;
}