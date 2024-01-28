import fs from 'fs/promises';

export let buildings, calendar_path_expenses, calendar_wesfr, calendar, global_financials, participants, places;

export const readAsyncFile = async (path) => {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data)
}

export const loadData = async () => {
    console.log("Loading data...");
    try {
        buildings = await readAsyncFile('./data/buildings.json');
        calendar_path_expenses = await readAsyncFile('./data/calendar_path_expenses.json');
        calendar_wesfr = await readAsyncFile('./data/calendar_wesfr.json');
        calendar = await readAsyncFile('./data/calendar.json');
        global_financials = await readAsyncFile('./data/global_financials.json');
        participants = await readAsyncFile('./data/participants.json');
        places = await readAsyncFile('./data/places.json');
        console.log('Data loaded successfully.');
    } catch (error) {
        console.error('Error loading data:', error);
        process.exit(1);
    }
}