const fs = require('fs');

// Vérifie les arguments
if (process.argv.length < 3 || process.argv.length > 4) {
    console.error('Usage: node script.js <nom_du_fichier> [username;city]');
    process.exit(1);
}

const fileName = process.argv[2];
const newLine = process.argv[3]; // Ligne optionnelle

if (!newLine) {
    // Lire le fichier
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error(`Erreur lors de la lecture du fichier ${fileName} :`, err);
            process.exit(1);
        }
        console.log(`Contenu du fichier ${fileName} :`);
        console.log(data);
    });
} else {
    // Ajouter une ligne
    fs.appendFile(fileName, `${newLine}\n`, (err) => {
        if (err) {
            console.error(`Erreur lors de l'ajout de la ligne dans ${fileName} :`, err);
            process.exit(1);
        }
        console.log(`Ligne ajoutée avec succès : "${newLine}"`);
    });
}
