/**************** CONFIG ****************/
const NEWS_PROVIDER = "newsapi"; // change to "gnews" to test Gnews


const GNEWS_API_KEY = "GNEWS_API_KEY"; // Add your Gnews api key
const NEWSAPI_KEY = "NEWSAPI_KEY"; // Add your newsapi api key


const container = document.getElementById("news-container");


let currentSearchQuery = "";
let currentArticles = [];
let currentView = "browse"; // browse | saved
let readingMode = "deep"; // "quick" | "deep"


/**************** FETCH CORE ****************/
async function fetchNews(url, provider) {
  container.innerHTML = "<p>Loading news...</p>";


  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP Error " + res.status);


    const data = await res.json();
    const articles = normalizeArticles(data, provider);


    if (!articles || articles.length === 0) {
      container.innerHTML = "<p>No news found.</p>";
      return;
    }


    currentArticles = articles;
    currentView = "browse";
    displayNews(articles);


  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading news.</p>";
  }
}


/**************** NORMALIZE DATA ****************/
function normalizeArticles(data, provider) {
  if (!data.articles) return [];


  if (provider === "gnews") {
    return data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      publishedAt: a.publishedAt
    }));
  }


  if (provider === "newsapi") {
    return data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.urlToImage,
      publishedAt: a.publishedAt
    }));
  }
}


/**************** CATEGORY FUNCTIONS ****************/
function latestNews() {
  currentSearchQuery = "";


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/top-headlines?lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}


function techNews() {
  currentSearchQuery = "";


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/search?q=technology&lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/top-headlines?category=technology&pageSize=10&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}


function cyberNews() {
  currentSearchQuery = "";
  const query = encodeURIComponent("cybersecurity OR hacking OR data breach");


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/everything?q=cybersecurity&pageSize=10&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}


function nationalNews() {
  currentSearchQuery = "";


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/everything?q=india OR indian&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}


function internationalNews() {
  currentSearchQuery = "";


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/top-headlines?lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/everything?q=world OR global&pageSize=10&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}


function sportsNews() {
  currentSearchQuery = "";


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/top-headlines?topic=sports&lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/top-headlines?category=sports&language=en&pageSize=10&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}




/**************** SEARCH ****************/
function searchNews() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return alert("Please enter a search term");


  currentSearchQuery = query;


  if (NEWS_PROVIDER === "gnews") {
    fetchNews(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&token=${GNEWS_API_KEY}`,
      "gnews"
    );
  } else {
    fetchNews(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`,
      "newsapi"
    );
  }
}


/**************** HIGHLIGHT ****************/
function highlight(text, query) {
  if (!query || !text) return text;
  return text.replace(new RegExp(`(${query})`, "gi"), "<mark>$1</mark>");
}


/**************** DISPLAY ****************/
function displayNews(articles) {
  container.innerHTML = "";


  const saved = JSON.parse(localStorage.getItem("savedNews")) || [];
  const now = new Date();


  articles.forEach(article => {
    const isSaved = saved.some(a => a.url === article.url);
    const published = new Date(article.publishedAt);
    const isTrending = (now - published) / (1000 * 60 * 60) <= 24;


    const card = document.createElement("div");
    card.className = "news-card";


    // Main card HTML (ONLY HTML HERE)
    card.innerHTML = `
      ${readingMode === "deep"
      ? `<img
      src="${article.image || 'https://via.placeholder.com/600x400?text=No+Image'}"
      onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image';"
        />` : ""}


      <h3>
        ${highlight(article.title, currentSearchQuery)}
        ${isTrending ? '<span class="trending">Trending</span>' : ''}
      </h3>


      ${readingMode === "deep"
      ? `<p>${highlight(article.description || '', currentSearchQuery)}</p>`
      : ""}


      <div class="card-footer">
      <a href="${article.url}" target="_blank" class="read-more">
        Read more
      </a>
      <button
        class="${isSaved ? 'remove-btn' : 'save-btn'}"
        onclick='toggleSave(${JSON.stringify(article)})'>
        ${isSaved ? "Remove" : "Save"}
      </button>
    </div>
    `;


// ---- META BLOCK (SEPARATE DOM INSERTION) ----
    const meta = document.createElement("div");
    meta.className = "meta";


    meta.innerHTML = `
      <span class="source">${getSourceName(article.url)}</span>
      <span class="sep">.</span>
      <span class="time">${timeAgo(article.publishedAt)}</span>
    `;




    // Insert meta right after the title
    const title = card.querySelector("h3");
    title.insertAdjacentElement("afterend", meta);


    container.appendChild(card);
  });
}


/**************** SAVE / REMOVE ****************/
function toggleSave(article) {
  let saved = JSON.parse(localStorage.getItem("savedNews")) || [];
  const index = saved.findIndex(a => a.url === article.url);


  if (index === -1) {
    saved.push(article);
  } else {
    saved.splice(index, 1);
  }


  localStorage.setItem("savedNews", JSON.stringify(saved));


  if (currentView === "saved") {
    showSaved();
  } else {
    displayNews(currentArticles);
  }
}


function showSaved() {
  currentView = "saved";
  currentSearchQuery = "";


  const saved = JSON.parse(localStorage.getItem("savedNews")) || [];
  currentArticles = saved;


  if (!saved.length) {
    container.innerHTML = "<p>No saved articles.</p>";
    return;
  }


  displayNews(saved);
}


/**************** THEME ****************/
function toggleDarkMode() {
  const btn = document.getElementById("themeBtn");
  document.body.classList.toggle("dark");


  if (document.body.classList.contains("dark")) {
    btn.innerText = "Light";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerText = "Dark";
    localStorage.setItem("theme", "light");
  }
}


/**************** TIME ****************/
function timeAgo(dateString) {
  if (!dateString) return "";


  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;


  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);


  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} h ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}


/**************** SOURCE ****************/
function getSourceName(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace("www.", "");
  } catch {
    return "Unknown source";
  }
}


/**************** READING ****************/
function toggleReadingMode() {
  readingMode = readingMode === "deep" ? "quick" : "deep";


  document.body.classList.toggle("quick-mode", readingMode === "quick");


  const modeBtn = event.target;
  modeBtn.innerText = readingMode === "quick" ? "Deep" : "Quick";


  displayNews(currentArticles);
}


window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;


  const scrollPercent = docHeight > 0
    ? (scrollTop / docHeight) * 100
    : 0;


  document.getElementById("progress-bar").style.width =
    scrollPercent + "%";
});


// Load saved theme
const themeBtn = document.getElementById("themeBtn");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.innerText = "Light";
}


/**************** INIT ****************/
latestNews();



