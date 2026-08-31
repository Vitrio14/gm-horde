// Stati delle cartelle attive nelle varie sezioni
let currentQuestsFolder = null;
let currentDocsFolder = null;
let currentNotesFolder = null;
let currentMediaFolder = null;

function login() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email !== 'gm.vampiri@horde.it') {

        alert('Accesso non autorizzato');

        return;
    }

    auth.signInWithEmailAndPassword(email, password)

        .then((userCredential) => {

            const user = userCredential.user;

            if (user.email !== 'gm.vampiri@horde.it') {

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

/* FUNZIONE GESTIONE CARTELLE */

function addFolder(type) {
    Swal.fire({
        title: 'Nuova Cartella',
        html: `
            <input
                id="folder-name"
                class="swal2-input"
                placeholder="Nome Cartella"
            >
        `,
        confirmButtonText: 'Crea Cartella',
        background: '#131a25',
        preConfirm: () => {
            return document.getElementById('folder-name').value;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            db.collection('folders').add({
                name: result.value,
                type: type
            }).then(() => {
                showToast('Cartella creata');
            });
        }
    });
}

/* QUEST */

function openQuestModal() {
    if (!currentQuestsFolder) {
        Swal.fire({
            icon: 'warning',
            title: 'Attenzione',
            text: 'Seleziona o crea prima una cartella per poter aggiungere una Quest!',
            background: '#131a25'
        });
        return;
    }

    // Carica dinamicamente i giocatori esistenti dal database per il selettore
    db.collection('players').get().then(snapshot => {
        let playerOptions = '<option value="">Nessun Player</option>';
        snapshot.forEach(doc => {
            const p = doc.data();
            playerOptions += `<option value="${p.name}">${p.name}</option>`;
        });

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
                    placeholder="Dettagli Quest (Scrivi i vari step premendo Invio per andare a capo)"
                ></textarea>

                <input
                    id="quest-dynasty"
                    class="swal2-input"
                    placeholder="Dinastia interessata"
                >

                <select
                    id="quest-player"
                    class="swal2-select"
                >
                    ${playerOptions}
                </select>

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

                    player:
                        document.getElementById(
                            'quest-player'
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
                    player: result.value.player,
                    status: result.value.status,
                    folderId: currentQuestsFolder.id

                }).then(() => {

                    showToast(
                        'Quest creata'
                    );
                });
            }
        });
    });
}

function loadQuests() {
    const container = document.getElementById('quest-list');

    // Ascolto real-time sia delle cartelle che delle quest
    db.collection('folders').where('type', '==', 'quests').onSnapshot(foldersSnapshot => {
        db.collection('quests').onSnapshot(questsSnapshot => {
            container.innerHTML = '';

            if (currentQuestsFolder) {
                // Vista interna alla cartella: Mostra bottone per tornare indietro
                container.innerHTML += `
                    <div class="card folder-card back-card" onclick="currentQuestsFolder = null; loadQuests();" style="border-color: #ef4444; cursor: pointer;">
                        <h3><i class="fa-solid fa-arrow-left"></i> Torna alle Cartelle</h3>
                        <p style="margin-top: 8px;">Cartella attiva: <b>${currentQuestsFolder.name}</b></p>
                    </div>
                `;

                questsSnapshot.forEach(doc => {
                    const q = doc.data();
                    if (q.folderId === currentQuestsFolder.id) {
                        // Converte i dettagli separati da invio in comodi step strutturati
                        let stepsHTML = '';
                        if (q.details) {
                            const steps = q.details.split('\n').filter(s => s.trim() !== '');
                            stepsHTML = steps.map((step, index) => `<li><b>Step ${index + 1}:</b> ${step}</li>`).join('');
                        } else {
                            stepsHTML = '<li>Nessun dettaglio inserito</li>';
                        }

                        container.innerHTML += `
                            <div class="card">
                                <h3>${q.title}</h3>
                                
                                <div class="quest-steps-box">
                                    <ul style="list-style: none; padding: 0;">
                                        ${stepsHTML}
                                    </ul>
                                </div>

                                <p style="margin-top: 10px;">
                                    <b>Dinastia:</b> ${q.dynasty || 'Nessuna'}
                                </p>

                                <p>
                                    <b>Player Assegnato:</b> ${q.player || 'Nessuno'}
                                </p>

                                <div class="status ${q.status}">
                                    ${q.status}
                                </div>

                                <div class="action-buttons">
                                    <button
                                        class="delete-btn"
                                        onclick="confirmDelete('quests', '${doc.id}', loadQuests)"
                                    >
                                        Elimina
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                });
            } else {
                // Vista principale: mostra l'elenco delle cartelle disponibili
                foldersSnapshot.forEach(fDoc => {
                    const f = fDoc.data();
                    container.innerHTML += `
                        <div class="card folder-card" style="border-color: #f59e0b; cursor: pointer;" onclick="currentQuestsFolder = {id: '${fDoc.id}', name: '${f.name}'}; loadQuests();">
                            <h3><i class="fa-solid fa-folder" style="color: #f59e0b; margin-right: 8px;"></i> ${f.name}</h3>
                            <p>Apri per visualizzare le quest</p>
                            <div class="action-buttons" onclick="event.stopPropagation();" style="margin-top: 15px;">
                                <button class="delete-btn" style="padding: 6px; font-size: 13px;" onclick="confirmDelete('folders', '${fDoc.id}', loadQuests)">
                                    Elimina Cartella
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        });
    });
}

/* DOCUMENTI */

function addDoc() {
    if (!currentDocsFolder) {
        Swal.fire({
            icon: 'warning',
            title: 'Attenzione',
            text: 'Seleziona o crea prima una cartella per poter aggiungere un documento!',
            background: '#131a25'
        });
        return;
    }

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
                link: result.value.link,
                folderId: currentDocsFolder.id

            }).then(() => {

                showToast(
                    'Documento aggiunto'
                );
            });
        }
    });
}

