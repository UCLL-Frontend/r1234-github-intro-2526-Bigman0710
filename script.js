
var STORAGE_KEY = 'foodChallenges123'; 

function haalChallenges() {
    let data = localStorage.getItem(STORAGE_KEY);
    if(data) {
        return JSON.parse(data);
    }
    return [];
}

function opslaan(challenges) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    console.log("opgeslagen hehe"); 
}

function voegToe(challenge) {
    let lijst = haalChallenges();
    lijst.push(challenge);
    opslaan(lijst);
}

function verwijder(index) {
    let lijst = haalChallenges();
    lijst.splice(index,1);
    opslaan(lijst);
}

function update(index, nieuwe) {
    let lijst = haalChallenges();
    lijst[index] = nieuwe;
    opslaan(lijst);
}

// stats berekenen 
function maakStats(lijst) {
    if(lijst.length === 0) {
        return {aantal:0, gemPain:0, maxPain:0, totaalGeld:0, succes:0}
    }

    var pijnScores = [];
    for(let item of lijst) {
        pijnScores.push(item.painLevel);
    }

    let som = 0;
    pijnScores.forEach(p => som += p); // soms forEach soms for
    let gemiddelde = som / lijst.length;

    let hoogstePijn = Math.max(...pijnScores); // spread operator

    let geld = 0;
    lijst.forEach(dinges => {
        geld += dinges.cost;
    })

    let geslaagd = 0;
    for(var i=0; i<lijst.length; i++) {
        if(lijst[i].succeeded == "yes") geslaagd++;
    }

    return {
        aantal: lijst.length,
        gemPain: gemiddelde.toFixed(1),
        maxPain: hoogstePijn,
        totaalGeld: geld.toFixed(2),
        succes: ((geslaagd / lijst.length)*100).toFixed(0)
    }
}

// filters 
function filterPijn(lijst, min) {
    if(!min) return lijst;
    let resultaat = [];
    for(let c of lijst) {
        if(c.painLevel >= parseInt(min)) resultaat.push(c);
    }
    return resultaat;
}

function filterVrienden(lijst, jaNee) {
    if(!jaNee) return lijst;
    return lijst.filter(c => c.friends === jaNee);
}

function filterMinGeld(lijst, minBedrag) {
    if(!minBedrag || isNaN(minBedrag)) return lijst;
    let ok = [];
    lijst.forEach(item => {
        if(item.cost >= parseFloat(minBedrag)) ok.push(item);
    });
    return ok;
}

// sorteren
function sorteerDatum(lijst, oplopend) {
    return lijst.slice().sort((a,b) => {
        let dateA = new Date(a.date);
        let dateB = new Date(b.date);
        if(oplopend) return dateA - dateB;
        return dateB - dateA;
    });
}

function sorteerPrijs(lijst, goedkoopEerst) {
    let kopie = [...lijst];
    kopie.sort(function(a,b){
        if(goedkoopEerst) return a.cost - b.cost;
        return b.cost - a.cost;
    });
    return kopie;
}

// render functie
function toonLijst(challenges, waar, editFunctie, deleteFunctie) {
    waar.innerHTML = "";

    challenges.forEach((c, idx) => {
        let li = document.createElement("li");
        
        let tekst = c.name + " - " + c.date + " - " + c.location + " - " 
                  + c.succeeded + " - Pijn: " + c.painLevel 
                  + " - €" + c.cost.toFixed(2) + " - Vrienden: " 
                  + (c.friends=="yes"?"Ja":"Nee");

        li.innerHTML = tekst;

        if(editFunctie) {
            let editBtn = document.createElement("button");
            editBtn.textContent = "Bewerk";
            editBtn.dataset.idx = idx;
            editBtn.onclick = editFunctie;
            li.appendChild(editBtn);
        }

        if(deleteFunctie) {
            let delBtn = document.createElement("button");
            delBtn.textContent = "Wis";
            delBtn.dataset.idx = idx;
            delBtn.onclick = deleteFunctie;
            li.appendChild(delBtn);
        }

        waar.appendChild(li);
    });
}

