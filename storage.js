export const STORAGE_KEY = 'foodChallenges123';

// ---------- opslag hier
export function haalChallenges() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

export function opslaan(challenges) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    console.log("opgeslagen hehe");
}

export function voegToe(challenge) {
    const lijst = haalChallenges();
    lijst.push(challenge);
    opslaan(lijst);
}

export function verwijder(index) {
    const lijst = haalChallenges();
    lijst.splice(index, 1);
    opslaan(lijst);
}

export function update(index, nieuwe) {
    const lijst = haalChallenges();
    lijst[index] = nieuwe;
    opslaan(lijst);
}

// ---------- stats berekenen hier
export function maakStats(lijst) {
    if (lijst.length === 0) {
        return { aantal: 0, gemPain: 0, maxPain: 0, totaalGeld: 0, succes: 0 };
    }

    const pijnScores = [];
    for (const item of lijst) {
        pijnScores.push(item.painLevel);
    }

    let som = 0; // let: wordt in de forEach steeds opgeteld
    pijnScores.forEach(p => som += p); // soms forEach soms for
    const gemiddelde = som / lijst.length;

    const hoogstePijn = Math.max(...pijnScores); // spread operator

    let geld = 0;
    lijst.forEach(dinges => {
        geld += dinges.cost;
    });

    let geslaagd = 0; // let: wordt in de lus opgehoogd
    for (let i = 0; i < lijst.length; i++) {
        if (lijst[i].succeeded == "yes") geslaagd++;
    }

    return {
        aantal: lijst.length,
        gemPain: gemiddelde.toFixed(1),
        maxPain: hoogstePijn,
        totaalGeld: geld.toFixed(2),
        succes: ((geslaagd / lijst.length) * 100).toFixed(0)
    };
}

// ---------- filters hier
export const filterPijn = (lijst, min) => {
    if (!min) return lijst;
    const resultaat = [];
    for (const c of lijst) {
        if (c.painLevel >= parseInt(min)) resultaat.push(c);
    }
    return resultaat;
};

export const filterVrienden = (lijst, jaNee) => {
    if (!jaNee) return lijst;
    return lijst.filter(c => c.friends === jaNee);
};

export const filterMinGeld = (lijst, minBedrag) => {
    if (!minBedrag || isNaN(minBedrag)) return lijst;
    const ok = [];
    lijst.forEach(item => {
        if (item.cost >= parseFloat(minBedrag)) ok.push(item);
    });
    return ok;
};

// ---------- sorteer jier
export const sorteerDatum = (lijst, oplopend) => {
    return lijst.slice().sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (oplopend) return dateA - dateB;
        return dateB - dateA;
    });
};

export const sorteerPrijs = (lijst, goedkoopEerst) => {
    const kopie = [...lijst];
    kopie.sort(function (a, b) {
        if (goedkoopEerst) return a.cost - b.cost;
        return b.cost - a.cost;
    });
    return kopie;
};

//            render 
export function toonLijst(challenges, waar, editFunctie, deleteFunctie) {
    waar.innerHTML = "";

    challenges.forEach((c, idx) => {
        const li = document.createElement("li");

        const tekst = c.name + " - " + c.date + " - " + c.location + " - "
                  + c.succeeded + " - Pijn: " + c.painLevel
                  + " - €" + c.cost.toFixed(2) + " - Vrienden: "
                  + (c.friends == "yes" ? "Ja" : "Nee");

        const tekstSpan = document.createElement("span");
        tekstSpan.className = "challenge-text";
        tekstSpan.textContent = tekst;
        li.appendChild(tekstSpan);

        const acties = document.createElement("div");
        acties.className = "challenge-actions";

        if (editFunctie) {
            const editBtn = document.createElement("button");
            editBtn.textContent = "Bewerk";
            editBtn.dataset.idx = idx;
            editBtn.addEventListener("click", editFunctie);
            acties.appendChild(editBtn);
        }

        if (deleteFunctie) {
            const delBtn = document.createElement("button");
            delBtn.textContent = "Wis";
            delBtn.dataset.idx = idx;
            delBtn.addEventListener("click", deleteFunctie);
            acties.appendChild(delBtn);
        }

        li.appendChild(acties);
        waar.appendChild(li);
    });
}

export function vulFormulier(challenge, formulier, nummer) {
    formulier.name.value = challenge.name;
    formulier.date.value = challenge.date;
    formulier.location.value = challenge.location;
    formulier.succeeded.value = challenge.succeeded;
    formulier.painLevel.value = challenge.painLevel;
    formulier.cost.value = challenge.cost;
    formulier.friends.value = challenge.friends;
    formulier.dataset.index = nummer;
}