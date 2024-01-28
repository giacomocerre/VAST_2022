import express from "express";
import { extractCoordinates } from "../../helper/helper.js";
import { buildings, places } from "../../helper/loader.js";

const router = express.Router();

/********************************************************************************************
*********************************************************************************************
 * @api {get} /buildings/map Get Building Map Information
 * @apiName GetBuildingMap
*********************************************************************************************
*********************************************************************************************/
router.get("/map", async (req, res) => {
  try {
    const data = await buildings;
    const places_data = await places
    const getPlaces = (lists)=> {
      const result = lists.map(id => {
        const place = places_data.find(place => place.id === id);
        return place ? { id, type: place.type } : {id, type: 'Unkown'};
      });
      return result
    }
    const response = data.map(
      ({ id, location, buildingType, maxOccupancy, units }) => ({
        buildingId: id,
        location: extractCoordinates(location),
        buildingType,
        maxOccupancy,
        units: getPlaces(units),
      })
    );

    res.json(response);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

/********************************************************************************************
*********************************************************************************************
 * @api {get} /buildings/places/:type/:id? Get Places
 * @apiName GetPlaces
 * 
 * @param type = can be {employer, commercial, school. residential}
 * @param id = number
*********************************************************************************************
*********************************************************************************************/
router.get("/place/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await places;
    let response = data.find(item => item.id.toString() === id);
    res.json(response);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

/********************************************************************************************
*********************************************************************************************
 * @api {get} /locations/:type/:id? Get the entire list of places location on the map
 * @apiName GetPlaceLocations
 *
 * @param type  can be {employer, apartment, school, restaurant, pub, all}
 * @param id (optional) is an integer
*********************************************************************************************
*********************************************************************************************/
router.get("/locations/:type/:id?", async (req, res) => {
  const { type, id } = req.params;

  try {
    const data = await places;

    const filterData = (data, type, id = null) => {
      return data.filter(item => {
        const typeMatch = item.type.toLowerCase() === type.toLowerCase();
        const idMatch = id === null || item.id === parseInt(id);
        return typeMatch && idMatch;
      });
    };

    res.json( filterData(data, type, id));
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
