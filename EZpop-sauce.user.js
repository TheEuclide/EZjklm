// ==UserScript==
// @name         Ez pop sauce
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Synchro GitHub parfaite, anti-fantôme et boutons sandboxés
// @author       The Euclide
// @match        *://*.jklm.fun/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top && window.location.pathname.includes('/games/popsauce')) {

        // Le bon lien direct qui fonctionne !
        const GITHUB_URL = "https://raw.githubusercontent.com/TheEuclide/EZjklm/main/database.json";

        console.log("🍿 Assistant Pop Sauce 6.0 chargé avec succès !");

        let baseDeDonneesLocale = JSON.parse(localStorage.getItem('popSauceDB')) || {};
        let cleEnCours = "";
        let lastImageUrl = "";
        let hashImageEnCours = "";
        let isHashing = false;

        const box = document.createElement('div');
        box.style = "position:fixed; top:10px; left:10px; background:rgba(0,0,0,0.9); color:#00FF00; padding:15px; border:2px solid #00FF00; z-index:9999; font-family:monospace; min-width: 260px; max-width: 400px; border-radius: 5px;";
        document.body.appendChild(box);
        box.innerHTML = "☁️ Connexion au Cloud GitHub...";

        // 🛡️ Filtre visuel absolu
        function estVisible(element) {
            if (!element) return false;
            if (element.closest('[hidden]')) return false;
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
            return true;
        }

        function copierBaseDeDonnees() {
            const texteFormate = JSON.stringify(baseDeDonneesLocale, null, 2);
            navigator.clipboard.writeText(texteFormate).then(() => {
                const btn = document.getElementById('btnExport');
                if(btn) {
                    btn.textContent = "✅ Copié ! Fais Ctrl+V sur GitHub";
                    btn.style.background = "#005500";
                    setTimeout(() => {
                        btn.textContent = "💾 Copier mes données pour GitHub";
                        btn.style.background = "#111";
                    }, 4000);
                }
            }).catch(err => {
                alert("❌ Erreur de copie. Ton navigateur bloque le presse-papiers.");
            });
        }

        function sauvegarderReponseManuelle() {
            const inputReponse = document.getElementById('inputReponse');
            if (inputReponse && inputReponse.value.trim() !== "" && cleEnCours !== "") {
                baseDeDonneesLocale[cleEnCours] = inputReponse.value.trim();
                localStorage.setItem('popSauceDB', JSON.stringify(baseDeDonneesLocale));
                mettreAJourAffichage(null, null, null, true);
            }
        }

        // ☁️ Synchro GitHub propre
        function syncAvecGitHub() {
            GM_xmlhttpRequest({
                method: "GET",
                url: GITHUB_URL,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const baseDeDonneesDistante = JSON.parse(response.responseText);
                            baseDeDonneesLocale = { ...baseDeDonneesDistante, ...baseDeDonneesLocale };
                            localStorage.setItem('popSauceDB', JSON.stringify(baseDeDonneesLocale));
                            box.innerHTML = "🟢 Connecté ! (GitHub Synchro)";
                        } catch (e) {
                            box.innerHTML = "⚠️ Erreur Synchro (JSON invalide sur GitHub)";
                        }
                    } else {
                        box.innerHTML = "❌ Erreur GitHub : " + response.status;
                    }
                },
                onerror: function() { box.innerHTML = "❌ Impossible de joindre GitHub."; }
            });
        }

        async function genererEmpreinteImage(url) {
            try {
                const reponse = await fetch(url);
                const buffer = await reponse.arrayBuffer();
                const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return "[IMG_" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12) + "]";
            } catch (e) { return "[IMG_ERREUR]"; }
        }

        function mettreAJourAffichage(texteQuestion, texteSousTexte, urlImage, forceSuccesManuel = false) {
            let html = ``;
            if (texteQuestion) html += `<b>Question :</b> <i style="color:white;">${texteQuestion}</i><br>`;
            if (texteSousTexte) html += `<small style="color:#aaa;">Infos : ${texteSousTexte}</small><br>`;
            if (urlImage) html += `🖼️ <small style="color:cyan;">Image : ${hashImageEnCours}</small><br>`;
            html += `<hr style="border-color:#00FF00; margin: 10px 0;">`;

            if (forceSuccesManuel) {
                html += `✅ <b>Sauvegardé !</b><br>`;
            } else if (baseDeDonneesLocale[cleEnCours]) {
                html += `🎯 <b>RÉPONSE :</b> <span style="color:#FFFF00; font-size:18px; font-weight:bold;">${baseDeDonneesLocale[cleEnCours]}</span><br>`;
            } else {
                html += `⏳ <i>Inconnu...</i><br><br>`;
                html += `<input type="text" id="inputReponse" placeholder="La réponse est..." style="background:#222; color:#00FF00; border:1px solid #00FF00; padding:4px; width:65%;"> `;
                html += `<button id="btnAdd" style="background:#005500; color:#00FF00; border:1px solid #00FF00; padding:4px; cursor:pointer;">OK</button>`;
            }

            html += `<hr style="border-color:#004400; margin: 15px 0 10px 0;">`;
            html += `<button id="btnExport" style="background:#111; color:#00FF00; border:1px solid #005500; padding:6px; cursor:pointer; width:100%; font-size:12px;">💾 Copier mes données pour GitHub</button>`;

            box.innerHTML = html;

            const btnAdd = document.getElementById('btnAdd');
            if (btnAdd) btnAdd.addEventListener('click', sauvegarderReponseManuelle);

            const btnExport = document.getElementById('btnExport');
            if (btnExport) btnExport.addEventListener('click', copierBaseDeDonnees);
        }

        async function analyserScene() {
            let activeChallenge = null;
            document.querySelectorAll('.challenge').forEach(c => {
                if (estVisible(c)) activeChallenge = c;
            });

            const activeResult = document.querySelector('.challengeResult');
            const texteResultat = activeResult ? activeResult.textContent.trim() : "";

            if (activeChallenge) {
                const elementQuestion = activeChallenge.querySelector('.prompt');
                const elementSousTexte = activeChallenge.querySelector('.text');
                let imageElement = activeChallenge.querySelector('.image');

                let texteQuestion = estVisible(elementQuestion) ? elementQuestion.textContent.replace(/\s+/g, ' ').trim() : "";
                let texteSousTexte = estVisible(elementSousTexte) ? elementSousTexte.textContent.replace(/\s+/g, ' ').trim() : "";

                let rechercheTexte = `${texteQuestion} ${texteSousTexte}`.trim();

                let urlImage = null;
                if (estVisible(imageElement)) {
                    const imgTag = imageElement.querySelector('img');
                    if (imgTag && imgTag.src) {
                        urlImage = imgTag.src;
                    } else {
                        let style = window.getComputedStyle(imageElement).backgroundImage;
                        if ((style === "none" || style === "") && imageElement.firstElementChild) {
                            style = window.getComputedStyle(imageElement.firstElementChild).backgroundImage;
                        }
                        if (style && style !== "none" && style !== "") {
                            urlImage = style.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
                        }
                    }
                }

                if (urlImage && urlImage !== "none" && urlImage !== lastImageUrl) {
                    if (isHashing) return;
                    isHashing = true; lastImageUrl = urlImage;
                    box.innerHTML = "🧠 <i>Analyse image...</i>";
                    hashImageEnCours = await genererEmpreinteImage(urlImage);
                    isHashing = false; analyserScene(); return;
                }

                if (!urlImage) {
                    hashImageEnCours = "";
                    lastImageUrl = "";
                }

                let nouvelleCle = rechercheTexte;
                if (hashImageEnCours && urlImage) nouvelleCle = nouvelleCle ? (nouvelleCle + " " + hashImageEnCours) : hashImageEnCours;

                if (nouvelleCle && nouvelleCle !== cleEnCours) {
                    cleEnCours = nouvelleCle;
                    mettreAJourAffichage(texteQuestion, texteSousTexte, urlImage);
                }
            }
            else if (texteResultat && texteResultat.length > 5 && cleEnCours) {
                if (!baseDeDonneesLocale[cleEnCours]) {
                    let reponseOfficielle = texteResultat.replace(/La réponse était\s*:?/i, '').replace(/The answer was\s*:?/i, '').split('\n')[0].trim();
                    if (reponseOfficielle) {
                        baseDeDonneesLocale[cleEnCours] = reponseOfficielle;
                        localStorage.setItem('popSauceDB', JSON.stringify(baseDeDonneesLocale));

                        box.innerHTML = `✅ <b>Retenu !</b> : <span style="color:yellow;">${reponseOfficielle}</span>`;
                        box.innerHTML += `<hr style="border-color:#004400; margin: 15px 0 10px 0;"><button id="btnExport" style="background:#111; color:#00FF00; border:1px solid #005500; padding:6px; cursor:pointer; width:100%; font-size:12px;">💾 Copier mes données pour GitHub</button>`;

                        const btnExport = document.getElementById('btnExport');
                        if (btnExport) btnExport.addEventListener('click', copierBaseDeDonnees);
                    }
                }
                cleEnCours = ""; lastImageUrl = ""; hashImageEnCours = "";
            }
        }

        syncAvecGitHub();

        const observer = new MutationObserver(() => { if (!isHashing) setTimeout(analyserScene, 150); });
        const startCheck = setInterval(() => {
            if (document.querySelector('.challenge')) {
                clearInterval(startCheck);
                observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
                analyserScene();
            }
        }, 1000);
    }
})();
