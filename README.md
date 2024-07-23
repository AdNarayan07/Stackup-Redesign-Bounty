# StackUp Website Redesign

**Check Out the Website: 👉 https://stackup-redesign-bounty.onrender.com/** (It might take some time to load first due to render marking it as inactive.)

In this project I have tried to redesign and add some features to the [StackUp Learn & Earn Platform](http://earn.stackup.dev/).
These are the added features:
1.  [Dark theme](https://stackup-redesign-bounty.onrender.com/)
2.  Search box for [Campaigns](https://stackup-redesign-bounty.onrender.com/campaigns) and [Learning Pathways](https://stackup-redesign-bounty.onrender.com/learn/pathways).
3.  Filters for [My Journey Quests](https://stackup-redesign-bounty.onrender.com/my/journeys/quests) based on quest status.

## Running the Project
Run the following command in your terminal to install and run the project:
```bash
git clone https://github.com/AdNarayan07/Stackup-Redesign-Bounty.git
cd Stackup-Redesign-Bounty
npm install
npm start
```

## Directory Overview

### `./data`
Contains json and js export files which act as dummy databases for campaigns, pathways and quests.


### `./pages`
Contains html pages to be served

### `./public`
Contains javascript and css stylesheets to be served

### `./app.js`
Main entry point to serve pages, listening to routes and indexing data for algolia search.

### `./*.html`
*   **`./index.html`**: Home page
*   **`./campaigns.html`**: Campgains page, since serving it required some additional logics for the "load more" to work.
*   **`./404.html`**: "Not Found" page.

## Explaining the Added Features

### Dark Theme
Added Dark UI Theme for whole website, makes it easier to read in dark.

![Illustration - Dark theme](https://cdn.discordapp.com/attachments/1156217464225546330/1265335473681858600/illustration-1.svg?ex=66a122fd&is=669fd17d&hm=51506d8ec8922e1b563e71825d3e50bb43bd4937d2ae53d394dee9422a074d8d&)

The file **[dark.css](/public/styles/dark.css)** contains css styling for different classes when the `<html>` tag has ".dark" class. It changes colours fitting for dark mode.

The **[toggle button](/index.html#L311-L327)** is added to every html file styled by **[toggle-button.css](/public/styles/toggle-button.css)**. The script **[toggle.js](public/javascript/toggle.js)** changes the theme by toggling ".dark" class of `<html>` tag when button is clicked. It also saves the preference in `localStorage` and applies saved theme when navigating through pages or when reloading.

In **[some parts](/index.html#L391-L395)**, the `<img>` tags having `.svg` source have been replaced with `<svg>` tags directly so that these can be styled with css for dark mode.

### Search Feature
Searching for a particular campaign or pathway is made easier with the search feature included. It uses **[algolia](https://www.algolia.com/)** indexing for easy searching.

![Illustration - Search](https://cdn.discordapp.com/attachments/1156217464225546330/1265335474029858836/illustration-2.svg?ex=66a122fd&is=669fd17d&hm=abcc9a21eeab9a20f4a633eaeb809cc7a3ca7a09fc218cd1f56767ac349cde5d&)

The **[campaign_structured.json](/data/campaigns_structured.json)** and **[learn_pathways_structured.json](/data/learn_pathways_structured.json)** files acts as databases and contains information about all the campaigns and pathways respectively. On starting the app, the **[data is fed into algolia indexing](/app.js#L101-L145)** along with synonyms (so that abbreviations are also counted when searching) and other settings. In production, however, the data should be fed along with the addition of a new content (campaign or pathway).

On the webpage, a **[search toggle button](/campaigns.html#L575-L586)** is added in the `<nav>` element which on click shows/hides the **[search container](/campaigns.html#L672-L688)**.
The **[search.js](/public/javascript/search.js)** script listens for inputs made in `#searchInput` and queries algolia index which returns the "hits" (search results). The data then is inserted in `#results` div.

For **[learn pathways data](/data/learn_pathways_structured.json)**, a `content` attribute is also added which contains keywords from their content, summarised using **[Keyphrase Extraction AI Model](https://huggingface.co/ml6team/keyphrase-extraction-kbir-inspec)**.

### Filtering the Quests
It is helpful in **[My Progress](https://stackup-redesign-bounty.onrender.com/my/journeys/quests)** if we can filter out the past quests based on whether it's rewarded, approved, rejected, etc.

![Illustration - Filter](https://cdn.discordapp.com/attachments/1156217464225546330/1265335474285842522/illustration-3.svg?ex=66a122fd&is=669fd17d&hm=7825e5831769e155631443ad0dab868389fc81360d9fce75f250470fab873955&)

The **[Quest Records Part](/pages/my/journeys/quests.html#L528-L571)** contains 2 `<div>`'s to toggle between past and ongoing content, a filter div containing `<a>` tags with different status params and `<div>`'s to display the data.

Script **[filter.js](/public/javascript/filter.js)** contains functions to fetch the data from server and display it in the webpage. The **[server filters out data](/app.js#L48-L74)** based on "status" parameter and page.

Stylesheet **[filter.css](/public/styles/filter.css)** shows filter button when "past" quests are selected and shows filter options when hovered over. It also shows content based on which tab is active.

## Video Demo
[![Video Title](https://img.youtube.com/vi/lCZO7EONduI/0.jpg)](https://www.youtube.com/watch?v=lCZO7EONduI)