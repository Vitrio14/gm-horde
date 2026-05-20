function login() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email !== 'gm@horde.it') {

        alert('Accesso non autorizzato');

        return;
    }

    auth.signInWithEmailAndPassword(email, password)

        .then((userCredential) => {

            const user = userCredential.user;

            if (user.email !== 'gm@horde.it') {

                auth.signOut();

                alert('Utente non autorizzato');

                return;
            }

            document.getElementById('login-page')
                .classList.add('hidden');

            document.getElementById('dashboard')
                .classList.remove('hidden');

            loadQuests();
            loadDocs();
            loadNotes();
            loadMedia();
            loadCommands();
            loadGlobalLinks();
            loadPlayers();
        })

        .catch((error) => {

            alert(
                'Errore Login: ' + error.message
            );

        });
}

function logout() {
    auth.signOut();
    location.reload();
}

function showSection(id) {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });

    document.getElementById(id).classList.add('active');
}

/* QUEST */

function openQuestModal() {

    Swal.fire({

        title: 'Nuova Quest',

        html: `

            <input
                id="quest-title"
                class="swal2-input"
                placeholder="Titolo Quest"
            >

            <textarea
                id="quest-details"
                class="swal2-textarea"
                placeholder="Dettagli Quest"
            ></textarea>

            <input
                id="quest-dynasty"
                class="swal2-input"
                placeholder="Dinastia interessata"
            >

            <input
                id="quest-duration"
                class="swal2-input"
                placeholder="Durata"
            >

            <select
                id="quest-status"
                class="swal2-select"
            >

                <option value="todo">
                    Da Fare
                </option>

                <option value="progress">
                    In Corso
                </option>

                <option value="done">
                    Completata
                </option>

            </select>

        `,

        confirmButtonText: 'Crea Quest',

        background: '#131a25',

        preConfirm: () => {

            return {

                title:
                    document.getElementById(
                        'quest-title'
                    ).value,

                details:
                    document.getElementById(
                        'quest-details'
                    ).value,

                dynasty:
                    document.getElementById(
                        'quest-dynasty'
                    ).value,

                duration:
                    document.getElementById(
                        'quest-duration'
                    ).value,

                status:
                    document.getElementById(
                        'quest-status'
                    ).value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('quests').add({

                title: result.value.title,
                details: result.value.details,
                dynasty: result.value.dynasty,
                duration: result.value.duration,
                status: result.value.status

            }).then(() => {

                showToast(
                    'Quest creata'
                );

                loadQuests();
            });
        }
    });
}

function loadQuests() {

    const container =
        document.getElementById('quest-list');

    container.innerHTML = '';

    db.collection('quests').get().then(snapshot => {

        snapshot.forEach(doc => {

            const q = doc.data();

            container.innerHTML += `

                <div class="card">

                    <h3>${q.title}</h3>

                    <p>${q.details}</p>

                    <p>
                        <b>Dinastia:</b>
                        ${q.dynasty}
                    </p>

                    <p>
                        <b>Durata:</b>
                        ${q.duration}
                    </p>

                    <div class="status ${q.status}">
                        ${q.status}
                    </div>

                    <div class="action-buttons">

                        <button
                            class="delete-btn"
                            onclick="
                                confirmDelete(
                                    'quests',
                                    '${doc.id}',
                                    loadQuests
                                )
                            "
                        >

                            Elimina

                        </button>

                    </div>

                </div>

            `;
        });
    });
}
function addDoc() {

    Swal.fire({

        title: 'Nuovo Documento',

        html: `

            <input 
                id="doc-title"
                class="swal2-input"
                placeholder="Titolo"
            >

            <input 
                id="doc-link"
                class="swal2-input"
                placeholder="Link Google Docs"
            >

        `,

        confirmButtonText: 'Salva',

        background: '#131a25',

        preConfirm: () => {

            return {

                title: document
                    .getElementById('doc-title')
                    .value,

                link: document
                    .getElementById('doc-link')
                    .value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('docs').add({

                title: result.value.title,
                link: result.value.link

            }).then(() => {

                showToast(
                    'Documento aggiunto'
                );

                loadDocs();
            });
        }
    });
}

function loadDocs() {

    const container =
        document.getElementById('docs-list');

    container.innerHTML = '';

    db.collection('docs').get().then(snapshot => {

        snapshot.forEach(doc => {

            const d = doc.data();

            container.innerHTML += `

                <div class="card">

                    <h3>${d.title}</h3>

                    <button 
                        class="open-doc-btn"
                        onclick="openGoogleDoc('${d.link}')"
                    >

                        <i class="fa-solid fa-file"></i>

                        Apri Documento

                    </button>

                    <button 
                        class="delete-btn"
                        onclick="deleteDoc('${doc.id}')"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Elimina

                    </button>

                </div>

            `;
        });
    });
}

/* NOTES */

function addNote() {

    Swal.fire({

        title: 'Nuova Nota',

        html: `

            <textarea
                id="note-content"
                class="swal2-textarea"
                placeholder="Scrivi nota..."
            ></textarea>

        `,

        confirmButtonText: 'Salva',

        background: '#131a25',

        preConfirm: () => {

            return {

                note:
                    document.getElementById(
                        'note-content'
                    ).value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('notes').add({

                note: result.value.note

            }).then(() => {

                showToast(
                    'Nota aggiunta'
                );

                loadNotes();
            });
        }
    });
}

function loadNotes() {

    const container =
        document.getElementById('notes-list');

    container.innerHTML = '';

    db.collection('notes').get().then(snapshot => {

        snapshot.forEach(doc => {

            const n = doc.data();

            container.innerHTML += `

                <div class="card">

                    <p>${n.note}</p>

                    <div class="action-buttons">

                        <button
                            class="delete-btn"
                            onclick="
                                confirmDelete(
                                    'notes',
                                    '${doc.id}',
                                    loadNotes
                                )
                            "
                        >

                            Elimina

                        </button>

                    </div>

                </div>

            `;
        });
    });
}

/* MEDIA */

function addMedia() {

    Swal.fire({

        title: 'Nuovo Contenuto',

        html: `

            <input
                id="media-title"
                class="swal2-input"
                placeholder="Titolo"
            >

            <textarea
                id="media-content"
                class="swal2-textarea"
                placeholder="Testo o URL immagine"
            ></textarea>

        `,

        confirmButtonText: 'Salva',

        background: '#131a25',

        preConfirm: () => {

            return {

                title:
                    document.getElementById(
                        'media-title'
                    ).value,

                content:
                    document.getElementById(
                        'media-content'
                    ).value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('media').add({

                title: result.value.title,
                content: result.value.content

            }).then(() => {

                showToast(
                    'Contenuto aggiunto'
                );

                loadMedia();
            });
        }
    });
}

function loadMedia() {

    const container =
        document.getElementById('media-list');

    container.innerHTML = '';

    db.collection('media').get().then(snapshot => {

        snapshot.forEach(doc => {

            const m = doc.data();

            let mediaHTML = '';

            if (
                m.content.includes('.png') ||
                m.content.includes('.jpg') ||
                m.content.includes('.jpeg') ||
                m.content.includes('.gif') ||
                m.content.includes('https://')
            ) {

                mediaHTML = `
                    <img
                        src="${m.content}"
                        class="media-image"
                    >
                `;

            } else {

                mediaHTML = `
                    <p>${m.content}</p>
                `;
            }

            container.innerHTML += `

                <div class="card">

                    <h3>${m.title}</h3>

                    ${mediaHTML}

                    <div class="action-buttons">

                        <button
                            class="delete-btn"
                            onclick="
                                confirmDelete(
                                    'media',
                                    '${doc.id}',
                                    loadMedia
                                )
                            "
                        >

                            Elimina

                        </button>

                    </div>

                </div>

            `;
        });
    });
}

// --- PROTEZIONE INTERFACCIA ---
document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function(e) {
    if (e.keyCode == 123) return false; 
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false; 
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false; 
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false; 
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; 
};

setInterval(function() {
    debugger;
}, 100);

/* COMMANDS */

function addCommand() {

    Swal.fire({

        title: 'Nuovo Comando',

        html: `

            <input
                id="command-name"
                class="swal2-input"
                placeholder="/comando"
            >

            <textarea
                id="command-description"
                class="swal2-textarea"
                placeholder="Descrizione comando"
            ></textarea>

        `,

        confirmButtonText: 'Salva',

        background: '#131a25',

        preConfirm: () => {

            return {

                command:
                    document.getElementById(
                        'command-name'
                    ).value,

                description:
                    document.getElementById(
                        'command-description'
                    ).value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('commands').add({

                command: result.value.command,
                description: result.value.description

            }).then(() => {

                showToast(
                    'Comando aggiunto'
                );

                loadCommands();
            });
        }
    });
}

function loadCommands() {

    const container =
        document.getElementById('commands-list');

    container.innerHTML = '';

    db.collection('commands').get().then(snapshot => {

        snapshot.forEach(doc => {

            const c = doc.data();

            container.innerHTML += `

                <div class="card">

                    <h3>${c.command}</h3>

                    <p>${c.description}</p>

                    <div class="action-buttons">

                        <button
                            class="delete-btn"
                            onclick="
                                confirmDelete(
                                    'commands',
                                    '${doc.id}',
                                    loadCommands
                                )
                            "
                        >

                            Elimina

                        </button>

                    </div>

                </div>

            `;
        });
    });
}

/* ADMIN LINKS */

function saveGlobalLink() {

    Swal.fire({

        title: 'Nuovo Link',

        html: `

            <input
                id="link-title"
                class="swal2-input"
                placeholder="Titolo"
            >

            <input
                id="link-url"
                class="swal2-input"
                placeholder="https://..."
            >

        `,

        confirmButtonText: 'Salva',

        background: '#131a25',

        preConfirm: () => {

            return {

                title:
                    document.getElementById(
                        'link-title'
                    ).value,

                link:
                    document.getElementById(
                        'link-url'
                    ).value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('globalLinks').add({

                title: result.value.title,
                link: result.value.link

            }).then(() => {

                showToast(
                    'Link salvato'
                );

                loadGlobalLinks();
            });
        }
    });
}

function loadGlobalLinks() {

    const container =
        document.getElementById('global-links');

    container.innerHTML = '';

    db.collection('globalLinks').get().then(snapshot => {

        snapshot.forEach(doc => {

            const l = doc.data();

            container.innerHTML += `

                <div class="card">

                    <h3>${l.title}</h3>

                    <a
                        href="${l.link}"
                        target="_blank"
                        class="link-btn"
                    >

                        APRI LINK

                    </a>

                    <div class="action-buttons">

                        <button
                            class="delete-btn"
                            onclick="
                                confirmDelete(
                                    'globalLinks',
                                    '${doc.id}',
                                    loadGlobalLinks
                                )
                            "
                        >

                            Elimina

                        </button>

                    </div>

                </div>

            `;
        });
    });
}

function openGoogleDoc(link) {

    const preview =
        link.replace('/edit', '/preview');

    Swal.fire({

        width: '90%',

        html: `

            <iframe
                src="${preview}"
                style="
                    width:100%;
                    height:80vh;
                    border:none;
                    border-radius:15px;
                "
            ></iframe>

        `,

        showCloseButton: true,
        showConfirmButton: false,
        background: '#131a25'
    });
}

function deleteDoc(id) {

    Swal.fire({

        title: 'Eliminare documento?',

        text: 'Questa azione è irreversibile',

        icon: 'warning',

        showCancelButton: true,

        confirmButtonText: 'Elimina',

        cancelButtonText: 'Annulla',

        confirmButtonColor: '#ef4444'

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('docs')
                .doc(id)
                .delete()
                .then(() => {

                    showToast(
                        'Documento eliminato'
                    );

                    loadDocs();
                });
        }
    });
}

function showToast(text) {

    Toastify({

        text: text,

        duration: 3000,

        gravity: 'top',

        position: 'right',

        style: {
            background:
                'linear-gradient(to right, #ef4444, #b91c1c)',
            borderRadius: '12px'
        }

    }).showToast();
}

function confirmDelete(collection, id, reloadFunction) {

    Swal.fire({

        title: 'Conferma eliminazione',

        text: 'Questa azione non può essere annullata',

        icon: 'warning',

        showCancelButton: true,

        confirmButtonColor: '#ef4444',

        cancelButtonColor: '#b91c1c',

        confirmButtonText: 'Elimina',

        cancelButtonText: 'Annulla'

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection(collection)
                .doc(id)
                .delete()
                .then(() => {

                    showToast('Elemento eliminato');

                    reloadFunction();
                });
        }
    });
}

function showToast(text) {

    Toastify({

        text: text,

        duration: 3000,

        gravity: 'top',

        position: 'right',

        style: {

            background:
                'linear-gradient(to right,#ef4444,#b91c1c)',

            borderRadius: '12px'
        }

    }).showToast();
}

/* PLAYERS */

function addPlayer() {

    Swal.fire({

        title: 'Nuovo Player',

        html: `

            <input
                id="player-name"
                class="swal2-input"
                placeholder="Nome Player"
            >

            <textarea
                id="player-notes"
                class="swal2-textarea"
                placeholder="Note Player"
            ></textarea>

        `,

        confirmButtonText: 'Crea Player',

        background: '#131a25',

        preConfirm: () => {

            return {

                name:
                    document.getElementById(
                        'player-name'
                    ).value,

                notes:
                    document.getElementById(
                        'player-notes'
                    ).value
            };
        }

    }).then((result) => {

        if (result.isConfirmed) {

            db.collection('players').add({

                name: result.value.name,
                notes: result.value.notes,
                quests: []

            }).then(() => {

                showToast('Player creato');

                loadPlayers();
            });
        }
    });
}

function loadPlayers() {

    const container =
        document.getElementById('players-list');

    container.innerHTML = '';

    db.collection('players').get().then(snapshot => {

        snapshot.forEach(doc => {

            const p = doc.data();

            container.innerHTML += `

                <div class="card">

                    <h3>${p.name}</h3>

                    <p>
                        ${p.notes || 'Nessuna nota'}
                    </p>

                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            onclick="
                                openPlayerModal(
                                    '${doc.id}'
                                )
                            "
                        >
                            Apri
                        </button>

                        <button
                            class="delete-btn"
                            onclick="
                                confirmDelete(
                                    'players',
                                    '${doc.id}',
                                    loadPlayers
                                )
                            "
                        >
                            Elimina
                        </button>

                    </div>

                </div>

            `;
        });
    });
}

function openPlayerModal(playerId) {

    db.collection('players')
        .doc(playerId)
        .get()
        .then(playerDoc => {

            const player = playerDoc.data();

            db.collection('quests').get().then(snapshot => {

                let questOptions = '';

                snapshot.forEach(qDoc => {

                    const q = qDoc.data();

                    const selected =
                        player.quests &&
                        player.quests.includes(q.title)
                            ? 'selected'
                            : '';

                    questOptions += `

                        <option
                            value="${q.title}"
                            ${selected}
                        >
                            ${q.title}
                        </option>

                    `;
                });

                Swal.fire({

                    title: player.name,

                    html: `

                        <textarea
                            id="player-notes-edit"
                            class="swal2-textarea"
                            placeholder="Note"
                        >${player.notes || ''}</textarea>

                        <select
                            id="player-quests"
                            class="swal2-select"
                            multiple
                            style="height:200px;"
                        >

                            ${questOptions}

                        </select>

                    `,

                    width: 700,

                    confirmButtonText: 'Salva',

                    background: '#131a25',

                    preConfirm: () => {

                        const selectedQuests =
                            Array.from(
                                document.getElementById(
                                    'player-quests'
                                ).selectedOptions
                            ).map(option => option.value);

                        return {

                            notes:
                                document.getElementById(
                                    'player-notes-edit'
                                ).value,

                            quests:
                                selectedQuests
                        };
                    }

                }).then((result) => {

                    if (result.isConfirmed) {

                        db.collection('players')
                            .doc(playerId)
                            .update({

                                notes: result.value.notes,
                                quests: result.value.quests

                            })
                            .then(() => {

                                showToast(
                                    'Player aggiornato'
                                );

                                loadPlayers();
                            });
                    }
                });

            });

        });
}


auth.onAuthStateChanged(user => {

    if (user && user.email === 'gm@horde.it') {

        document.getElementById('login-page')
            .classList.add('hidden');

        document.getElementById('dashboard')
            .classList.remove('hidden');

        loadQuests();
        loadDocs();
        loadNotes();
        loadMedia();
        loadCommands();
        loadGlobalLinks();

    } else {

        document.getElementById('login-page')
            .classList.remove('hidden');

        document.getElementById('dashboard')
            .classList.add('hidden');
    }
});