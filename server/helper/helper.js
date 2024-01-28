// Helper function to extract x, y coordinates from the location string
const extractCoordinates = (location) => {
  const polygonRegex = /POLYGON \(\(([^)]+)\)\)/;
  const alternativePolygonRegex = /POLYGON \(\(([^)]+)\), \(([^)]+)\)\)/
  const pointRegex = /POINT \((-?\d+\.?\d*) (-?\d+\.?\d*)\)/;

  let type = polygonRegex.exec(location) || alternativePolygonRegex.exec(location) ? 'polygon' : 'point'; // Fix: 'polygon' instead of 'poligon'
  const match = type === 'polygon' ? polygonRegex.exec(location) ? polygonRegex.exec(location) : alternativePolygonRegex.exec(location) : pointRegex.exec(location);


  if (match) {
    if (type === 'polygon') {
      const coordinates = match[1].split(",").map((point) => {
        const [x, y] = point.trim().split(" ");
        return { x, y };
      });
      return coordinates;
    }
    if (type === 'point') {
      return { x: match[1], y: match[2] };
    }
  }

  return [];
};



const getMode = (array) => {
  const modeMap = {};
  let maxCount = 0;
  let mode = null;

  for (const item of array) {
    modeMap[item] = (modeMap[item] || 0) + 1;
    if (modeMap[item] > maxCount) {
      maxCount = modeMap[item];
      mode = item;
    }
  }

  return mode;
}

const decimal = (value, decimal) => {
  return parseFloat(value.toFixed(decimal))
}

const formatDate = (dateString, formatType) => {
  const date = new Date(dateString);

  if (formatType != "week" && isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    weekday: 'short',
    week: 'short',
  };

  switch (formatType) {
    case 'day':
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

    case 'week':
      return dateString;

    case 'month':
      return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);

    case 'year':
      return new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);

    default:
      return 'Invalid formatType';
  }
};

Date.prototype.getWeek = function () {
  const target = new Date(this.valueOf());
  const dayNr = (this.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
};


const formatWeek = (date) => {
  const year = date.getFullYear();
  const weekNumber = Math.ceil((date - new Date(year, 0, 1)) / 86400000 / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};


export { extractCoordinates, getMode, decimal, formatDate, formatWeek };