function loadDocs() {
    const container = document.getElementById('docs-list');

    db.collection('folders').where('type', '==', 'docs').onSnapshot(foldersSnapshot => {
        db.collection('docs').onSnapshot(docsSnapshot => {
            container.innerHTML = '';

            if (currentDocsFolder) {
                container.innerHTML += `
                    <div class="card folder-card back-card" onclick="currentDocsFolder = null; loadDocs();" style="border-color: #ef4444; cursor: pointer;">
                        <h3><i class="fa-solid fa-arrow-left"></i> Torna alle Cartelle</h3>
                        <p style="margin-top: 8px;">Cartella attiva: <b>${currentDocsFolder.name}</b></p>
                    </div>
                `;

                docsSnapshot.forEach(doc => {
                    const d = doc.data();
                    if (d.folderId === currentDocsFolder.id) {
                        container.innerHTML += `
                            <div class="card">
                                <h3>${d.title}</h3>
                                <button 
                                    class="open-doc-btn"
                                    onclick="openGoogleDoc('${d.link}')"
                                >
                                    <i class="fa-solid fa-file"></i> Apri Documento
                                </button>
                                <button 
                                    class="delete-btn"
                                    onclick="deleteDoc('${doc.id}')"
                                >
                                    <i class="fa-solid fa-trash"></i> Elimina
                                </button>
                            </div>
                        `;
                    }
                });
            } else {
                foldersSnapshot.forEach(fDoc => {
                    const f = fDoc.data();
                    container.innerHTML += `
                        <div class="card folder-card" style="border-color: #f59e0b; cursor: pointer;" onclick="currentDocsFolder = {id: '${fDoc.id}', name: '${f.name}'}; loadDocs();">
                            <h3><i class="fa-solid fa-folder" style="color: #f59e0b; margin-right: 8px;"></i> ${f.name}</h3>
                            <p>Apri per visualizzare i documenti</p>
                            <div class="action-buttons" onclick="event.stopPropagation();" style="margin-top: 15px;">
                                <button class="delete-btn" style="padding: 6px; font-size: 13px;" onclick="confirmDelete('folders', '${fDoc.id}', loadDocs)">
                                    Elimina Cartella
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        });
    });
}

/* NOTES */

function addNote() {
    if (!currentNotesFolder) {
        Swal.fire({
            icon: 'warning',
            title: 'Attenzione',
            text: 'Seleziona o crea prima una cartella per poter aggiungere una nota!',
            background: '#131a25'
        });
        return;
    }

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

                note: result.value.note,
                folderId: currentNotesFolder.id

            }).then(() => {

                showToast(
                    'Nota aggiunta'
                );
            });
        }
    });
}

function loadNotes() {
    const container = document.getElementById('notes-list');

    db.collection('folders').where('type', '==', 'notes').onSnapshot(foldersSnapshot => {
        db.collection('notes').onSnapshot(notesSnapshot => {
            container.innerHTML = '';

            if (currentNotesFolder) {
                container.innerHTML += `
                    <div class="card folder-card back-card" onclick="currentNotesFolder = null; loadNotes();" style="border-color: #ef4444; cursor: pointer;">
                        <h3><i class="fa-solid fa-arrow-left"></i> Torna alle Cartelle</h3>
                        <p style="margin-top: 8px;">Cartella attiva: <b>${currentNotesFolder.name}</b></p>
                    </div>
                `;

                notesSnapshot.forEach(doc => {
                    const n = doc.data();
                    if (n.folderId === currentNotesFolder.id) {
                        container.innerHTML += `
                            <div class="card">
                                <p>${n.note}</p>
                                <div class="action-buttons">
                                    <button
                                        class="delete-btn"
                                        onclick="confirmDelete('notes', '${doc.id}', loadNotes)"
                                    >
                                        Elimina
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                });
            } else {
                foldersSnapshot.forEach(fDoc => {
                    const f = fDoc.data();
                    container.innerHTML += `
                        <div class="card folder-card" style="border-color: #f59e0b; cursor: pointer;" onclick="currentNotesFolder = {id: '${fDoc.id}', name: '${f.name}'}; loadNotes();">
                            <h3><i class="fa-solid fa-folder" style="color: #f59e0b; margin-right: 8px;"></i> ${f.name}</h3>
                            <p>Apri per visualizzare le note</p>
                            <div class="action-buttons" onclick="event.stopPropagation();" style="margin-top: 15px;">
                                <button class="delete-btn" style="padding: 6px; font-size: 13px;" onclick="confirmDelete('folders', '${fDoc.id}', loadNotes)">
                                    Elimina Cartella
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        });
    });
}

/* MEDIA */

function addMedia() {
    if (!currentMediaFolder) {
        Swal.fire({
            icon: 'warning',
            title: 'Attenzione',
            text: 'Seleziona o crea prima una cartella per poter aggiungere contenuti all\'archivio!',
            background: '#131a25'
        });
        return;
    }

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
                content: result.value.content,
                folderId: currentMediaFolder.id

            }).then(() => {

                showToast(
                    'Contenuto aggiunto'
                );
            });
        }
    });
}

function loadMedia() {
    const container = document.getElementById('media-list');

    db.collection('folders').where('type', '==', 'media').onSnapshot(foldersSnapshot => {
        db.collection('media').onSnapshot(mediaSnapshot => {
            container.innerHTML = '';

            if (currentMediaFolder) {
                container.innerHTML += `
                    <div class="card folder-card back-card" onclick="currentMediaFolder = null; loadMedia();" style="border-color: #ef4444; cursor: pointer;">
                        <h3><i class="fa-solid fa-arrow-left"></i> Torna alle Cartelle</h3>
                        <p style="margin-top: 8px;">Cartella attiva: <b>${currentMediaFolder.name}</b></p>
                    </div>
                `;

                mediaSnapshot.forEach(doc => {
                    const m = doc.data();
                    if (m.folderId === currentMediaFolder.id) {
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
                                        onclick="confirmDelete('media', '${doc.id}', loadMedia)"
                                    >
                                        Elimina
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                });
            } else {
                foldersSnapshot.forEach(fDoc => {
                    const f = fDoc.data();
                    container.innerHTML += `
                        <div class="card folder-card" style="border-color: #f59e0b; cursor: pointer;" onclick="currentMediaFolder = {id: '${fDoc.id}', name: '${f.name}'}; loadMedia();">
                            <h3><i class="fa-solid fa-folder" style="color: #f59e0b; margin-right: 8px;"></i> ${f.name}</h3>
                            <p>Apri per visualizzare l'archivio</p>
                            <div class="action-buttons" onclick="event.stopPropagation();" style="margin-top: 15px;">
                                <button class="delete-btn" style="padding: 6px; font-size: 13px;" onclick="confirmDelete('folders', '${fDoc.id}', loadMedia)">
                                    Elimina Cartella
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
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
            });
        }
    });
}

function loadCommands() {
    const container = document.getElementById('commands-list');

    db.collection('commands').onSnapshot(snapshot => {
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const c = doc.data();
            container.innerHTML += `
                <div class="card">
                    <h3>${c.command}</h3>
                    <p>${c.description}</p>
                    <div class="action-buttons">
                        <button
                            class="delete-btn"
                            onclick="confirmDelete('commands', '${doc.id}', loadCommands)"
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
            });
        }
    });
}

function loadGlobalLinks() {
    const container = document.getElementById('global-links');

    db.collection('globalLinks').onSnapshot(snapshot => {
        container.innerHTML = '';
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
                            onclick="confirmDelete('globalLinks', '${doc.id}', loadGlobalLinks)"
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
                });
        }
    });
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
            });
        }
    });
}

function loadPlayers() {
    const container = document.getElementById('players-list');

    db.collection('players').onSnapshot(snapshot => {
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const p = doc.data();

            // Mostra in modo chiaro le quest attive assegnate al player
            let activeQuestsHTML = '';
            if (p.quests && p.quests.length > 0) {
                activeQuestsHTML = p.quests.map(q => `<span class="status progress" style="margin: 2px;">${q}</span>`).join(' ');
            } else {
                activeQuestsHTML = '<span style="color: var(--muted); font-size:13px;">Nessuna quest attiva</span>';
            }

            container.innerHTML += `
                <div class="card">
                    <h3>${p.name}</h3>
                    <p>${p.notes || 'Nessuna nota'}</p>
                    <div style="margin-top:10px;">
                        <b>Quest Attive:</b><br>${activeQuestsHTML}
                    </div>
                    <div class="action-buttons">
                        <button
                            class="edit-btn"
                            onclick="openPlayerModal('${doc.id}')"
                        >
                            Apri
                        </button>
                        <button
                            class="delete-btn"
                            onclick="confirmDelete('players', '${doc.id}', loadPlayers)"
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

            // Recupera dinamicamente le quest correnti dal database delle quest
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

                        <label style="display:block; text-align:left; margin: 10px 0 5px 12px; color: var(--muted); font-size:14px; font-weight:600;">Seleziona Quest Attive dal Database:</label>
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
                            });
                    }
                });

            });

        });
}


auth.onAuthStateChanged(user => {

    if (user && user.email === 'gm.vampiri@horde.it') {

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

    } else {

        document.getElementById('login-page')
            .classList.remove('hidden');

        document.getElementById('dashboard')
            .classList.add('hidden');
    }
});