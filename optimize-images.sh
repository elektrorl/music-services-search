#!/bin/bash
# Script pour optimiser les images PNG de l'extension
# Nécessite pngquant (brew install pngquant)

# Définir les couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si pngquant est installé
if ! command -v pngquant &> /dev/null; then
    echo -e "${RED}pngquant n'est pas installé. Veuillez l'installer avec 'brew install pngquant'${NC}"
    exit 1
fi

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}      Optimisation des images PNG                          ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Dossier des icônes
ICONS_FOLDER="./icons"

# Créer un dossier temporaire pour les images optimisées
TEMP_FOLDER="./icons/temp"
mkdir -p "$TEMP_FOLDER"

# Compter le nombre total d'images PNG
TOTAL_PNG=$(find "$ICONS_FOLDER" -maxdepth 1 -name "*.png" | wc -l | tr -d ' ')
echo -e "${GREEN}Nombre total d'images PNG à optimiser: $TOTAL_PNG${NC}"

# Taille initiale totale
INITIAL_SIZE=$(find "$ICONS_FOLDER" -maxdepth 1 -name "*.png" -exec du -ch {} \; | grep total$ | cut -f1)
echo -e "${YELLOW}Taille initiale des images: $INITIAL_SIZE${NC}"

# Optimiser chaque image PNG
find "$ICONS_FOLDER" -maxdepth 1 -name "*.png" | while read -r png_file; do
    filename=$(basename "$png_file")
    echo -e "${GREEN}Optimisation de $filename...${NC}"
    
    # Optimiser l'image avec pngquant
    pngquant --force --ext .png --strip --quality=80-95 "$png_file" --output "$TEMP_FOLDER/$filename"
    
    # Remplacer l'original si l'optimisation a réussi
    if [ -f "$TEMP_FOLDER/$filename" ]; then
        mv "$TEMP_FOLDER/$filename" "$png_file"
    else
        echo -e "${YELLOW}Échec de l'optimisation pour $filename${NC}"
    fi
done

# Supprimer le dossier temporaire
rm -rf "$TEMP_FOLDER"

# Taille finale totale
FINAL_SIZE=$(find "$ICONS_FOLDER" -maxdepth 1 -name "*.png" -exec du -ch {} \; | grep total$ | cut -f1)
echo -e "${BLUE}===========================================================${NC}"
echo -e "${GREEN}Optimisation terminée!${NC}"
echo -e "${GREEN}Taille initiale: $INITIAL_SIZE${NC}"
echo -e "${GREEN}Taille finale: $FINAL_SIZE${NC}"
echo -e "${BLUE}===========================================================${NC}"
