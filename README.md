# EZjklm - cheat For JKLM
## Script EZ-popsauce
Un script d'assistance intelligent et 100% autonome pour le jeu Pop Sauce sur JKLM.fun. 
Il lit les questions, reconnaît les images et t'affiche la réponse en direct. S'il ne connaît pas la réponse, il l'apprend automatiquement à la fin du chrono pour la prochaine fois.

Toutes les réponses sont synchronisées avec le fichier `database.json` de ce dépôt GitHub.
## Fonctionnalités principales
* **Reconnaissance d'images absolue :** Le script calcule l'empreinte numérique (Hash SHA-1) des images. Même si le jeu change l'URL temporaire de l'image, le script la reconnaîtra.
* **Apprentissage auto :** Si la question est inconnue, le bot lit la bonne réponse à la fin du temps imparti et l'ajoute à sa mémoire locale.
* **Sauvegarde Cloud :** Récupération automatique de la base de données GitHub au lancement du jeu.

## 🛠️ Installation

1. Installe l'extension [Tampermonkey](https://www.tampermonkey.net/) sur ton navigateur (Chrome, Firefox, Opera, etc.).
2. Clique sur **[ce lien direct vers le script](https://raw.githubusercontent.com/TheEuclide/EZjklm/main/popsauce-bot.user.js)**.
3. Une page Tampermonkey va s'ouvrir. Clique sur le bouton **Installer** (ou *Mettre à jour*).
4. Lance une partie de Pop Sauce. Une boîte verte apparaîtra en haut à gauche.

*Note : Lors du premier lancement, Tampermonkey te demandera l'autorisation de se connecter à `raw.githubusercontent.com` pour télécharger les réponses. Choisis "Toujours autoriser".*

## 💣 Script EZ-BombParty
Ce dépôt contient également un cheat pour le jeu **BombParty**.
Plutôt que d'apprendre des réponses, ce bot utilise un dictionnaire de mots pour te suggérer instantanément un mot valide contenant la syllabe affichée à l'écran. 

* **Installation :** Clique sur **[ce lien direct vers le script BombParty](https://raw.githubusercontent.com/TheEuclide/EZjklm/main/bombparty-bot.user.js)** pour l'installer via Tampermonkey.
* **Fonctionnement :** À chaque nouvelle syllabe, le bot affiche une suggestion aléatoire tirée de son dictionnaire pour t'éviter d'utiliser toujours les mêmes mots.

## ⚠️ Avertissement & Responsabilité

L'utilisation de scripts d'assistance sur JKLM peut être mal vue par certains joueurs ou par les créateurs de salons personnalisés. Si vous répondez systématiquement en une fraction de seconde, vous risquez de vous faire expulser de la partie. À utiliser avec parcimonie.

**En utilisant ce script, vous assumez l'entière responsabilité de vos actions.** L'auteur décline toute responsabilité quant à l'utilisation (triche, abus, bannissements) qui sera faite de ce code. Ce projet est fourni à des fins éducatives et de démonstration technique.
