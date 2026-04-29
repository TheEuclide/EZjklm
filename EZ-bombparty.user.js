// ==UserScript==
// @name         EZ Bomb Party TT
// @namespace    http://tampermonkey.net/
// @version      4.7
// @description  cheat pour bombparty
// @author       The Euclide
// @match        *://*.jklm.fun/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top && window.location.pathname.includes('/games/bombparty')) {

        let dictionnaire = [];
        let syllabeActuelle = "";
        let autoMode = false;
        let motsUtilises = new Set();

        const dictURLs = {
            fr: "https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt",
            en: "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt"
        };

        const box = document.createElement('div');
        box.style.cssText = `
            position: fixed; top: 10px; left: 10px;
            background-color: rgba(0,0,0,0.8); color: #00FF00;
            padding: 10px; border: 2px solid #00FF00;
            z-index: 9999; font-size: 14px;
            font-family: monospace; pointer-events: auto; width: 220px;
        `;

        box.innerHTML = `
            <select id="langSelect" style="background:#000; color:#00FF00; border:1px solid #00FF00; margin-bottom:8px; cursor:pointer; display:block; width:100%;">
                <option value="${dictURLs.fr}">Français</option>
                <option value="${dictURLs.en}">English (10k mots)</option>
            </select>
            <button id="autoBtn" style="
                background:#000; color:#FF4444; border:1px solid #FF4444;
                cursor:pointer; width:100%; margin-bottom:8px;
                font-family:monospace; font-size:13px; padding:3px;
            ">● AUTO : OFF</button>
            <button id="resetBtn" style="
                background:#000; color:#FFAA00; border:1px solid #FFAA00;
                cursor:pointer; width:100%; margin-bottom:8px;
                font-family:monospace; font-size:13px; padding:3px;
            ">🔄 Reset mots (0)</button>
            <button id="settingsBtn" style="
                background:#111; color:#00FFFF; border:1px solid #00FFFF;
                cursor:pointer; width:100%; margin-bottom:8px;
                font-family:monospace; font-size:13px; padding:3px;
            ">⚙️ Réglages</button>

            <div id="settingsPanel" style="display:none; margin-bottom:10px; padding:5px; border:1px dashed #00FFFF;">
                <label style="font-size:11px; color:#aaa;">Attente avant frappe: <span id="delayVal">500</span>ms</label>
                <input type="range" id="delaySlider" min="0" max="2000" value="500" style="width:100%; margin-bottom:5px;">

                <label style="font-size:11px; color:#aaa;">Vitesse de frappe: <span id="speedVal">30</span>ms</label>
                <input type="range" id="speedSlider" min="0" max="150" value="30" style="width:100%; margin-bottom:5px;">

                <label style="font-size:11px; color:#aaa;">Longueur min: <span id="minLenVal">3</span> lettres</label>
                <input type="range" id="minLenSlider" min="2" max="15" value="3" style="width:100%;">
            </div>

            <div id="wordDisplay">Choisis une langue pour charger le dico...</div>
        `;
        document.body.appendChild(box);

        const wordDisplay = document.getElementById('wordDisplay');
        const langSelect  = document.getElementById('langSelect');
        const autoBtn     = document.getElementById('autoBtn');
        const resetBtn    = document.getElementById('resetBtn');

        // Panneau de réglages
        const settingsBtn   = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const delaySlider   = document.getElementById('delaySlider');
        const speedSlider   = document.getElementById('speedSlider');
        const minLenSlider  = document.getElementById('minLenSlider'); // NOUVEAU CURSEUR
        const delayVal      = document.getElementById('delayVal');
        const speedVal      = document.getElementById('speedVal');
        const minLenVal     = document.getElementById('minLenVal');

        settingsBtn.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });

        delaySlider.addEventListener('input', (e) => { delayVal.textContent = e.target.value; });
        speedSlider.addEventListener('input', (e) => { speedVal.textContent = e.target.value; });
        minLenSlider.addEventListener('input', (e) => {
            minLenVal.textContent = e.target.value;
            // Met à jour les suggestions en direct si une syllabe est affichée
            if (syllabeActuelle) trouverEtEcrire(syllabeActuelle, false);
        });

        function updateResetBtn() {
            resetBtn.textContent = `🔄 Reset mots (${motsUtilises.size})`;
        }

        resetBtn.addEventListener('click', () => {
            motsUtilises.clear();
            updateResetBtn();
            if (syllabeActuelle) trouverEtEcrire(syllabeActuelle, false);
        });

        // Interception manuelle
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const input = document.querySelector('input[type="text"]') || document.querySelector('textarea');
                if (input && document.activeElement === input && input.value.trim() !== "") {
                    const motManuel = sansAccents(input.value.trim());
                    motsUtilises.add(motManuel);
                    updateResetBtn();
                }
            }
        });

        // Radar Multijoueur
        const logObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const elementsMots = node.querySelectorAll ? node.querySelectorAll('.word, .text') : [];
                        if (node.classList && (node.classList.contains('word') || node.classList.contains('text'))) {
                            const motAjt = sansAccents(node.textContent.trim());
                            if (motAjt && motAjt.length > 2 && !motAjt.includes(' ')) {
                                motsUtilises.add(motAjt);
                                updateResetBtn();
                            }
                        }
                        elementsMots.forEach(el => {
                            const motAjt = sansAccents(el.textContent.trim());
                            if (motAjt && motAjt.length > 2 && !motAjt.includes(' ')) {
                                motsUtilises.add(motAjt);
                                updateResetBtn();
                            }
                        });
                    }
                });
            });
        });
        logObserver.observe(document.body, { childList: true, subtree: true });

        autoBtn.addEventListener('click', () => {
            autoMode = !autoMode;
            if (autoMode) {
                autoBtn.textContent = '● AUTO : ON';
                autoBtn.style.color = '#00FF00';
                autoBtn.style.borderColor = '#00FF00';
                if (syllabeActuelle) trouverEtEcrire(syllabeActuelle, true); // Lance la frappe
            } else {
                autoBtn.textContent = '● AUTO : OFF';
                autoBtn.style.color = '#FF4444';
                autoBtn.style.borderColor = '#FF4444';
            }
        });

        function sansAccents(texte) {
            return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function ecrireMotDansInput(mot) {
            const input = document.querySelector('input[type="text"]') || document.querySelector('textarea');
            if (!input) return;

            input.focus();
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            const baseDelay = parseInt(delaySlider.value, 10);
            const typingSpeed = parseInt(speedSlider.value, 10);

            const varianceAttente = baseDelay > 0 ? Math.random() * 200 : 0;
            await sleep(baseDelay + varianceAttente);

            let motEnCours = '';
            for (const lettre of mot) {
                motEnCours += lettre;
                input.value = motEnCours;

                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keydown', { key: lettre, bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup',   { key: lettre, bubbles: true }));

                const varianceFrappe = typingSpeed > 0 ? Math.random() * (typingSpeed / 2) : 0;
                await sleep(typingSpeed + varianceFrappe);
            }

            await sleep(typingSpeed > 0 ? 100 : 10);

            motsUtilises.add(mot);
            updateResetBtn();

            const enterDown = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
            input.dispatchEvent(enterDown);
            input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

            const form = input.closest('form');
            if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }

        async function chargerDictionnaire(url) {
            wordDisplay.innerHTML = "<i>Chargement en cours...</i>";
            dictionnaire = [];

            try {
                const reponse = await fetch(url);
                const texte   = await reponse.text();

                dictionnaire = texte.split('\n')
                    .map(mot => mot.trim())
                    .filter(mot => {
                        if (mot.length === 0) return false;
                        if (/[A-Z]/.test(mot)) return false;
                        if (mot.includes(' ')) return false;
                        // On garde presque tout en mémoire (>= 2 lettres), le filtrage visuel se fait au moment de la recherche
                        if (mot.length < 2) return false;
                        return true;
                    })
                    .map(mot => sansAccents(mot));

                wordDisplay.innerHTML = `Dico chargé : <b>${dictionnaire.length}</b> mots.<br>Attente...`;

                if (syllabeActuelle) trouverEtEcrire(syllabeActuelle, false);

            } catch (erreur) {
                wordDisplay.innerHTML = "<span style='color:red;'>Erreur chargement !</span>";
            }
        }

        // Le paramètre allowAutoTyping empêche le bot de taper un mot tout seul si tu changes juste la longueur du curseur
        function trouverEtEcrire(syllabe, allowAutoTyping = true) {
            syllabeActuelle = syllabe;
            if (!syllabe || dictionnaire.length === 0) return;

            const syllabePropre = sansAccents(syllabe);
            const longueurMinimale = parseInt(minLenSlider.value, 10); // Récupère la valeur du curseur

            const resultats = dictionnaire
                // Filtre les mots déjà utilisés ET trop petits selon le curseur
                .filter(mot => mot.includes(syllabePropre) && !motsUtilises.has(mot) && mot.length >= longueurMinimale)
                .sort((a, b) => a.length - b.length);

            if (resultats.length > 0) {
                wordDisplay.innerHTML =
                    `Syllabe : <b>${syllabePropre.toUpperCase()}</b><br><br>` +
                    resultats.slice(0, 8).join('<br>');

                if (autoMode && allowAutoTyping) {
                    ecrireMotDansInput(resultats[0]);
                }
            } else {
                wordDisplay.innerHTML =
                    `Syllabe : <b>${syllabePropre.toUpperCase()}</b><br><br><i>Aucun mot de ${longueurMinimale}+ lettres trouvé.</i>`;
            }
        }

        langSelect.addEventListener('change', (e) => chargerDictionnaire(e.target.value));
        chargerDictionnaire(langSelect.value);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList && mutation.target.classList.contains('syllable')) {
                    trouverEtEcrire(mutation.target.textContent, true);
                }
            });
        });

        const intervalStart = setInterval(() => {
            const syllableElement = document.querySelector('.syllable');
            if (syllableElement) {
                clearInterval(intervalStart);
                if (syllableElement.textContent) trouverEtEcrire(syllableElement.textContent, true);
                observer.observe(syllableElement, { childList: true, characterData: true, subtree: true });
            }
        }, 1000);
    }
})();
