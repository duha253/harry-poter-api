const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
const { request } = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const app = express();
const client = new pg.Client(DATABASE_URL);

client.connect().then(() => {
    app.listen(PORT, () => console.log(`listenning to the port ${PORT}`));
}).catch(error => console.log(error));
//-----------------------------
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

//-----with index ------getthe data api----------------------
app.get('/home', getAllCaracters);

function getAllCaracters(req, res) {
    const url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url).then(results => {
        const characters = results.body.map(Object => new Characters(Object));
        res.render('index', { characters: characters });
    });}
function Characters(charInfo) {
    this.name = charInfo.name;
    this.house = charInfo.house;
    this.patronus = charInfo.patronus;
    this.alive = charInfo.alive;

}
////--------with indx--------2----savedata--------------
app.post('/favorite-character', saveCaracters);

function saveCaracters(req, res) {
    const { name, house, patronus, alive } = request.body;
    const sql = 'INSERT INTO characters {name ,house ,patronus ,is_alive ,created_by} VALUES{$1 ,$2 ,$3 ,$4 ,$5};';
    safeValues = [name, house, patronus, alive, 'api'];
    client.query(sql, safeValues).then(() => {
        res.redirect('/character/my-fav-characters');
    });
}
//----------fav-cha------3--git saved data ------------------------------
app.get('/character/my-fav-characters', getAllFavCaracters);

function getAllFavCaracters(req, res) {
    const sql = 'SELECT * FROM characters WHERE created_by=$1;';
    safeValues = ['api'];
    client.query(sql, safeValues).then(results => {
        res.render('fav-characters', { favCharacters: results.rows });
    });
}

//--------fav-cha--------4--character details------
app.get('/character/:character_id', getCharacterDetails);
function getCharacterDetails(res, req) {
    const characterId = req.params.character_id;
    const sql = 'SELECT * FROM characters WHERE id=$1;';
    safeValues = [characterId];
    client.query(sql, safeValues).then(results => {
        res.render('character-details', { characterInfo: results.rows[0] });
    });
}

//--------CH DE-------updatecaracter-----------------
app.put('/character/:character_id', updateCharacter);
function updateCharacter(req, res) {
    const characterId = req.params.character_id;
    const { name, house, patronus, status } = req.body;
    const sql = `UPDATE characters SET name=$1, house=$2, patronus=$3, is_alive=$4 WHERE id=$5;`;
    safeValues = [name, house, patronus, status, characterId];
    client.query(sql, safeValues).then(results => {
        res.redirect('/character/${characterId}');
    });
}
//--------CH DE-------deletecaracter-----------------
app.delete('/character/:character_id', deleteCharacter);
function deleteCharacter(req, res) {
    const characterId = req.params.character_id;
    const sql = `DELETE  characters  WHERE id=$1;`;
    safeValues = [characterId];
    client.query(sql, safeValues).then(results => {
        res.redirect('/character/my-fav-characters');
    });
}
///--------------create care---------
app.get('/character/create', renderCreatePage);
function renderCreatePage(req, res) {
    res.render('create-character.ejs');

}
app.post('/character/create', createCaracters);
function createCaracters(req, res) {

    const { name, house, patronus, statuse } = request.body;
    const sql = 'INSERT INTO characters {name ,house ,patronus ,is_alive ,created_by} VALUES{$1 ,$2 ,$3 ,$4 ,$5};';
    safeValues = [name, house, patronus,statuse , 'user'];
    client.query(sql, safeValues).then(() => {
        res.redirect('/character/my-fav-characters');
    });
}

///--------------get all create care---------
app.get('/character/my-fav-characters', getAllCreatCaracters);

function getAllCreatCaracters(req, res) {
    const sql = 'SELECT * FROM characters WHERE created_by=$1;';
    safeValues = ['user'];
    client.query(sql, safeValues).then(results => {
        res.render('fav-characters', { favCharacters: results.rows });
    });
}


