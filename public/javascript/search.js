document.getElementById("search_toggle").addEventListener("click", () => {
    document.getElementById("search_container").classList.toggle("hidden")
    document.getElementById("searchInput").focus()
}) //showing-hiding the search box

document.getElementById("searchInput").addEventListener("input", async (e) => {
    const client = algoliasearch('TZQKXVG59T', '704cb579c46c81c78e38de711a246b8d');
    const index = client.initIndex(new URL(document.URL).pathname.replaceAll("/", "_"));
    const query = e.target.value;
    const { hits } = await index.search(query); //searching for query
    displayResults(hits); //displaying search results
});

function displayResults(results) {
    const resultsContainer = document.getElementById("results");

    // Map through the results and create HTML for each item
    const html = results.map(result => {
        const title = result._highlightResult.title.value;
        return `
<li class="group relative bg-white rounded-md border border-grayscale-7 hover:bg-gray-100 cursor-pointer">
  <a href="${result.url}" class="block">
    <div class="flex flex-wrap items-center justify-center text-center md:justify-start md:text-left">
      <img class="object-fill w-full md:w-1/5 rounded-md" src="${result.imageUrl}" alt="${result.title}">
      <h3 class="text-lg text-xl text-grayscale-2 font-semibold mx-5 w-full md:w-3/4">${title}</h3>
    </div>
  </a>
</li>
`
    }).join("");

    // Insert the HTML into the container
    resultsContainer.innerHTML = html;
}