function vulFormulier(challenge, formulier, nummer) {
    formulier.name.value = challenge.name;
    formulier.date.value = challenge.date;
    formulier.location.value = challenge.location;
    formulier.succeeded.value = challenge.succeeded;
    formulier.painLevel.value = challenge.painLevel;
    formulier.cost.value = challenge.cost;
    formulier.friends.value = challenge.friends;
    formulier.dataset.index = nummer;
}

// ----------------- index.html logica -----------------

if(document.getElementById("challengeForm")) {  // alleen op index pagina
    const form = document.getElementById("challengeForm");
    const lijstje = document.getElementById("challengeList");
    let bewerkIndex = -1;

    function refreshIndex() {
        toonLijst(haalChallenges(), lijstje, handleBewerk, handleWis);
    }

    refreshIndex();

    form.addEventListener("submit", function(e){
        e.preventDefault();

        const ding = {
            name: form.name.value,
            date: form.date.value,
            location: form.location.value,
            succeeded: form.succeeded.value,
            painLevel: parseInt(form.painLevel.value),
            cost: parseFloat(form.cost.value),
            friends: form.friends.value
        };

        if(bewerkIndex >= 0) {
            update(bewerkIndex, ding);
            bewerkIndex = -1;
        } else {
            voegToe(ding);
        }

        form.reset();
        refreshIndex();
    });

    function handleBewerk(e) {
        let nr = parseInt(e.target.dataset.idx);
        let alle = haalChallenges();
        vulFormulier(alle[nr], form, nr);
        bewerkIndex = nr;
    }

    function handleWis(e) {
        if(confirm("Echt verwijderen?")) {
            let nr = parseInt(e.target.dataset.idx);
            verwijder(nr);
            refreshIndex();
        }
    }

    // check of we van stats komen om te bewerken
    const teBewerken = localStorage.getItem("editChallengeIndex");
    if(teBewerken !== null) {
        let idx = parseInt(teBewerken);
        let challenges = haalChallenges();
        if(idx >=0 && idx < challenges.length) {
            vulFormulier(challenges[idx], form, idx);
            bewerkIndex = idx;
        }
        localStorage.removeItem("editChallengeIndex");
    }
}

// ----------------- stats.html logica -----------------

if(document.getElementById("stats-summary")) {  // alleen op stats pagina
    const samenvatting = document.getElementById("stats-summary");
    const lijstContainer = document.getElementById("challengeList");
    const pijnFilter = document.getElementById("painFilter");
    const vriendenFilter = document.getElementById("friendsFilter");
    const minGeldFilter = document.getElementById("minCostFilter");
    const datumSort = document.getElementById("sortDate");
    const prijsSort = document.getElementById("sortCost");

    function refreshStats() {
        let items = haalChallenges();

        items = filterPijn(items, pijnFilter.value);
        items = filterVrienden(items, vriendenFilter.value);
        items = filterMinGeld(items, minGeldFilter.value);

        let oplopendDatum = datumSort.value === "asc";
        let goedkoopEerst = prijsSort.value === "asc";

        if(datumSort.value) items = sorteerDatum(items, oplopendDatum);
        if(prijsSort.value) items = sorteerPrijs(items, goedkoopEerst);

        let statistieken = maakStats(items);

        samenvatting.innerHTML = 
            "Totaal: " + statistieken.aantal + 
            " | Gem. pijn: " + statistieken.gemPain +
            " | Max pijn: " + statistieken.maxPain +
            " | Totaal uitgegeven: €" + statistieken.totaalGeld +
            " | Succes: " + statistieken.succes + "%";

        toonLijst(items, lijstContainer, handleEditStats, handleDeleteStats);
    }

    function handleEditStats(e) {
        let idx = parseInt(e.target.dataset.idx);
        if(confirm("Naar toevoeg pagina om te bewerken?")) {
            localStorage.setItem("editChallengeIndex", idx);
            window.location.href = "index.html";
        }
    }

    function handleDeleteStats(e) {
        let idx = parseInt(e.target.dataset.idx);
        if(confirm("Echt deleten?")) {
            verwijder(idx);
            refreshStats();
        }
    }

    // events
    pijnFilter.addEventListener("change", refreshStats);
    vriendenFilter.addEventListener("change", refreshStats);
    minGeldFilter.addEventListener("change", refreshStats);
    datumSort.addEventListener("change", refreshStats);
    prijsSort.addEventListener("change", refreshStats);

    refreshStats(); // start
}