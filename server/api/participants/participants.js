import express from "express";
import { decimal } from "../../helper/helper.js";
import { calendar, calendar_wesfr, readAsyncFile } from "../../helper/loader.js";

const router = express.Router();

router.get("/calendar/info/:type/:date?/:participantId?", async (req, res) => {
  const { type, date, participantId } = req.params;

  try {
    let result;

    if (participantId) {
      const participantsData = await calendar_wesfr;
      const participantData = participantsData.find(p => p.participantId === participantId);
      result = extractFromParticipantsData(participantData, type, date, participantId)

    } else {
      const calendarData = await calendar;
      result = extractFromCalendarData(calendarData, type, date);
    }

    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error. Try again later." });
  }
});

const extractFromParticipantsData = (data, type, date, id) => {
  const result = {
    timestamp: '',
    filter: type,
    participantId: id,
    data: {},
  };

  const sums = {
    food: 0,
    wage: 0,
    education: 0,
    shelter: 0,
    recreation: 0
  };

  if (data) {
    Object.keys(data).forEach(category => {
      if (Array.isArray(data[category])) {
        data[category].forEach(item => {
          if (type === 'global') {
            sums[category] += item.amount
          } else {
            const itemDate = item.timestamp.slice(0, type === "year" ? 4 : type === "month" ? 7 : 10);
            if (itemDate === date) {
              sums[category] += item.amount;
            }
          }

        });
      }
    });

    const savingIndex = ((sums.wage + (sums.shelter + sums.education + sums.food + sums.recreation)) / sums.wage) * 100;

    result.timestamp = date;
    const dataToForfmat = {
      wage: sums.wage,
      food: sums.food,
      education: sums.education,
      recreation: sums.recreation,
      shelter: sums.shelter,
      saving: savingIndex
    }
    result.data = formatDataResult(dataToForfmat)
  }

  return result;
};

const extractFromCalendarData = (data, type, date) => {
  const result = {
    timestamp: '',
    filter: type,
    data: {}
  };

  let level;
  switch (type) {
    case 'global':
      level = data.global
      break;
    case "year":
      level = data.global.years.find((year) => year.d.toString() === date);
      break;
    case "month":
      level = data.global.years
        .find((year) => year.d.toString() === date.slice(0, 4))
        ?.months.find((month) => month.d === date);
      break;
    case "day":
      level = data.global.years
        .find((year) => year.d.toString() === date.slice(0, 4))
        ?.months.find((month) => month.d === date.slice(0, 7))
        ?.weeks.flatMap((week) => week.days)
        .find((day) => day.d === date);
      break;
    default:
      break;
  }

  if (level) {
    result.timestamp = level.d
    const dataToForfmat = {
      wage: level.wage.real,
      food: level.food.real,
      education: level.education.real,
      recreation: level.recreation.real,
      shelter: level.shelter.real,
      saving: level.saving.real
    }
    result.data = formatDataResult(dataToForfmat)
  }

  return result;
};

const formatDataResult = (data) => {
  return {
    wage: { title: "Wage Expenses", label: "wage", value: decimal(data.wage, 2), unit: "$" },
    food: { title: "Food Expenses", label: "food", value: decimal(data.food, 2), unit: "$" },
    recreation: { title: "Recreation Expenses", label: "recreation", value: decimal(data.recreation, 2), unit: "$" },
    education: { title: "Education Expenses", label: "education", value: decimal(data.education, 2), unit: "$" },
    shelter: { title: "Shelter Expenses", label: "shleter", value: decimal(data.shelter, 2), unit: "$" },
    saving: { title: "Saving Index", label: "saving", value: decimal(data.saving, 2), unit: "%" },
  }
}

router.get('/calendar/:type', async (req, res) => {
  const { type } = req.params;

  try {
    const expensesData = await calendar;

    const resultArray = expensesData.global.years.map(year => {
      const filteredMonths = year.months.map(month => {
        const filteredWeeks = month.weeks.map(week => {
          const filteredDays = week.days.map(day => {
            return {
              d: day.d,
              index: day[type],
            };
          });

          return {
            d: week.d,
            days: filteredDays,
          };
        });

        return {
          d: month.d,
          index: month[type],
          weeks: filteredWeeks,
        };

      });

      return {
        d: year.d,
        index: year[type],
        months: filteredMonths,
      };
    });

    res.json({ global: { d: 'global', index: expensesData.global[type], years: resultArray } });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server Error. Try again later.' });
  }
});


