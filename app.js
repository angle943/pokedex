// DOM Objects
const mainScreen = document.querySelector('.main-screen');
const pokeName = document.querySelector('.poke-name');
const pokeId = document.querySelector('.poke-id');
const pokeFrontImage = document.querySelector('.poke-front-image');
const pokeBackImage = document.querySelector('.poke-back-image');
const pokeTypeOne = document.querySelector('.poke-type-one');
const pokeTypeTwo = document.querySelector('.poke-type-two');
const pokeWeight = document.querySelector('.poke-weight');
const pokeHeight = document.querySelector('.poke-height');
const pokeListItems = document.querySelectorAll('.list-item');
const leftButton = document.querySelector('.left-button');
const rightButton = document.querySelector('.right-button');


// constants and variables
// Array of Pokemon types
const TYPES = [
  'normal', 'fighting', 'flying',
  'poison', 'ground', 'rock',
  'bug', 'ghost', 'steel',
  'fire', 'water', 'grass',
  'electric', 'psychic', 'ice',
  'dragon', 'dark', 'fairy'
];
// Variables to store the previous and next URLs for the Pokemon list
let prevUrl = null;
let nextUrl = null;


// Functions

// Function to capitalize the first letter of a string
const capitalize = (str) => str[0].toUpperCase() + str.substr(1);

// Function to reset the screen
const resetScreen = () => {
  mainScreen.classList.remove('hide');
  // Remove all type classes from the main screen
  for (const type of TYPES) {
    mainScreen.classList.remove(type);
  }
};

// Function to fetch the Pokemon list from a given URL
const fetchPokeList = url => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const { results, previous, next } = data;
      prevUrl = previous;
      nextUrl = next;

      // Populate the Pokemon list items with data from the fetched results
      for (let i = 0; i < pokeListItems.length ; i++) {
        const pokeListItem = pokeListItems[i];
        const resultData = results[i];

        if (resultData) {
          const { name, url } = resultData;
          const urlArray = url.split('/');
          const id = urlArray[urlArray.length - 2];
          pokeListItem.textContent = id + '. ' + capitalize(name);
        } else {
          pokeListItem.textContent = '';
        }
      }
    });
};

// Function to handle the search button click event
const handleSearchButtonClick = () => {
  const searchTerm = prompt("Enter the name of the Pokemon you're looking for:");
  if (searchTerm) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`)
      .then(res => res.json())
      .then(data => fetchPokeData(data.id))
      .catch(err => {
        // If the Pokemon is not found, suggest the closest match
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
          .then(res => res.json())
          .then(data => {
            const pokemonNames = data.results.map(pokemon => pokemon.name);
            const closestMatch = findClosestMatch(searchTerm, pokemonNames);
            const userResponse = confirm(`Pokemon not found. Did you mean ${closestMatch}?`);
            if (userResponse) {
              fetch(`https://pokeapi.co/api/v2/pokemon/${closestMatch}`)
                .then(res => res.json())
                .then(data => fetchPokeData(data.id));
            }
          });
      });
  }
};

// Function to find the closest match to a given string in an array of strings
const findClosestMatch = (str, arr) => {
  return arr.reduce((prev, curr) => {
    return (levenshteinDistance(str, curr) < levenshteinDistance(str, prev) ? curr : prev);
  });
};

// Function to calculate the Levenshtein distance between two strings
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) === a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
      }
    }
  }

  return matrix[b.length][a.length];
};

// Add event listener to the search button
document.querySelector('.search-button').addEventListener('click', handleSearchButtonClick);


// Function to fetch data for a specific Pokemon by ID
const fetchPokeData = id => {
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(res => res.json())
    .then(data => {
      resetScreen();

      const dataTypes = data['types'];
      const dataFirstType = dataTypes[0];
      const dataSecondType = dataTypes[1];
      pokeTypeOne.textContent = capitalize(dataFirstType['type']['name']);
      // If the Pokemon has a second type, display it
      if (dataSecondType) {
        pokeTypeTwo.classList.remove('hide');
        pokeTypeTwo.textContent = capitalize(dataSecondType['type']['name']);
      } else {
        pokeTypeTwo.classList.add('hide');
        pokeTypeTwo.textContent = '';
      }
      mainScreen.classList.add(dataFirstType['type']['name']);

      // Display the fetched Pokemon data on the screen
      pokeName.textContent = capitalize(data['name']);
      pokeId.textContent = '#' + data['id'].toString().padStart(3, '0');
      pokeWeight.textContent = data['weight'];
      pokeHeight.textContent = data['height'];
      pokeFrontImage.src = data['sprites']['front_default'] || '';
      pokeBackImage.src = data['sprites']['back_default'] || '';
    });
};

// Function to handle the left button click event
const handleLeftButtonClick = () => {
  if (prevUrl) {
    fetchPokeList(prevUrl);
  }
};

// Function to handle the right button click event
const handleRightButtonClick = () => {
  if (nextUrl) {
    fetchPokeList(nextUrl);
  }
};

// Function to handle the list item click event
const handleListItemClick = (e) => {
  if (!e.target) return;

  const listItem = e.target;
  if (!listItem.textContent) return;

  const id = listItem.textContent.split('.')[0];
  fetchPokeData(id);
};


// adding event listeners
// Add click event listeners to the left and right buttons
leftButton.addEventListener('click', handleLeftButtonClick);
rightButton.addEventListener('click', handleRightButtonClick);
// Add click event listeners to the Pokemon list items
for (const pokeListItem of pokeListItems) {
  pokeListItem.addEventListener('click', handleListItemClick);
}


// initialize App
// Fetch the initial Pokemon list
fetchPokeList('https://pokeapi.co/api/v2/pokemon?offset=0&limit=20');
