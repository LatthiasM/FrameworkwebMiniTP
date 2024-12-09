const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Génération d'ID unique
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.json()); // Parse les données JSON du corps des requêtes
app.use(express.static(path.join(__dirname)));

// Vérifier si le fichier cities.json existe
const fileExists = (filePath) => {
    return fs.existsSync(filePath);
};

// Route GET /cities : Récupérer la liste des villes
app.get('/cities', (req, res) => {
    if (!fileExists('data/cities.json')) {
        return res.status(404).send({ error: 'Fichier cities.json introuvable' });
    }
    const data = JSON.parse(fs.readFileSync('data/cities.json', 'utf8'));
    res.send(data);
});

app.get('/visuCities', (req, res) =>{
    if (!fileExists('data/cities.json')) {
        return res.status(404).send({ error: 'Fichier cities.json introuvable' });
    }
    // Lire le fichier cities.json
    const data = JSON.parse(fs.readFileSync('data/cities.json', 'utf8'));
    // Rendre le template Pug avec les données des villes
    res.render('pug/GetCities.pug', {currentPage: '/visuCities', cities: data.cities });
})

// Test de visualisation sur une map avec leaflet
app.get('/map', (req, res) => {
    if (!fileExists('data/cities.json')) {
        return res.status(404).send({ error: 'Fichier cities.json introuvable' });
    }
    // Charger les données des villes
    const data = JSON.parse(fs.readFileSync('data/cities.json', 'utf8'));

    // Rendre le template Pug avec les données des villes
    res.render('pug/MapCities.pug', {currentPage: '/map', cities: data.cities });
});

// Route POST /city : Ajouter une nouvelle ville
app.post('/city', (req, res) => {
    if (!fileExists('data/cities.json')) {
        return res.status(500).send({ error: 'Fichier cities.json introuvable' });
    }

    const { name } = req.body;
    if (!name) {
        return res.status(400).send({ error: 'Le champ "name" est obligatoire' });
    }

    const data = JSON.parse(fs.readFileSync('data/cities.json', 'utf8'));
    if (data.cities.find(city => city.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).send({ error: 'La ville existe déjà' });
    }

    const newCity = { id: uuidv4(), name };
    data.cities.push(newCity);

    fs.writeFileSync('data/cities.json', JSON.stringify(data, null, 2));
    res.status(201).send(newCity);
});

// Route PUT /city/:id : Modifier une ville existante
app.put('/city/:id', (req, res) => {
    if (!fileExists('data/cities.json')) {
        return res.status(500).send({ error: 'Fichier cities.json introuvable' });
    }

    const idFromBody = req.body.id; // Récupérer l'ID depuis le corps
    const { name } = req.body; // Récupérer le champ "name"

    if (!idFromBody) {
        return res.status(400).send({ error: "Le champ 'id' est obligatoire dans le corps de la requête" });
    }

    if (!name) {
        return res.status(400).send({ error: "Le champ 'name' est obligatoire" });
    }

    const data = JSON.parse(fs.readFileSync('data/cities.json', 'utf8'));

    // Trouver la ville correspondante via l'ID fourni dans le corps
    const city = data.cities.find(city => city.id === idFromBody);
    if (!city) {
        return res.status(404).send({ error: 'Ville introuvable avec cet ID' });
    }

    // Mettre à jour le nom de la ville
    city.name = name;

    // Sauvegarder les modifications dans le fichier
    fs.writeFileSync('data/cities.json', JSON.stringify(data, null, 2));
    res.send(city);
});

// Route DELETE /city/:id : Supprimer une ville
app.delete('/city/:id', (req, res) => {
    if (!fileExists('data/cities.json')) {
        return res.status(500).send({ error: 'Fichier cities.json introuvable' });
    }

    const idFromBody = req.body.id; // Récupérer l'ID depuis le corps

    if (!idFromBody) {
        return res.status(400).send({ error: "Le champ 'id' est obligatoire dans le corps de la requête" });
    }

    const data = JSON.parse(fs.readFileSync('data/cities.json', 'utf8'));

    // Rechercher l'index de la ville correspondante à l'ID
    const cityIndex = data.cities.findIndex(city => city.id === idFromBody);
    if (cityIndex === -1) {
        return res.status(404).send({ error: 'Ville introuvable avec cet ID' });
    }

    // Supprimer la ville
    const deletedCity = data.cities.splice(cityIndex, 1);

    // Sauvegarder les modifications dans le fichier
    fs.writeFileSync('data/cities.json', JSON.stringify(data, null, 2));

    // Retourner la ville supprimée comme réponse
    res.send(deletedCity[0]);
});

// Configuration du moteur de template
app.set('view engine', 'pug');
app.set('views', path.join(__dirname));

// Middleware pour servir les fichiers statiques (comme style.css)
app.use(express.static(path.join(__dirname)));

// Route principale pour afficher le tableau
app.get('/', (req, res) => {
    // Lire un fichier CSV pour extraire les données
    fs.readFile('data/data.csv', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erreur lors de la lecture du fichier.');
        }

        // Convertir le CSV en tableau d'objets
        const users = data.split('\n').filter(line => line).map(line => {
            const [username, city] = line.split(';');
            return { username, city };
        });

        // Rendre le fichier Pug avec les utilisateurs
        res.render('pug/template.pug', {currentPage: '/', users });
    });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
