import { MovieService } from '../services/MovieService.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        .container {
            max-width: 1200px;
            margin: auto;
        }
    </style>
    <div class="container">
        <h1>Пошук фільмів</h1>
        <movie-search-form></movie-search-form>
        <movie-list></movie-list>
        <movie-modal></movie-modal>
    </div>
`;

export class MovieApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.movieService = new MovieService('b542d01a'); // ваш ключ

    this.movieList = this.shadowRoot.querySelector('movie-list');
    this.modal = this.shadowRoot.querySelector('movie-modal');

    this.state = {
        currentPage: 1,
        query: ''
    };
  }

  connectedCallback() {
      this.addEventListener('search', this.handleSearch.bind(this));
      this.addEventListener('load-more', this.handleLoadMore.bind(this));
      this.addEventListener('show-details', this.handleShowDetails.bind(this));
  }

  async handleSearch(e) {
      this.state.query = e.detail.query;
      this.state.currentPage = 1;
      this.movieList.setLoading(true);

      const data = await this.movieService.search(this.state.query, this.state.currentPage);

      this.movieList.update({
          movies: data.Search,
          append: false,
          totalResults: data.totalResults,
          currentPage: this.state.currentPage
      });
  }

  async handleLoadMore() {
      this.state.currentPage++;
      this.movieList.setLoading(true, true);

      const data = await this.movieService.search(this.state.query, this.state.currentPage);

      this.movieList.update({
          movies: data.Search,
          append: true,
          totalResults: data.totalResults,
          currentPage: this.state.currentPage
      });
      this.movieList.setLoading(false, true);
  }

  async handleShowDetails(e) {
      const movieId = e.detail.movieId;
      this.modal.open();
      this.modal.setLoading();

      const movieDetails = await this.movieService.getMovie(movieId);
      this.modal.render(movieDetails);
  }
}
