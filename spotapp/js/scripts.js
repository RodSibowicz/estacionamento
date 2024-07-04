
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('UserDatabase', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('users', { keyPath: 'username' });
            db.createObjectStore('reservations', { keyPath: 'id', autoIncrement: true });
        };
    });
}


function addUser(db, user) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.add(user);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getUser(db, username) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(username);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


function addReservation(db, reservation) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reservations'], 'readwrite');
        const store = transaction.objectStore('reservations');
        const request = store.add(reservation);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


function listReservations(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reservations'], 'readonly');
        const store = transaction.objectStore('reservations');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


document.getElementById('registerForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const db = await openDatabase();
    const user = { username, password };

    try {
        await addUser(db, user);
        alert('Cadastro realizado com sucesso!');
    } catch (error) {
        alert('Erro ao cadastrar: ' + error);
    }
});


document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const db = await openDatabase();
    const user = await getUser(db, username);

    if (user && user.password === password) {
        alert('Login realizado com sucesso!');
        window.location.href = 'reservation.html';
    } else {
        alert('Username ou senha incorretos.');
    }
});


document.getElementById('reservationForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const spot = document.getElementById('spot').value;
    const time = document.getElementById('time').value;

    const db = await openDatabase();
    const reservation = { username, spot, time };

    try {
        await addReservation(db, reservation);
        alert('Reserva realizada com sucesso!');
        displayReservations();
    } catch (error) {
        alert('Erro ao reservar: ' + error);
    }
});


function displaySpots() {
    const selectSpot = document.getElementById('spot');
    for (let i = 1; i <= 50; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Vaga ${i}`;
        selectSpot.appendChild(option);
    }
}


async function displayReservations() {
    const db = await openDatabase();
    const reservations = await listReservations(db);

    const reservationList = document.getElementById('reservationList');
    reservationList.innerHTML = '';

    reservations.forEach(reservation => {
        const li = document.createElement('li');
        li.textContent = `Usuário: ${reservation.username}, Vaga: ${reservation.spot}, Tempo Reservado: ${reservation.time} horas`;
        reservationList.appendChild(li);
    });
}


if (document.getElementById('reservationForm')) {
    displaySpots();
}


if (document.getElementById('reservationList')) {
    displayReservations();
}

async function displayReservations() {
    const db = await openDatabase();
    const reservations = await listReservations(db);

    const reservationList = document.getElementById('reservationList');
    reservationList.innerHTML = '';

    reservations.forEach(reservation => {
        const li = document.createElement('li');
        li.textContent = `Usuário: ${reservation.username}, Vaga: ${reservation.spot}, Tempo Reservado: ${reservation.time} horas`;
        reservationList.appendChild(li);
    });
}


async function displayReservedSpots() {
    const db = await openDatabase();
    const reservations = await listReservations(db);

    const reservedList = document.getElementById('reservedList');
    reservedList.innerHTML = '';

    reservations.forEach(reservation => {
        const li = document.createElement('li');
        li.textContent = `Usuário: ${reservation.username}, Vaga: ${reservation.spot}, Tempo Reservado: ${reservation.time} horas`;
        reservedList.appendChild(li);
    });
}


if (document.getElementById('reservationForm')) {
    displaySpots();
}


if (document.getElementById('reservationList')) {
    displayReservations();
}


if (document.getElementById('reservedList')) {
    displayReservedSpots();
}

async function isSpotAvailable(db, spot) {
    const reservations = await listReservations(db);
    return !reservations.some(reservation => reservation.spot === spot);
}


document.getElementById('reservationForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const spot = document.getElementById('spot').value;
    const time = document.getElementById('time').value;

    const db = await openDatabase();

    try {
   
        const available = await isSpotAvailable(db, spot);

        if (!available) {
            alert('Esta vaga já está reservada. Por favor, escolha outra.');
            return;
        }

        const reservation = { username, spot, time };
        await addReservation(db, reservation);
        alert('Reserva realizada com sucesso!');

        window.location.href = 'reserved.html';
    } catch (error) {
        alert('Erro ao reservar: ' + error);
    }
});
