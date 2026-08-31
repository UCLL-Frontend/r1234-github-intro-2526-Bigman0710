// main.js - logica voor index.html (challenges toevoegen, bewerken, verwijderen)
import { haalChallenges, voegToe, verwijder, update, toonLijst, vulFormulier } from './storage.js';

const form = document.getElementById("challengeForm");
const lijstje = document.getElementById("challengeList");
let bewerkIndex = -1; // let, want deze waarde verandert  door beewrken en toevoegen

function refreshIndex() {
    toonLijst(haalChallenges(), lijstje, handleBewerk, handleWis);
}

form.addEventListener("submit", function (e) {
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

    if (bewerkIndex >= 0) {
        update(bewerkIndex, ding);
        bewerkIndex = -1;
    } else {
        voegToe(ding);
    }

    form.reset();
    refreshIndex();
});

const handleBewerk = (e) => {
    const nr = parseInt(e.target.dataset.idx);
    const alle = haalChallenges();
    vulFormulier(alle[nr], form, nr);
    bewerkIndex = nr;
    form.scrollIntoView({ behavior: "smooth" });
};

const handleWis = (e) => {
    if (confirm("Echt verwijderen?")) {
        const nr = parseInt(e.target.dataset.idx);
        verwijder(nr);
        refreshIndex();
    }   
};

refreshIndex();

// check of we van stats komen om te bewerken
const teBewerken = localStorage.getItem("editChallengeIndex");
if (teBewerken !== null) {
    const idx = parseInt(teBewerken);
    const challenges = haalChallenges();
    if (idx >= 0 && idx < challenges.length) {
        vulFormulier(challenges[idx], form, idx);
        bewerkIndex = idx;
        form.scrollIntoView({ behavior: "smooth" });
    }
    localStorage.removeItem("editChallengeIndex");
}