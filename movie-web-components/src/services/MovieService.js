export class MovieService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.omdbapi.com/';
  }

  async search(title, page = 1) {
    const url = `${this.baseUrl}?s=${encodeURIComponent(title)}&page=${page}&apikey=${this.apiKey}`;
    const response = await fetch(url);
    return response.json();
  }

  async getMovie(movieId) {
    const url = `${this.baseUrl}?i=${movieId}&apikey=${this.apiKey}`;
    const response = await fetch(url);
    return response.json();
  }
}
