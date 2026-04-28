// ==UserScript==
// @name         EZ Bomb Party
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Charge des dictionnaires externes avec sélection de langue
// @author       The Euclide
// @match        *://*.jklm.fun/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top && window.location.pathname.includes('/games/bombparty')) {

        let dictionnaire = []; // Notre tableau de mots vide au départ
        let syllabeActuelle = ""; // Mémorise la syllabe en cours

        // 1. Liste des URL de dictionnaires (fichiers texte bruts, 1 mot par ligne)
        const dictURLs = {
            fr: "https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt",
            en: "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt"
        };

        // 2. Création de l'interface utilisateur
        const box = document.createElement('div');
        box.style.position = 'fixed';
        box.style.top = '10px';
        box.style.left = '10px';
        box.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        box.style.color = '#00FF00';
        box.style.padding = '10px';
        box.style.border = '2px solid #00FF00';
        box.style.zIndex = '9999';
        box.style.fontSize = '14px';
        box.style.fontFamily = 'monospace';
        // On permet de cliquer sur la boîte pour utiliser le sélecteur
        box.style.pointerEvents = 'auto';

        // On insère le HTML avec un menu <select> et une zone de texte <div>
        box.innerHTML = `
            <select id="langSelect" style="background:#000; color:#00FF00; border:1px solid #00FF00; margin-bottom:10px; cursor:pointer;">
                <option value="${dictURLs.fr}">Français</option>
                <option value="${dictURLs.en}">English (10k mots)</option>
            </select>
            <div id="wordDisplay">Choisis une langue pour charger le dico...</div>
        `;
        document.body.appendChild(box);

        const wordDisplay = document.getElementById('wordDisplay');
        const langSelect = document.getElementById('langSelect');

        // 3. Outil pour retirer les accents des mots (ex: "é" devient "e")
        function sansAccents(texte) {
            return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        // 4. Fonction pour télécharger et préparer le dictionnaire
        async function chargerDictionnaire(url) {
            wordDisplay.innerHTML = "<i>Chargement en cours...</i>";
            dictionnaire = []; // On vide l'ancien dictionnaire

            try {
                // On télécharge le fichier texte
                const reponse = await fetch(url);
                const texte = await reponse.text();

                // On sépare le texte ligne par ligne, on retire les espaces et les accents
                const motsBruts = texte.split('\n');
                dictionnaire = motsBruts.map(mot => sansAccents(mot.trim())).filter(mot => mot.length > 0);

                wordDisplay.innerHTML = `Dico chargé : <b>${dictionnaire.length}</b> mots.<br>Attente de la syllabe...`;

                // Si une syllabe était déjà affichée, on relance la recherche
                if (syllabeActuelle !== "") trouverMots(syllabeActuelle);

            } catch (erreur) {
                wordDisplay.innerHTML = "<span style='color:red;'>Erreur lors du chargement !</span>";
                console.error("Erreur Fetch:", erreur);
            }
        }

        // 5. Fonction de recherche
        function trouverMots(syllabe) {
            syllabeActuelle = syllabe;
            if (!syllabe) return;
            if (dictionnaire.length === 0) return; // Si le dico n'est pas encore chargé

            const syllabePropre = sansAccents(syllabe);

            // On cherche les mots contenant la syllabe
            const resultats = dictionnaire.filter(mot => mot.includes(syllabePropre));

            // On trie les résultats pour afficher les mots les plus courts en premier (plus rapides à taper)
            resultats.sort((a, b) => a.length - b.length);

            if (resultats.length > 0) {
                wordDisplay.innerHTML = `Syllabe : <b>${syllabePropre.toUpperCase()}</b><br><br>` +
                                        resultats.slice(0, 8).join('<br>'); // Affiche les 8 premiers
            } else {
                wordDisplay.innerHTML = `Syllabe : <b>${syllabePropre.toUpperCase()}</b><br><br><i>Aucun mot trouvé.</i>`;
            }
        }

        // 6. Écouteur pour le menu déroulant
        langSelect.addEventListener('change', (e) => {
            chargerDictionnaire(e.target.value);
        });

        // 7. On charge le dictionnaire sélectionné par défaut au lancement
        chargerDictionnaire(langSelect.value);

        // 8. Surveillance de la syllabe sur l'écran
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList && mutation.target.classList.contains('syllable')) {
                    trouverMots(mutation.target.textContent);
                }
            });
        });

        // 9. Démarrage de l'observation
        const intervalStart = setInterval(() => {
            const syllableElement = document.querySelector('.syllable');
            if (syllableElement) {
                clearInterval(intervalStart);
                if (syllableElement.textContent) trouverMots(syllableElement.textContent);
                observer.observe(syllableElement, { childList: true, characterData: true, subtree: true });
            }
        }, 1000);
    }
})();
