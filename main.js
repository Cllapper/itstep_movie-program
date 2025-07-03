document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = 'b542d01a';
  const BASE_URL = `https://www.omdbapi.com/`;

  const form = document.getElementById('search-form');
  const titleInput = document.getElementById('title-input');
  const typeSelect = document.getElementById('type-select');
  const resultsContainer = document.getElementById('results-container');
  const paginationContainer = document.getElementById('pagination-container');
  const detailsContainer = document.getElementById('details-container');

  let currentSearchTitle = '';
  let currentSearchType = '';
  let currentPage = 1;

  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      currentPage = 1;
      currentSearchTitle = titleInput.value.trim();
      currentSearchType = typeSelect.value;
      await searchAndDisplayMovies();
  });

  async function searchAndDisplayMovies() {
      if (!currentSearchTitle) return;

      resultsContainer.innerHTML = 'Завантаження...';
      paginationContainer.innerHTML = '';
      detailsContainer.innerHTML = '';

      const url = `${BASE_URL}?s=${currentSearchTitle}&type=${currentSearchType}&page=${currentPage}&apikey=${API_KEY}`;

      try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.Response === 'True') {
              displayMovies(data.Search);
              displayPagination(data.totalResults);
          } else {
              resultsContainer.innerHTML = `<p>${data.Error || 'Movie not found!'}</p>`;
          }
      } catch (error) {
          resultsContainer.innerHTML = '<p>Помилка запиту. Спробуйте пізніше.</p>';
      }
  }

  function displayMovies(movies) {
      resultsContainer.innerHTML = '';
      movies.forEach(movie => {
          const movieCard = document.createElement('div');
          movieCard.className = 'movie-card';

          const poster = movie.Poster === 'N/A' ? 'https://via.placeholder.com/180x250.png?text=No+Image' : movie.Poster;

          movieCard.innerHTML = `
              <img src="${poster}" alt="${movie.Title}">
              <h3>${movie.Title}</h3>
              <p>${movie.Year}</p>
              <button class="details-btn" data-id="${movie.imdbID}">Details</button>
          `;
          resultsContainer.appendChild(movieCard);
      });

      document.querySelectorAll('.details-btn').forEach(button => {
          button.addEventListener('click', () => {
              showMovieDetails(button.dataset.id);
          });
      });
  }

  function displayPagination(totalResults) {
      const totalPages = Math.ceil(totalResults / 10);
      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
          const button = document.createElement('button');
          button.textContent = i;
          if (i === currentPage) {
              button.className = 'active';
          }
          button.addEventListener('click', () => {
              currentPage = i;
              searchAndDisplayMovies();
          });
          paginationContainer.appendChild(button);
      }
  }

  async function showMovieDetails(imdbID) {
      detailsContainer.innerHTML = 'Завантаження деталей...';
      const url = `${BASE_URL}?i=${imdbID}&apikey=${API_KEY}`;

      try {
          const response = await fetch(url);
          const data = await response.json();

          detailsContainer.innerHTML = `
              <div class="details-poster">
                  <img src="${data.Poster === 'N/A' ? 'https://via.placeholder.com/250x350.png?text=No+Image' : data.Poster}" alt="${data.Title}">
              </div>
              <div class="details-info">
                  <h2>${data.Title} (${data.Year})</h2>
                  <table>
                      <tr><td>Released:</td><td>${data.Released}</td></tr>
                      <tr><td>Genre:</td><td>${data.Genre}</td></tr>
                      <tr><td>Country:</td><td>${data.Country}</td></tr>
                      <tr><td>Director:</td><td>${data.Director}</td></tr>
                      <tr><td>Writer:</td><td>${data.Writer}</td></tr>
                      <tr><td>Actors:</td><td>${data.Actors}</td></tr>
                      <tr><td>Awards:</td><td>${data.Awards}</td></tr>
                  </table>
                  <p><b>Plot:</b> ${data.Plot}</p>
              </div>
          `;
      } catch (error) {
          detailsContainer.innerHTML = '<p>Не вдалося завантажити деталі.</p>';
      }
  }
});
