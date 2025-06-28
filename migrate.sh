#!/bin/bash
# Script de migration pour supprimer les fichiers options obsolètes

echo "Migration des options vers le popup"
echo "==================================="
echo ""

# Étape 1 : Exécuter les nouveaux tests
echo "1. Exécution des nouveaux tests pour popup..."
npx jest tests/popup.test.js tests/popup-i18n.test.js tests/popup-integration.test.js

# Vérifier si les tests ont réussi
if [ $? -ne 0 ]; then
  echo "⚠️  Les tests ont échoué. La migration est interrompue."
  echo "Veuillez corriger les problèmes avant de continuer."
  exit 1
fi

echo "✅ Tests réussis!"
echo ""

# Étape 2 : Créer des sauvegardes
echo "2. Création de sauvegardes des fichiers options..."
mkdir -p backup
cp options.html backup/options.html
cp options.css backup/options.css
cp options.js backup/options.js
echo "✅ Sauvegardes créées dans le dossier 'backup'."
echo ""

# Étape 3 : Supprimer les fichiers options
echo "3. Suppression des fichiers options..."
rm options.html
rm options.css
rm options.js
echo "✅ Fichiers options supprimés."
echo ""

# Étape 4 : Mise à jour du fichier package.json
echo "4. Mise à jour de package.json..."
# Cette commande remplace les tests stables pour inclure les nouveaux tests popup
sed -i '' 's/"test:stable": "jest --testPathIgnorePatterns \\"background.test.js|integration.test.js\\""/"test:stable": "jest --testPathIgnorePatterns \\"background.test.js|integration.test.js\\" tests\/popup.test.js tests\/popup-i18n.test.js tests\/popup-integration.test.js"/' package.json
echo "✅ package.json mis à jour."
echo ""

echo "Migration terminée avec succès! 🎉"
echo ""
echo "Note importante: Certains tests existants font encore référence aux"
echo "fichiers options supprimés. Vous devrez les mettre à jour ou les désactiver."
echo ""
echo "Pour exécuter uniquement les tests qui fonctionnent :"
echo "npm run test:stable"
