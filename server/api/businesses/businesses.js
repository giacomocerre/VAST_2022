import express from "express";
import { readAsyncFile } from "../../helper/loader.js";

const router = express.Router();

router.get("/period/:placeType/:monthOnly?/:placeId?", async (req, res) => {
  const { placeType, placeId, monthOnly } = req.params;
  try {
    const data = await readAsyncFile('./data/places_evolution.json');
    const typesToFilter = placeType === 'activities' ? ['pub', 'restaurant'] : placeType === 'all' ? ['pub', 'restaurant', 'employer'] : [placeType.toLowerCase()]
    const filteredData = data.filter(item => typesToFilter.includes(item.type.toLowerCase()));
    const aggregate = aggregateDataByMonth(filteredData)
    const transformedData = transformData(aggregate, monthOnly, placeId, placeType);

    res.json(transformedData);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error. Try again later." });
  }
});

const aggregateDataByMonth = (inputData) => {
  const aggregatedData = [];

  inputData.forEach(place => {
    const monthlyData = {};

    place.evolution.forEach(entry => {
      const timestamp = entry.timestamp.substring(0, 7) ; // Estrai l'anno e il mese
      if (!monthlyData[timestamp]) {
        monthlyData[timestamp] = {
          timestamp: timestamp,
          participants: {},
          affluence: 0,
          total: 0
        };
      }

      // Aggiungi i dati per ogni lavoratore
      Object.keys(entry.participants).forEach(participantId => {
        if (!monthlyData[timestamp].participants[participantId]) {
          monthlyData[timestamp].participants[participantId] = 0;
        }
        monthlyData[timestamp].participants[participantId] += entry.participants[participantId];
      });

      // Aggiungi i dati per affluence e totalWages
      monthlyData[timestamp].affluence += entry.affluence;
      monthlyData[timestamp].total += entry.total;
    });

    // Aggiungi i dati aggregati al risultato finale
    const aggregatedEvolution = Object.values(monthlyData);
    aggregatedData.push({
      placeId: place.placeId,
      type: place.type,
      evolution: aggregatedEvolution,
    });
  });

  return aggregatedData;
}

const transformData = (originalData, monthOnly, targetPlaceId) => {
  const resultMap = new Map();

  originalData.forEach(entry => {
    const placeId = entry.placeId;
    const placeType = entry.type;

    if (targetPlaceId && placeId !== parseInt(targetPlaceId)) {
      return; // Skip this entry if it doesn't match the targetPlaceId
    }

    entry.evolution.forEach((evolutionData, i) => {
      const timestamp = evolutionData.timestamp;
      const month = timestamp.substring(0, 7); // Extract the month from the timestamp (YYYY-MM)

      if (!resultMap.has(placeId)) {
        resultMap.set(placeId, { placeId, type: placeType, monthlyIndexes: {} });
      }

      if (!resultMap.get(placeId).monthlyIndexes[month]) {
        resultMap.get(placeId).monthlyIndexes[month] = { };
      }

      const current = Object.keys(evolutionData.participants);
      const total = parseFloat(evolutionData.total.toFixed(2));

      if (i > 0) {
        const previousEvolutionData = entry.evolution[i - 1];
        const exited = Object.keys(previousEvolutionData.participants).filter(participantId => !evolutionData.participants[participantId]);
        const newest = Object.keys(evolutionData.participants).filter(participantId => !previousEvolutionData.participants[participantId]);
        const previous = Object.keys(previousEvolutionData.participants);
        const turnoverIndex = (exited.length /previous.length) * 100
        const percentageChangeIndex = ((current.length-previous.length)/previous.length) *100
        if(targetPlaceId){
          resultMap.get(placeId).monthlyIndexes[month] = ({ month:month, turnoverIndex, percentageChangeIndex, exited, newest, current, previous, total });
        }else{
          resultMap.get(placeId).monthlyIndexes[month] = ({ month:month, turnoverIndex, percentageChangeIndex, total,current });
        }
      } else {
        if(targetPlaceId){
        resultMap.get(placeId).monthlyIndexes[month] = ({ month:month, turnoverIndex: 0, percentageChangeIndex:0, exited: [], newest: [], current, previous: [], total });
        }else {
          resultMap.get(placeId).monthlyIndexes[month] = ({ month:month, turnoverIndex: 0, percentageChangeIndex:0, current, total });

        }
      }
    });
  });

  // Convert monthly aggregated data to an array for output
  const resultArray = Array.from(resultMap.values()).map(entry => {
    return {
      placeId: entry.placeId,
      type: entry.type,
      monthlyIndexes: Object.values(entry.monthlyIndexes),
    };
  });

  let filteredResult;
  if (monthOnly) {
    filteredResult = resultArray.filter(item =>
      item.monthlyIndexes.some(turnover => turnover.month === monthOnly)
    ).map(filteredItem => {
      return {
        placeId: filteredItem.placeId,
        type: filteredItem.type,
        monthlyIndexes: filteredItem.monthlyIndexes.filter(turnover => turnover.month === monthOnly),
      };
    });
  }

  return monthOnly ? filteredResult : resultArray;
};

router.get("/history/:placeId/:month/:participantId?", async (req, res) => {
  const { placeId, month, participantId } = req.params;

  try {
    const data = await readAsyncFile('./data/places_evolution.json');
    const placeData = data.find(item => item.placeId === parseInt(placeId, 10));

    if (!placeData) {
      return res.status(404).json({ error: "Place not found." });
    }
    const monthData = placeData.evolution.filter(entry => entry.timestamp.startsWith(month));

    if (monthData.length === 0) {
      return res.status(404).json({ error: "No data available for the specified month." });
    }
    if (participantId) {
      const participantData = monthData.map(entry => ({
        timestamp: entry.timestamp,
        total: entry.participants[participantId] || 0,
      }));

      res.json(participantData);
    } else {
      const totalData = monthData.map(entry => ({
        timestamp: entry.timestamp,
        total: entry.total,
      }));

      res.json(totalData);
    }

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error. Try again later." });
  }
});



export default router;
