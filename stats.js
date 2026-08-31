// stats.js - logica voor stats.html (filteren, sorteren, statistieken tonen)
import {
    haalChallenges, verwijder, maakStats,
    filterPijn, filterVrienden, filterMinGeld,
    sorteerDatum, sorteerPrijs, toonLijst
} from './storage.js';

const samenvatting = document.getElementById("stats-summary");
const lijstContainer = document.getElementById("challengeList");
const pijnFilter = document.getElementById("painFilter");
const vriendenFilter = document.getElementById("friendsFilter");
const minGeldFilter = document.getElementById("minCostFilter");
const datumSort = document.getElementById("sortDate");
const prijsSort = document.getElementById("sortCost");

function refreshStats() {
    let items = haalChallenges(); // let: wordt hierna meermaals herbeholpen door filters/sortering

    items = filterPijn(items, pijnFilter.value);
    items = filterVrienden(items, vriendenFilter.value);
    items = filterMinGeld(items, minGeldFilter.value);

    const oplopendDatum = datumSort.value === "asc";
    const goedkoopEerst = prijsSort.value === "asc";

    if (datumSort.value) items = sorteerDatum(items, oplopendDatum);
    if (prijsSort.value) items = sorteerPrijs(items, goedkoopEerst);

    const statistieken = maakStats(items);

    samenvatting.innerHTML =
        "Totaal: " + statistieken.aantal +
        " | Gem. pijn: " + statistieken.gemPain +
        " | Max pijn: " + statistieken.maxPain +
        " | Totaal uitgegeven: €" + statistieken.totaalGeld +
        " | Succes: " + statistieken.succes + "%";

    toonLijst(items, lijstContainer, handleEditStats, handleDeleteStats);
}

const handleEditStats = (e) => {
    const idx = parseInt(e.target.dataset.idx);
    localStorage.setItem("editChallengeIndex", idx);
    window.location.href = "index.html";
};

const handleDeleteStats = (e) => {
    const idx = parseInt(e.target.dataset.idx);
    if (confirm("Echt deleten?")) {
        verwijder(idx);
        refreshStats();
    }
};

// events
pijnFilter.addEventListener("change", refreshStats);
vriendenFilter.addEventListener("change", refreshStats);
minGeldFilter.addEventListener("change", refreshStats);
datumSort.addEventListener("change", refreshStats);
prijsSort.addEventListener("change", refreshStats);

refreshStats(); // start