router.get('/path/:type/:date/:participantId?', async (req, res) => {
  const { type, date, participantId } = req.params;

  try {
    const data = await readAsyncFile('./data/calendar_path_expenses.json');

    let pathdata = participantId
      ? data.filter((participant) => participant.participantId === participantId)
      : data;

    if (date !== 'global') {
      pathdata = pathdata.map((participant) => {
        participant.movements = participant.movements.filter((movement) => {
          const movementDate = movement.timestamp;
          return (
            movementDate.split('-').slice(0, 2).join('-') === date || // month
            movementDate.split('-').slice(0, 1).join('-') === date || // year
            movementDate === date // day
          );
        });
        return participant;
      });
    }

    if (type === 'frequency') {
      const [top10Freq, pathFrequency] = await Promise.all([
        calculateTop10Freq(pathdata),
        calculatePathFrequency(pathdata),
      ]);

      const mostFrequentPath = getMostFrequentPath(pathFrequency);

      const movementsWithMostFrequentPath = pathdata.flatMap((participant) =>
        participant.movements.filter((movement) => movement.path === mostFrequentPath)
      );

      const minExpenseObj = getMinExpenseObj(movementsWithMostFrequentPath);

      res.json({ path: minExpenseObj, top: top10Freq });
    }

    if (type === 'expenses') {
      const placeExpensesMap = calculatePlaceExpensesMap(pathdata);
      const top10Expenses = getTop10Expenses(placeExpensesMap);
      const minAbsoluteExpensesObj = getMinAbsoluteExpensesObj(pathdata);

      res.json({ path: minAbsoluteExpensesObj, top: top10Expenses });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server Error. Try again later.' });
  }
});

async function calculateTop10Freq(pathdata) {
  const allPaths = pathdata.flatMap((participant) =>
    participant.movements.flatMap((movement) => movement.path.split('-'))
  );

  const numberFrequency = allPaths.reduce((acc, number) => {
    acc[number] = (acc[number] || 0) + 1;
    return acc;
  }, {});

  const sortedNumbers = Object.keys(numberFrequency).sort((a, b) => numberFrequency[b] - numberFrequency[a]);

  return sortedNumbers.slice(0, 10).map((place) => ({
    place,
    value: numberFrequency[place],
  }));
}

function calculatePathFrequency(pathdata) {
  const pathFrequency = pathdata
    .flatMap((participant) => participant.movements)
    .reduce((acc, movement) => {
      const path = movement.path;
      acc[path] = (acc[path] || 0) + 1;
      return acc;
    }, {});

  return pathFrequency;
}

function getMostFrequentPath(pathFrequency) {
  return Object.keys(pathFrequency).reduce((a, b) => (pathFrequency[a] > pathFrequency[b] ? a : b), '');
}

function getMinExpenseObj(movements) {
  if (movements.length === 0) {
    return {}; // or any default value based on your requirements
  }

  return movements.reduce((min, current) =>
    current.total_expenses < min.total_expenses ? current : min
  );
}

function calculatePlaceExpensesMap(pathdata) {
  const placeExpensesMap = new Map();

  for (const participant of pathdata) {
    for (const movement of participant.movements) {
      const places = movement.path.split('-');
      const expensesList = movement.expenses_list;

      for (let index = 0; index < places.length; index++) {
        const place = places[index];
        const totalExpenses = placeExpensesMap.get(place) || 0;
        placeExpensesMap.set(place, totalExpenses + expensesList[index]);
      }
    }
  }
  return placeExpensesMap;
}

function getTop10Expenses(placeExpensesMap) {
  return [...placeExpensesMap.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(([place, value]) => ({ place, value }));
}

function getMinAbsoluteExpensesObj(pathdata) {
  return pathdata.reduce((minExpenseMovement, currentObj) => {
    const currentMinExpenseMovement = currentObj.movements.reduce((min, movement) =>
      movement.total_expenses < min.total_expenses ? movement : min
    , currentObj.movements[0]);

    if (!currentMinExpenseMovement) {
      return minExpenseMovement;
    }

    return currentMinExpenseMovement.total_expenses < minExpenseMovement.total_expenses
      ? currentMinExpenseMovement
      : minExpenseMovement;
  }, { total_expenses: Infinity });
}

router.get('/wage/andament/:participant?', async (req, res) => {
  const { participant } = req.params

  try {

    const data = await calendar_wesfr;
    const filteredArray = participant ? data.filter(item => item.participantId === participant) : data;


    const result = filteredArray.map(({ participantId, wage }) => {
      const wageMonth = wage.reduce((acc, { timestamp, amount }) => {
        const month = timestamp.slice(0, 7);
        acc[month] = (acc[month] || 0) + amount;
        return acc;
      }, {});


      const wages = Object.entries(wageMonth).map(([month, amount]) => ({ timestamp: month, value: amount }));

      return {
        participantId,
        wages,
      };
    });

    // Sort the result array by participantId
    result.sort((a, b) => a.participantId.localeCompare(b.participantId));

    res.json(result)

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server Error. Try again later.' });
  }
});

router.get('/distribution/:type/:date/:sort', async (req, res) => {

  const { type, date, sort } = req.params;

  try { 
    const data = await calendar_wesfr;
    let resultData;

    if (type === 'saving') {  
      const sumByDate = (arr, date) =>
      Array.isArray(arr)
        ? arr.filter((item) => 
            item && 
            item.timestamp && 
            (date === 'global' || item.timestamp.startsWith(date))
          )
          .reduce((acc, curr) => acc + curr.amount, 0)
        : 0;
  
      // Funzione per ottenere il risultato per ogni partecipante
      const calculateTotals = (participant) => {
        const result = {
          participantId: participant.participantId,
          food: sumByDate(participant.food, date),
          shelter: sumByDate(participant.shelter, date),
          wage: sumByDate(participant.wage, date),
          education: sumByDate(participant.education, date),
          recreation: sumByDate(participant.recreation, date),
        };
  
        return result;
      };
  
      // Funzione principale per ottenere i risultati per tutti i partecipanti
      const calculateAllTotals = (data) => {
        const totals = data.map((participant) => calculateTotals(participant));
        return totals;
      };
  
      const results = calculateAllTotals(data).map(item => {
        const value = (item.wage + (item.food + item.shelter + item.education + item.recreation)) / (item.wage === 0 ? 1 : item.wage) * 100;
        return { participantId: item.participantId, value };
      });;
  
      resultData = results;
    }else{

    // Filtra i dati in base alla data e al tipo
      resultData = data.map(({ participantId, [type]: data }) => {
        if (!data) {
          return { participantId, value: 0 }; // Se il campo è undefined, restituisci sum = 0
        }
        // Filtra i dati in base alla data
        const filteredValues = data.filter(entry => {
          const entryDate = new Date(entry.timestamp);

          switch (true) {
            case date === "global":
              return true; // Nessun filtraggio sulla data
            case /^\d{4}$/.test(date): // Anno (YYYY)
              return entryDate.getFullYear().toString() === date;
            case /^\d{4}-\d{2}$/.test(date): // Anno-mese (YYYY-MM)
              return entryDate.toISOString().slice(0, 7) === date;
            case /^\d{4}-\d{2}-\d{2}$/.test(date): // Anno-mese-giorno (YYYY-MM-DD)
              return entryDate.toISOString().slice(0, 10) === date;
            default:
              return false;
          }
        });
        // Calcola la somma dei valori filtrati
        const sum = filteredValues.reduce((acc, entry) => acc + entry.amount, 0);

        // Convert the sum to an integer
        const sumInteger = parseInt(sum, 10);

        return { participantId, value: sumInteger };
      });
    }

    // Sort the filteredData by participantId

    const sortedData = resultData.sort((a, b) => sort === 'participant' ? a.participantId - b.participantId : b.value - a.value);

    res.json(sortedData);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server Error. Try again later.' });
  }
});


export default router;
