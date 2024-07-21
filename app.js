const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const algoliasearch = require('algoliasearch');

// Serve the index.html file
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use(express.static('public'));

// Setup routes for dynamic HTML files
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

// Campaigns route
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

// Function to paginate array
function getArrrayPage(array, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}

// Quests routes
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
    res.header({ "hasMore": !(!selectedData.length || selectedData.at(-1) === filteredData.at(-1)) }).json(selectedData);
  } catch (error) {
    console.error('Error in /quests/past route:', error);
    res.status(500).send("Internal Server Error");
  }
});

// Proxy route
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

// Algolia indexing
(async () => {
  const index_settings = {
    enablePersonalization: true,
    indexLanguages: ['en'],
    queryLanguages: ['en'],
    removeStopWords: true,
    highlightPreTag: '<span class="bg-yellow-100">',
    highlightPostTag: '</span>',
    removeWordsIfNoResults: 'lastWords'
  }
  try {
    const client = algoliasearch("TZQKXVG59T", "96b92a7c61b26f26a9c20d9e81b4d90f");
    const index_campaigns = client.initIndex("_campaigns");
    await index_campaigns.setSettings({
      searchableAttributes: [
        'title'
      ],
      hitsPerPage: 5,
      ...index_settings
    })
    const records_campaigns = require("./data/campaigns_structured");
    await index_campaigns.saveObjects(records_campaigns, { autoGenerateObjectIDIfNotExist: false });

    const index_learn_pathways = client.initIndex("_learn_pathways");
    await index_learn_pathways.setSettings({
      searchableAttributes: [
        'title',
        'content'
      ],
      disableTypoToleranceOnAttributes: ['content'],
      hitsPerPage: 10,
      ...index_settings
    })
    const records_learn_pathways = require("./data/learn_pathways_structured.json");
    await index_learn_pathways.saveObjects(records_learn_pathways, { autoGenerateObjectIDIfNotExist: false });
  } catch (error) {
    console.error('Error in Algolia indexing:', error);
  }
})();