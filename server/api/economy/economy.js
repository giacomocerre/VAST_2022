import express from "express";
import { decimal } from "../../helper/helper.js";
import { global_financials, participants } from "../../helper/loader.js";

const router = express.Router();

/********************************************************************************************
 * @api {get} /global/:type Get Global Percentage
 * @apiName GetGlobalPercentage
 *
 * @param type Type of data to calculate the global percentage of Saving Index and Stability (e.g., 'saving', 'stable', 'unstable').
********************************************************************************************/
router.get("/global/:type", async (req, res) => {
    const { type } = req.params;

    try {
        const data = await participants;
        const unit = "%";
        let key;
        let title;
        let description;

        if (type === "saving") {
            key = "savingIndex";
            title = "Economic Saving Index";
            description = "Percentage of participants economic saving index";
        } else if (type === "stable") {
            key = "stability.stable";
            title = "Economic Stability (Stable)";
            description = "Percentage of participants with stable economic stability";
        } else if (type === "unstable") {
            key = "stability.unstable";
            title = "Economic Stability (Unstable)";
            description = "Percentage of participants with unstable economic stability";
        } else {
            return res.status(400).json({ error: "Invalid type parameter. Use 'saving', 'stable', or 'unstable'." });
        }

        // Calculate the rounded global percentage manually for the specified economic metric
        const totalValue = data.reduce((acc, participant) => {
            const nestedValue = key.split('.').reduce((obj, prop) => obj && obj[prop], participant);
            return acc + (nestedValue || 0);
        }, 0);

        const averageValue = (totalValue / data.length).toFixed(2);

        res.json({ title, description, value: parseFloat(averageValue), unit });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try again later." });
    }
});

/********************************************************************************************
 * @api {get} /trends/:filter Get Economic Trends Measure based on specific period (filter)
 * @apiName GetEconimicsTrendsByFilter
 *
 * @param filter Filter the data to calculate the measure for a specific period (e.g., 'day', 'week', 'month', 'year').
 * @returns {Promise} Average Wage, Average Expenses, Gini Index, Saving Index.
********************************************************************************************/
router.get("/trends/:filter/:type?", async (req, res) => {
    const { type, filter } = req.params;
    try {
        const data = await global_financials;
        const period = data[filter];
        const sumArray = period.list.map(item => {
            const { timestamp, wage, ...rest } = item;
            const sum = Object.values(rest).reduce((acc, value) => acc + value, 0);
            return sum;
        });

        const expensesAverage = sumArray.reduce((acc, value) => acc + value, 0) / sumArray.length;
        const response = {
            averageTrend: {
                title: `Wage Average and Trend (${filter})`,
                description: 'Average wage and trends earned over the specified period.',
                value: decimal(period.wageAverage, 2),
                unit: "$",
                trend: {
                    text: `trend over the ${filter}`,
                    value: decimal(period.wageTrend, 2),
                    unit: "%",
                }
            },

            expensesTrend: {
                title: `Expenses Average and Trends (${filter})`,
                description: 'Average expenses and their trend over the specified period.',
                value: decimal(expensesAverage, 2) * -1,
                unit: "$",
                trend: {
                    text: `trend over the ${filter}`,
                    value: decimal(((period.foodTrend + period.shelterTrend + period.educationTrend + period.recreationTrend) / 4), 2),
                    unit: '%'
                }
            },

            giniIndex: { title: `Gini Index (${filter})`, value: period.giniIndex, unit: "%" },
            savingIndex: { title: `SavingIndex (${filter})`, value: period.savingIndex, unit: "%" }
        }
        res.json(type ? response[type] : response)

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try again later." });
    }

})

/********************************************************************************************
 * @api {get} /lorenz/:filter Get Data for print Lorenz Curva on specific period (filter)
* @apiName GetLorenzCurvaData
*
* @param filter Filter the data to calculate the measure for a specific period (e.g., 'day', 'week', 'month', 'year').
********************************************************************************************/
router.get("/lorenz/:filter", async (req, res) => {
    const { filter } = req.params;
    try {
        const data = await participants;

        if (["day", "week", "month", "year"].includes(filter)) {
            // Filter data based on the filter parameter
            const filteredData = data.filter(participant => typeof participant[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`] === 'number');

            // Sort the data based on the value of average[Filter]Wage
            filteredData.sort((a, b) => a[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`] - b[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`]);

            const totalWage = filteredData.reduce((total, participant) => total + participant[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`], 0);
            let cumulativeWage = 0;
            const lorenzPoints = [];

            for (const participant of filteredData) {
                cumulativeWage += participant[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`] / totalWage;
                lorenzPoints.push(cumulativeWage);
            }

            // Prepare the response with title, description, and values
            const response = {
                title: "Lorenz Curve",
                description: `Lorenz curve for ${filter}ly wages distribution`,
                values: lorenzPoints,
            };

            res.json(response);
        } else {
            res.status(400).json({ error: "Invalid filter parameter. Use 'day', 'week', 'month', or 'year'." });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try again later." });
    }
});

router.get("/distribution/:filter/:age?", async (req, res) => {
    let { filter, age } = req.params;

    try {
        const data = await participants;
        let filteredData;
        const range = age ? age.split('-') : [];
        if (range.length === 2) {
            filteredData = data.filter(item => item.age >= range[0] && item.age <= range[1]);
            res.json(ageData('range'));
        } else if (age) {
            filteredData = data.filter(item => item.age == age);
            res.json(ageData('single'));
        } else {
            filteredData = data;
            res.json(ageData('range'));
        }

        function ageData(type) {
            const allAgesResult = {info:{}, data:[]};
            filteredData.forEach(participant => {
                const participantAge = participant.age;
                if (type === 'single') {
                    allAgesResult.info = {
                        title: 'Wage and Stability',
                        description: 'Wage and Stability Distribution over all the single participants of ' + age  + ' years old',
                    }
                    allAgesResult.data.push({
                        id: participant.id,
                        averageWage: participant[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`],
                        stable: participant.stability.stable,
                        unstable: participant.stability.unstable
                    })
                }

                if (type === 'range') {
                    allAgesResult.info = {
                        title: 'Wage and Stability',
                        description: 'Wage and Stability Distribution over all the participants of ' + age  + ' years old',
                    }
                    const filteredByAge = filteredData.filter(participant => participant.age === participantAge);

                    // Verifica se l'età è già presente in allAgesResult
                    const existingAgeIndex = allAgesResult.data.findIndex(result => result.id === participantAge);
                    
                    // Se l'età non è presente, aggiungi il nuovo oggetto
                    if (existingAgeIndex === -1) {
                        allAgesResult.data.push({
                            id: participantAge,
                            stable: filteredByAge.reduce((sum, participant) => sum + participant.stability.stable, 0) / filteredByAge.length,
                            unstable: filteredByAge.reduce((sum, participant) => sum + participant.stability.unstable, 0) / filteredByAge.length,
                            averageWage: filteredByAge.reduce((sum, participant) => sum + participant[`average${filter.charAt(0).toUpperCase()}${filter.slice(1)}Wage`], 0) / filteredByAge.length,
                        });
                    }
                }
            });
            allAgesResult.data.sort((a, b) => a.id - b.id);
            return allAgesResult;
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try again later." });
    }
});



export default router;