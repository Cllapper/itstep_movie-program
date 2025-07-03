const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host([open]) .overlay {
      display: flex;
    }
    .overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-color: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 700px;
      width: 90%;
      position: relative;
    }
    .close-btn {
      position: absolute;
      top: 10px; right: 20px;
      font-size: 28px;
      cursor: pointer;
    }
    .content {
      display: flex;
      gap: 20px;
    }
    .content img {
      max-width: 250px;
      border-radius: 4px;
    }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    td:first-child { font-weight: bold; width: 100px; }
  </style>
  <div class="overlay">
    <div class="modal">
      <span class="close-btn">×</span>
      <div class="modal-body"></div>
    </div>
  </div>
`;

export class MovieModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.querySelector('.close-btn').addEventListener('click', this.close.bind(this));
    this.shadowRoot.querySelector('.overlay').addEventListener('click', (e) => {
        if (e.target === this.shadowRoot.querySelector('.overlay')) {
            this.close();
        }
    });
  }

  open() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

  setLoading() {
    this.shadowRoot.querySelector('.modal-body').innerHTML = '<loading-spinner></loading-spinner>';
  }

  render(movie) {
    this.shadowRoot.querySelector('.modal-body').innerHTML = `
      <div class="content">
          <img src="${movie.Poster === 'N/A' ? 'https://via.placeholder.com/250x370?text=No+Image' : movie.Poster}" alt="${movie.Title}">
          <div>
            <h3>${movie.Title} (${movie.Year})</h3>
            <p>${movie.Plot}</p>
            <table>
              <tr><td>Released:</td><td>${movie.Released}</td></tr>
              <tr><td>Genre:</td><td>${movie.Genre}</td></tr>
              <tr><td>Director:</td><td>${movie.Director}</td></tr>
              <tr><td>Actors:</td><td>${movie.Actors}</td></tr>
            </table>
          </div>
      </div>
    `;
  }
}
