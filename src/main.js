// Data

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  params: {
    api_key: API_KEY,
    language: navigator.language || "en",
  },
});

function likedMoviesList() {
  const item = JSON.parse(localStorage.getItem("liked_movies"));
  let movies;

  if (item) {
    movies = item;
  } else {
    movies = {};
  }

  return movies;
}

function likeMovie(movie) {
  const likedMovies = likedMoviesList();

  if (likedMovies[movie.id]) {
    likedMovies[movie.id] = undefined;
  } else {
    likedMovies[movie.id] = movie;
  }

  localStorage.setItem("liked_movies", JSON.stringify(likedMovies));
  getTrendingMoviesPreview();
  getLikedMovies();
}

// Utils
const langs = [
  {
    lang: "es",
    captions: {
      trends: "Tendencias",
      category: "Categorias",
      likedTitle: "Peliculas Favoritas",
      trendMore: "Ver Más",
      footerCaption: "Hecho con amor en Platzi por @juandc",
      selectLang: "Seleccione Idioma",
      search: "Buscar",
    },
  },
  {
    lang: "en",
    captions: {
      trends: "Trends",
      category: "Categories",
      likedTitle: "Favorite Movies",
      trendMore: "More",
      footerCaption: "Made with love in Platzi by @juandc",
      selectLang: "Select a language",
      search: "Search",
    },
  },
  {
    lang: "pt",
    captions: {
      trends: "Tendências",
      category: "Categorias",
      likedTitle: "Filmes Favoritos",
      trendMore: "Ver mais",
      footerCaption: "Feito com amor em Platzi por @juandc",
      selectLang: "Selecione um idioma",
      search: "Procurar",
    },
  },
  {
    lang: "gr",
    captions: {
      trends: "Tendenzen",
      category: "Kategorien",
      likedTitle: "Lieblingsfilme",
      trendMore: "Mehr sehen",
      footerCaption: "Mit Liebe gemacht in Platzi von @juandc",
      selectLang: "Wähle eine Sprache",
      search: "Suche",
    },
  },
  {
    lang: "ar",
    captions: {
      trends: "اتجاهات",
      category: "فئات",
      likedTitle: "الأفلام المفضلة",
      trendMore: "المزيد",
      footerCaption: "صنع بكل حب في Platzi بواسطةjuandc",
      selectLang: "اختر لغة",
      search: "بحث",
    },
  },
  {
    lang: "fr",
    captions: {
      trends: "Les tendances",
      category: "Catégories",
      likedTitle: "voir plus",
      trendMore: "Mehr sehen",
      footerCaption: "Fait avec amour à Platzi par @juandc",
      selectLang: "Sélectionnez une langue",
      search: "Chercher",
    },
  },
];

const lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute("data-img");
      entry.target.setAttribute("src", url);
    }
  });
});

function createMovies(
  movies,
  container,
  { lazyLoad = false, clean = true } = {}
) {
  if (clean) {
    container.innerHTML = "";
  }

  movies.forEach((movie) => {
    const movieContainer = document.createElement("div");
    movieContainer.classList.add("movie-container");

    const movieImg = document.createElement("img");
    movieImg.classList.add("movie-img");
    movieImg.setAttribute("alt", movie.title);
    movieImg.setAttribute(
      lazyLoad ? "data-img" : "src",
      "https://image.tmdb.org/t/p/w300" + movie.poster_path
    );
    movieImg.addEventListener("click", () => {
      location.hash = "#movie=" + movie.id;
    });
    movieImg.addEventListener("error", () => {
      movieImg.setAttribute(
        "src",
        "https://static.platzi.com/static/images/error/img404.png"
      );
    });

    const movieBtn = document.createElement("button");
    movieBtn.classList.add("movie-btn");
    likedMoviesList()[movie.id] &&
      movieBtn.classList.toggle("movie-btn--liked");
    movieBtn.addEventListener("click", () => {
      movieBtn.classList.toggle("movie-btn--liked");
      likeMovie(movie);
    });

    if (lazyLoad) {
      lazyLoader.observe(movieImg);
    }

    movieContainer.appendChild(movieImg);
    movieContainer.appendChild(movieBtn);
    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach((category) => {
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category-container");

    const categoryTitle = document.createElement("h3");
    categoryTitle.classList.add("category-title");
    categoryTitle.setAttribute("id", "id" + category.id);
    categoryTitle.addEventListener("click", () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
  const { data } = await api("/trending/movie/day");
  const movies = data.results;

  createMovies(movies, trendingMoviesPreviewList, { lazyLoad: true });
}

async function getCategoriesPreview() {
  const { data } = await api("/genre/movie/list");
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList);
}

async function getMoviesByCategory(id) {
  const { data } = await api("/discover/movie", {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, { lazyLoad: true });
}

function getPaginatedMoviesByCategory(id) {
  return async function () {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 10;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api("/discover/movie", {
        params: {
          with_genres: id,
          page,
        },
      });
      const movies = data.results;

      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
  };
}

async function getMoviesBySearch(query) {
  const { data } = await api("/search/movie", {
    params: {
      query,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages;
  console.log(maxPage);

  createMovies(movies, genericSection, { lazyLoad: true });
}

function getPaginatedMoviesBySearch(query) {
  return async function () {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 10;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api("/search/movie", {
        params: {
          query,
          page,
        },
      });
      const movies = data.results;

      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
  };
}

async function getTrendingMovies() {
  const { data } = await api("/trending/movie/day");
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, { lazyLoad: true });
}

async function getPaginatedTrendingMovies() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

  const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 10;
  const pageIsNotMax = page < maxPage;

  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await api("/trending/movie/day", {
      params: {
        page,
      },
    });
    const movies = data.results;

    createMovies(movies, genericSection, { lazyLoad: true, clean: false });
  }
}

async function getMovieById(id) {
  const { data: movie } = await api("/movie/" + id);

  const movieImgUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%, 
      rgba(0, 0, 0, 0) 29.17%
    ), 
      url(${movieImgUrl})
  `;

  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMovies(id);
}

async function getRelatedMovies(id) {
  const { data } = await api(`/movie/${id}/similar`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
  relatedMoviesContainer.scrollTo(0, 0);
}

function getLikedMovies() {
  const likedMovies = likedMoviesList();
  const moviesArray = Object.values(likedMovies);

  createMovies(moviesArray, likedMoviesArticle, {
    lazyLoad: true,
    clean: true,
  });
}
