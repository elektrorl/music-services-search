#!/bin/bash
# Script pour préparer une version de distribution de l'extension Music Services Search
# Ce script crée un dossier dist/ contenant uniquement les fichiers nécessaires
# à la publication sur le Chrome Web Store

# Définir les couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Afficher un message de bienvenue
echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}      Préparation du package Music Services Search         ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Définir le dossier de destination
DIST_FOLDER="./dist"

# Vérifier si le dossier dist existe déjà
if [ -d "$DIST_FOLDER" ]; then
    echo -e "${YELLOW}Le dossier $DIST_FOLDER existe déjà. Suppression...${NC}"
    rm -rf "$DIST_FOLDER"
fi

# Créer le dossier de distribution
echo -e "${GREEN}Création du dossier de distribution...${NC}"
mkdir -p "$DIST_FOLDER"

# Fichiers et dossiers à copier
FILES_TO_COPY=(
    "background.js"
    "i18n.js"
    "manifest.json"
    "popup.css"
    "popup.html"
    "popup.js"
    "privacy-policy.css"
    "privacy-policy.html"
    "LICENSE"
    "README.md"
)

# Copier les fichiers individuels
for file in "${FILES_TO_COPY[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}Copie de $file vers $DIST_FOLDER/${NC}"
        cp "$file" "$DIST_FOLDER/"
    else
        echo -e "${YELLOW}Avertissement: $file non trouvé, ignoré.${NC}"
    fi
done

# Copier les dossiers complets
echo -e "${GREEN}Copie du dossier _locales...${NC}"
cp -r "_locales" "$DIST_FOLDER/"

echo -e "${GREEN}Copie du dossier icons...${NC}"
mkdir -p "$DIST_FOLDER/icons"

# Sélectionner uniquement les icônes nécessaires
ICONS_TO_COPY=(
    "icons/music-services-search-icon.png"
    "icons/music-services-search-icon-16.png"
    "icons/music-services-search-icon-32.png"
    "icons/music-services-search-icon-48.png"
    "icons/music-services-search-icon-128.png"
    "icons/bandcamp-icon.png"
    "icons/spotify-icon.png"
    "icons/youtube-icon.png"
    "icons/youtube-music-icon.png"
)

for icon in "${ICONS_TO_COPY[@]}"; do
    if [ -f "$icon" ]; then
        echo -e "${GREEN}Copie de $icon vers $DIST_FOLDER/$icon${NC}"
        cp "$icon" "$DIST_FOLDER/$icon"
    else
        echo -e "${YELLOW}Avertissement: $icon non trouvé, ignoré.${NC}"
    fi
done

# Vérifier la présence des fichiers essentiels
ESSENTIAL_FILES=(
    "$DIST_FOLDER/manifest.json"
    "$DIST_FOLDER/background.js"
    "$DIST_FOLDER/popup.html"
)

all_essential_files_exist=true
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Erreur: Fichier essentiel $file manquant!${NC}"
        all_essential_files_exist=false
    fi
done

if [ "$all_essential_files_exist" = false ]; then
    echo -e "${RED}Des fichiers essentiels sont manquants. La distribution peut être invalide.${NC}"
    exit 1
fi

# Optimiser les images PNG si le script existe
if [ -f "./optimize-images.sh" ]; then
    echo -e "${GREEN}Optimisation des images PNG dans le dossier de distribution...${NC}"
    # On sauvegarde le dossier courant
    CURRENT_DIR=$(pwd)
    # On se place dans le dossier de distribution
    cd "$DIST_FOLDER"
    # On copie le script d'optimisation
    cp "../optimize-images.sh" .
    # On le rend exécutable
    chmod +x optimize-images.sh
    # On l'exécute
    ./optimize-images.sh
    # On supprime le script
    rm optimize-images.sh
    # On revient au dossier courant
    cd "$CURRENT_DIR"
    echo -e "${GREEN}Images PNG optimisées avec succès!${NC}"
else
    echo -e "${YELLOW}Script d'optimisation des images non trouvé. Les images ne seront pas optimisées.${NC}"
fi

# Créer une archive ZIP de la distribution
echo -e "${GREEN}Création de l'archive ZIP...${NC}"
(cd "$DIST_FOLDER" && zip -r "../music-services-search.zip" *)

if [ $? -eq 0 ]; then
    SIZE_KB=$(du -k "music-services-search.zip" | cut -f1)
    echo -e "${GREEN}===========================================================${NC}"
    echo -e "${GREEN}Distribution créée avec succès!${NC}"
    echo -e "${GREEN}Dossier: $DIST_FOLDER/${NC}"
    echo -e "${GREEN}Archive: music-services-search.zip (${SIZE_KB}KB)${NC}"
    echo -e "${GREEN}===========================================================${NC}"
    echo -e "${BLUE}Cette archive est prête à être téléchargée sur le Chrome Web Store.${NC}"
else
    echo -e "${RED}Erreur lors de la création de l'archive ZIP.${NC}"
    exit 1
fi
