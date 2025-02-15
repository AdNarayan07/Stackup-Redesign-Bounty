//Imports
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const algoliasearch = require('algoliasearch');

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html'))); // Serve the index file
app.use(express.static('public')); //server public directory

// Setup routes for HTML pages
function setupRoutes(directory, baseRoute = '') {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const routePath = path.join(baseRoute, file);
    if (fs.statSync(filePath).isDirectory()) {
      setupRoutes(filePath, routePath);
    } else if (file.endsWith('.html')) {
      app.get(`/${routePath.replace('.html', '').replaceAll('\\', '/')}`, (req, res) => {
        res.sendFile(filePath);
      });
    }
  });
}
setupRoutes(path.join(__dirname, 'pages'));

// serving /campaigns route along with pagination (load-more)
app.get('/campaigns', (req, res) => {
  try {
    let campaigns = require('./data/campaigns');
    let page = parseInt(req.query.page) || 1;
    const selectedCampaigns = getArrrayPage(campaigns, page, 6);
    let html = fs.readFileSync(path.join(__dirname, "campaigns.html"), 'utf-8');
    if (selectedCampaigns.at(-1) === campaigns.at(-1) || !selectedCampaigns.length) {
      html = html.replace("--var-placeholder-none", "none");
    }
    html = html.replace('<!--placeholder-for-campaigns-->', selectedCampaigns.join(" "))
               .replace("<!--placeholder-for-page-number-->", page + 1);
    res.send(html);
  } catch (error) {
    console.error('Error in /campaigns route:', error);
    res.status(500).send("Internal Server Error");
  }
});

// Quests routes - serving quest data with filters
app.get('/quests/ongoing', (req, res) => {
  try {
    const { ongoing } = require("./data/quests");
    res.json(ongoing);
  } catch (error) {
    console.error('Error in /quests/ongoing route:', error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/quests/past', (req, res) => {
  try {
    const { past } = require("./data/quests");
    let filteredData;
    if (req.query.status && req.query.status !== "All") {
      filteredData = past.filter(e => e.status === req.query.status);
    } else {
      filteredData = past;
    }
    let selectedData = getArrrayPage(filteredData, parseInt(req.query.page) || 1, 10);
    res.header({ "hasMore": !(!selectedData.length || selectedData.at(-1) === filteredData.at(-1)) }).json(selectedData); //sending hasMore data in header
  } catch (error) {
    console.error('Error in /quests/past route:', error);
    res.status(500).send("Internal Server Error");
  }
});

// Proxy route - bypassing CORS restriction for js scripts due to third party origin
app.get('/proxy', async (req, res) => {
  try {
    let response = await fetch(req.query.src);
    const headers = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
    }); 
    res.set(headers).status(response.status).send(await response.text());
  } catch (error) {
    console.error('Error in /proxy route:', error);
    res.status(500).send("Internal Server Error");
  }
});

// 404 route
app.all('*', (req, res) => {
  res.sendFile(path.join(__dirname, "404.html"));
});

// Start the server
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});

// Algolia indexing - setting up for search feature
(async () => {
  //common settings for both campaigns and learn pathways
  const common_settings = {
    enablePersonalization: true,
    indexLanguages: ['en'],
    queryLanguages: ['en'],
    removeStopWords: true,
    highlightPreTag: '<span class="bg-yellow-100">',
    highlightPostTag: '</span>',
    removeWordsIfNoResults: 'lastWords'
  }
  const synonyms = require("./data/algolia_synonyms.json")

  try {
    const client = algoliasearch("TZQKXVG59T", "96b92a7c61b26f26a9c20d9e81b4d90f"); //should be in a secure .env file on production
    const index_campaigns = client.initIndex("_campaigns");
    await index_campaigns.setSettings({
      searchableAttributes: [
        'title'
      ],
      hitsPerPage: 5,
      ...common_settings
    })
    const records_campaigns = require("./data/campaigns_structured");
    await index_campaigns.saveObjects(records_campaigns, { autoGenerateObjectIDIfNotExist: false });
    await index_campaigns.saveSynonyms(synonyms, { replaceExistingSynonyms: true })

    const index_learn_pathways = client.initIndex("_learn_pathways");
    await index_learn_pathways.setSettings({
      searchableAttributes: [
        'title',
        'content'
      ],
      disableTypoToleranceOnAttributes: ['content'],
      hitsPerPage: 10,
      ...common_settings
    })
    const records_learn_pathways = require("./data/learn_pathways_structured.json");
    await index_learn_pathways.saveObjects(records_learn_pathways, { autoGenerateObjectIDIfNotExist: false });
    await index_learn_pathways.saveSynonyms(synonyms, { replaceExistingSynonyms: true })
  } catch (error) {
    console.error('Error in Algolia indexing:', error);
  }
})();

// Function to paginate array
function getArrrayPage(array, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}