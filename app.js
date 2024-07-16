const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TEST_SERVER_API = "http://localhost:9876/numbers/e";
let numbersStorage = [];

const fetchNumbers = async (numberId) => {
  try {
    const response = await axios.get(`${TEST_SERVER_API}/${numberId}`, { timeout: 500 });
    if (response.status === 200) {
      const numbers = response.data.numbers || [];
      return [...new Set(numbers)]; // Return unique numbers
    }
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
  }
  return [];
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;

  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const prevState = [...numbersStorage];
  const newNumbers = await fetchNumbers(numberId);

  newNumbers.forEach(num => {
    if (!numbersStorage.includes(num)) {
      if (numbersStorage.length >= WINDOW_SIZE) {
        numbersStorage.shift(); 
      }
      numbersStorage.push(num);
    }
  });

  const currState = [...numbersStorage];
  const avg = calculateAverage(numbersStorage);

  const response = {
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: newNumbers,
    avg: avg
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
