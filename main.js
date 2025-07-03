class MovieService {
  constructor(apiKey) {
      this.apiKey = apiKey;
      this.baseUrl = `https://www.omdbapi.com/`;
  }

  async search(title, type, page) {
      const url = `${this.baseUrl}?s=${title}&type=${type}&page=${page}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      return await response.json();
  }

  async getMovie(id) {
      const url = `${this.baseUrl}?i=${id}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      return await response.json();
  }
}

class UIManager {
  constructor() {
      this.resultsContainer = document.getElementById('results-container');
      this.filmsHeader = document.getElementById('films-header');
      this.moreContainer = document.getElementById('more-container');
      this.loader = document.getElementById('loader');
      this.modal = document.getElementById('modal');
      this.modalBody = document.getElementById('modal-body');
      document.querySelector('.close-btn').addEventListener('click', () => this.toggleModal(false));
      this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.toggleModal(false);
      });
  }

  toggleLoader(show) {
      this.loader.classList.toggle('hidden', !show);
  }

  renderMovies(movies, append = false) {
      if (!append) {
          this.resultsContainer.innerHTML = '';
      }

      const movieCards = movies.map(movie => {
          const poster = movie.Poster === 'N/A' ? 'https://via.placeholder.com/160x240?text=No+Poster' : movie.Poster;
          return `
              <div class="movie-card">
                  <img src="${poster}" alt="${movie.Title}">
                  <h3>${movie.Title}</h3>
                  <p>${movie.Year}</p>
                  <button class="details-btn" data-id="${movie.imdbID}">Details</button>
              </div>
          `;
      }).join('');

      this.resultsContainer.insertAdjacentHTML('beforeend', movieCards);
      this.filmsHeader.classList.remove('hidden');
  }

  displayError(message) {
      this.resultsContainer.innerHTML = `<p>${message}</p>`;
      this.filmsHeader.classList.add('hidden');
  }

  toggleMoreButton(show, totalResults, currentPage) {
      this.moreContainer.innerHTML = '';
      if (show && totalResults > currentPage * 10) {
          const moreBtn = document.createElement('button');
          moreBtn.id = 'more-btn';
          moreBtn.textContent = 'More';
          this.moreContainer.appendChild(moreBtn);
          return moreBtn;
      }
      return null;
  }

  toggleModal(show) {
      this.modal.classList.toggle('hidden', !show);
      if (!show) {
          this.modalBody.innerHTML = '';
      }
  }

  renderMovieDetails(data) {
      const poster = data.Poster === 'N/A' ? 'https://via.placeholder.com/250x370?text=No+Poster' : data.Poster;
      this.modalBody.innerHTML = `
          <div class="details-poster">
              <img src="${poster}" alt="${data.Title}">
          </div>
          <div class="details-info">
              <h3>${data.Title}</h3>
              <table>
                  <tr><td>Released:</td><td>${data.Released}</td></tr>
                  <tr><td>Genre:</td><td>${data.Genre}</td></tr>
                  <tr><td>Country:</td><td>${data.Country}</td></tr>
                  <tr><td>Director:</td><td>${data.Director}</td></tr>
                  <tr><td>Writer:</td><td>${data.Writer}</td></tr>
                  <tr><td>Actors:</td><td>${data.Actors}</td></tr>
                  <tr><td>Awards:</td><td>${data.Awards}</td></tr>
              </table>
          </div>
      `;
  }
}

class App {
  constructor() {
      this.movieService = new MovieService('b542d01a');
      this.ui = new UIManager();
      this.form = document.getElementById('search-form');
      this.titleInput = document.getElementById('title-input');
      this.typeSelect = document.getElementById('type-select');
      this.currentPage = 1;
      this.currentSearch = {};

      this.form.addEventListener('submit', this.handleSearch.bind(this));
      document.body.addEventListener('click', this.handleBodyClick.bind(this));
  }

  async handleSearch(e) {
      e.preventDefault();
      this.currentPage = 1;
      this.currentSearch.title = this.titleInput.value.trim();
      this.currentSearch.type = this.typeSelect.value;
      this.ui.toggleMoreButton(false);
      this.ui.resultsContainer.innerHTML = '';
      this.ui.filmsHeader.classList.remove('hidden');
      this.ui.toggleLoader(true);

      try {
          const data = await this.movieService.search(this.currentSearch.title, this.currentSearch.type, this.currentPage);
          if (data.Response === "True") {
              this.currentSearch.totalResults = data.totalResults;
              this.ui.renderMovies(data.Search);
              this.addMoreButton();
          } else {
              this.ui.displayError(data.Error);
          }
      } catch (error) {
          this.ui.displayError("An error occurred. Please try again.");
      } finally {
          this.ui.toggleLoader(false);
      }
  }

  addMoreButton() {
      const moreBtn = this.ui.toggleMoreButton(true, this.currentSearch.totalResults, this.currentPage);
      if (moreBtn) {
          moreBtn.addEventListener('click', this.handleLoadMore.bind(this));
      }
  }

  async handleLoadMore(e) {
      this.currentPage++;
      e.target.disabled = true;
      this.ui.toggleLoader(true);

      try {
          const data = await this.movieService.search(this.currentSearch.title, this.currentSearch.type, this.currentPage);
          if (data.Response === "True") {
              this.ui.renderMovies(data.Search, true);
              if (this.currentSearch.totalResults > this.currentPage * 10) {
                   e.target.disabled = false;
              } else {
                  this.ui.toggleMoreButton(false);
              }
          } else {
               this.ui.toggleMoreButton(false);
          }
      } catch (error) {
          alert('Failed to load more movies.');
           e.target.disabled = false;
      } finally {
          this.ui.toggleLoader(false);
      }
  }

  async handleBodyClick(e) {
      if (e.target.classList.contains('details-btn')) {
          const movieId = e.target.dataset.id;
          this.ui.toggleModal(true);
          this.ui.modalBody.innerHTML = '<div class="loader"></div>';

          try {
               const movieData = await this.movieService.getMovie(movieId);
               this.ui.renderMovieDetails(movieData);
          } catch (error) {
              this.ui.modalBody.innerHTML = '<p>Failed to load details.</p>';
          }
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
