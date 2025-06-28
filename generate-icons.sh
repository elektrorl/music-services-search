#!/bin/bash

# Script pour générer des icônes de différentes tailles
# Pour utiliser ce script, vous devez avoir ImageMagick installé
# Sur macOS: brew install imagemagick
# Sur Ubuntu/Debian: sudo apt-get install imagemagick

SOURCE_ICON="icons/music-services-search-icon.png"
SIZES=(16 32 48 128)

echo "Vérification de ImageMagick..."
if ! command -v convert &> /dev/null; then
    echo "ImageMagick n'est pas installé. Veuillez l'installer en utilisant:"
    echo "macOS: brew install imagemagick"
    echo "Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

echo "Génération des icônes..."
for size in "${SIZES[@]}"; do
    output_file="icons/music-services-search-icon-${size}.png"
    echo "Création de l'icône ${size}x${size}px..."
    convert "$SOURCE_ICON" -resize ${size}x${size} "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Icône générée: $output_file"
    else
        echo "❌ Échec de la génération: $output_file"
    fi
done

echo "Mise à jour du manifest.json..."
sed -i '' "s|\"16\": \"icons/music-services-search-icon.png\"|\"16\": \"icons/music-services-search-icon-16.png\"|g" manifest.json
sed -i '' "s|\"32\": \"icons/music-services-search-icon.png\"|\"32\": \"icons/music-services-search-icon-32.png\"|g" manifest.json
sed -i '' "s|\"48\": \"icons/music-services-search-icon.png\"|\"48\": \"icons/music-services-search-icon-48.png\"|g" manifest.json
sed -i '' "s|\"128\": \"icons/music-services-search-icon.png\"|\"128\": \"icons/music-services-search-icon-128.png\"|g" manifest.json

echo "Terminé! Les icônes ont été générées et le manifest.json a été mis à jour."
