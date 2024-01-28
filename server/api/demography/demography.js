import express from "express";
import { getMode } from "../../helper/helper.js";
import { participants } from "../../helper/loader.js";

const router = express.Router();

/********************************************************************************************
/********************************************************************************************
 * @api {get} /participants/:type  Total number of participants
 * @apiName Participants
 *
 * @param type {String} type Type of calculation.
*********************************************************************************************/
router.get("/participants", async (req, res) => {
    try {
        const data = await participants;

        res.json({
            title: "Total Participants",
            description: "This value represents the total number of participants who are present in the dataset.",
            value: data.length
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try later." });
    }
});

router.get("/participant/:id", async (req, res) => {
    const { id } = req.params
    try {
        const data = await participants;

        const participant = data.filter (participant => participant.id === parseInt(id) )[0]

        res.json(participant);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try later." });
    }
});

/********************************************************************************************
/********************************************************************************************
 * @api {get} /average/:type Calculate Average Age or Education Level Mode
 * @apiName CalculateAverage
 *
 * @param type {String} type Type of calculation ("age" or "education").
*********************************************************************************************/
router.get("/average/:type", async (req, res) => {
    const { type } = req.params;

    try {
        const data = await participants;

        if (type === "age") {
            const averageAge = parseInt(data.reduce((sum, { age }) => sum + age, 0) / data.length);
            res.json({
                title: "Average Age",
                description: "This value represents the average age of the participants in the dataset.",
                value: averageAge
            });
        } else if (type === "education") {
            const educationLevels = data.map(({ educationLevel }) => educationLevel);
            const educationMode = getMode(educationLevels);
            res.json({
                title: "Education Level Mode",
                description: "This value represents the most common education level among the participants in the dataset.",
                value: educationMode
            });
        } else {
            res.status(400).json({
                message: "Invalid request type for this dataset. Please use this API as follows: /average/:type, where 'type' can only be 'age' or 'education'."
            });        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error. Try later." });
    }
});

/********************************************************************************************
 * @api {get} /kids Get Participants with and without Kids
 * @apiName GetParticipantsWithKids
*********************************************************************************************/
router.get("/kids", async (req, res) => {
    try {
        const data = await participants;
        let totalYes = 0;
        let totalNo = 0;
        const totalParticipants = data.length;

        data.forEach((participant) => {
            if (participant.haveKids === true) {
                totalYes++;
            } else {
                totalNo++;
            }
        });

        const response = {
            yes: {
                title: "Participants with kids",
                description: "Percentual value of participants with kids",
                value: Math.round((totalYes / totalParticipants) * 100),
                measure: "%"
            },
            no: {
                title: "Participants without kids",
                description: "Percentual value of participants without kids",
                value: Math.round((totalNo / totalParticipants) * 100),
                measure: "%"
            },
        };

        res.json(response);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
})


export default router;
