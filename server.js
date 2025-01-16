const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (parsedUrl.pathname === '/profile.html') {
        fs.readFile('profile.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading profile.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    ws.on('message', message => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.listen(8080, () => {
    console.log('Сервер запущен на порту 8080');
});

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'messenger';
let db;

MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;
    db = client.db(dbName);
    console.log(`Connected to database ${dbName}`);
});

// Функция для добавления пользователя в друзья
const addFriend = (username, friend) => {
    const collection = db.collection('users');
    collection.updateOne(
        { username: username },
        { $push: { friends: friend } },
        { upsert: true },
        (err, result) => {
            if (err) throw err;
            console.log(`${friend} добавлен в друзья ${username}`);
        }
    );
};

