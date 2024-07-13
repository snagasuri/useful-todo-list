var images = [
    'CATCH_A.png', 'SUB01E.png', 'SUB02E.png', 'SUB03E.png', 'SUB04E.png',
    'SUB05E.png', 'SUB06E.png', 'SUB07E.png', 'SUB08E.png', 'SUB09E.png',
    'SUB10E.png', 'SUB11E.png', 'SUB12E.png', 'SUB13E.png', 'SUB14E.png',
    'SUB15E.png', 'SUB16E.png', 'SUB17E.png', 'SUB18E.png', 'SUB19E.png',
    'SUB20E.png', 'SUB21E.png', 'SUB22E.png', 'SUB23E.png', 'SUB24EB.png',
    'SUB25E.png', 'SUB26E.png', 't.png'
];

document.getElementById('addTodo').addEventListener('click', addNewItem);
document.getElementById('newTodo').addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
        addNewItem();
    }
});

function addItem(text, checked) {
    var list = document.getElementById('todoList');
    var item = document.createElement('li');
    
    if (checked) {
        item.style.textDecoration = 'line-through';
    }
    
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            item.style.textDecoration = 'line-through';
        } else {
            item.style.textDecoration = 'none';
        }
        saveTodos();
    });

    var textSpan = document.createElement('span');
    textSpan.innerText = text;
    
    item.appendChild(checkbox);
    item.appendChild(textSpan);
    list.appendChild(item);

    item.setAttribute('draggable', true);
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
}

function addNewItem() {
    var value = document.getElementById('newTodo').value;
    if (value) {
        addItem(value, false);
        document.getElementById('newTodo').value = '';
        saveTodos();
    }
}

function saveTodos() {
    var todos = [];
    var items = document.querySelectorAll('#todoList li');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var text = item.querySelector('span').innerText;
        var checked = item.querySelector('input').checked;
        todos.push({ text: text, checked: checked });
    }
    chrome.storage.local.set({ todos: todos }, function() {
        if (chrome.runtime.lastError) {
            console.error("Error saving todos:", chrome.runtime.lastError.message);
        }
    });
}

function loadTodos() {
    chrome.storage.local.get('todos', function(data) {
        var todos = data.todos || [];
        for (var i = 0; i < todos.length; i++) {
            addItem(todos[i].text, todos[i].checked);
        }
    });
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
}

function handleDragOver(e) {
    if (draggedItem === this) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    if (draggedItem === this) return;
    const bounding = this.getBoundingClientRect();
    const offset = bounding.y + (bounding.height/2);
    if (e.clientY - offset > 0) {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    } else {
        this.parentNode.insertBefore(draggedItem, this);
    }
    saveTodos();
}

function handleDragEnd(e) {
    draggedItem = null;
}

var contextMenu = document.getElementById('contextMenu');
var currentItem = null;

document.getElementById('todoList').addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (e.target.tagName === 'LI' || e.target.tagName === 'SPAN') {
        currentItem = e.target.tagName === 'LI' ? e.target : e.target.parentElement;
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.style.display = 'block';
    }
});

document.getElementById('deleteItem').addEventListener('click', function() {
    if (currentItem) {
        currentItem.remove();
        contextMenu.style.display = 'none';
        saveTodos();
    }
});

document.getElementById('editItem').addEventListener('click', function() {
    if (currentItem) {
        var textSpan = currentItem.querySelector('span');
        var newText = prompt('Edit task:', textSpan.innerText);
        if (newText) {
            textSpan.innerText = newText;
            saveTodos();
        }
        contextMenu.style.display = 'none';
    }
});

document.addEventListener('click', function(e) {
    if (e.target.id !== 'contextMenu' && e.target.className !== 'context-menu-item') {
        contextMenu.style.display = 'none';
    }
});

function loadImage() {
    chrome.storage.local.get('currentImageIndex', function(data) {
        var currentIndex = data.currentImageIndex || 0;
        var imgElement = document.getElementById('tabImage');
        
        imgElement.src = 'images/' + images[currentIndex];
        
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }

        chrome.storage.local.set({ 'currentImageIndex': currentIndex });
    });
}

let currentMonth = new Date();

function populateCalendar(month) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const monthDays = document.getElementById('monthDays');
    const currentMonthDiv = document.getElementById('currentMonth');

    monthDays.innerHTML = '';

    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    currentMonthDiv.innerText = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;

    let day = firstDay.getDay();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysHeaderRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.innerText = day;
        daysHeaderRow.appendChild(dayHeader);
    });
    monthDays.appendChild(daysHeaderRow);
    
    let weekRow = document.createElement('tr');
    for (let i = 0; i < day; i++) {
        weekRow.appendChild(document.createElement('td'));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        if (day % 7 === 0 && day !== 0) {
            monthDays.appendChild(weekRow);
            weekRow = document.createElement('tr');
        }

        const dayCell = document.createElement('td');
        dayCell.innerText = i;
        weekRow.appendChild(dayCell);

        day++;
    }

    monthDays.appendChild(weekRow);
}

document.getElementById('wrapThisUpButton').addEventListener('click', wrapThisUp);

function displayWrappedSessions() {
    const container = document.getElementById('wrappedSessions');
    container.innerHTML = '';

    chrome.storage.local.get('wrappedSessions', function(data) {
        const wrappedSessions = data.wrappedSessions || [];
        wrappedSessions.forEach((session, index) => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'wrapped-session';
            sessionElement.innerHTML = `
                <div class="session-actions">
                    <button class="session-action view">view</button>
                    <button class="session-action edit">edit</button>
                    <button class="session-action delete">delete</button>
                </div>
                <img src="icons.png" alt="Folder">
                <span title="${session.name}">${session.name}</span>
            `;
            sessionElement.querySelector('img').addEventListener('click', () => openWrappedSession(index));
            sessionElement.querySelector('.view').addEventListener('click', (e) => viewWrappedSession(e, index));
            sessionElement.querySelector('.edit').addEventListener('click', (e) => editWrappedSession(e, index));
            sessionElement.querySelector('.delete').addEventListener('click', (e) => deleteWrappedSession(e, index));
            
            container.appendChild(sessionElement);
        });
    });
}

function viewWrappedSession(event, index) {
    event.stopPropagation();
    chrome.storage.local.get('wrappedSessions', function(data) {
        const session = data.wrappedSessions[index];
        let links = session.tabs.map(tab => `<li><a href="${tab.url}" target="_blank">${tab.title}</a></li>`).join('');
        const viewWindow = window.open('', '_blank', 'width=400,height=600');
        viewWindow.document.write(`
            <html>
                <head>
                    <title>View Session: ${session.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; margin-bottom: 20px; }
                        ul { list-style-type: none; padding: 0; }
                        li { margin: 10px 0; }
                        a { text-decoration: none; color: #000; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h1>${session.name}</h1>
                    <ul>${links}</ul>
                </body>
            </html>
        `);
        viewWindow.document.close();
    });
}

function displayWrappedSessions() {
    const container = document.getElementById('wrappedSessions');
    container.innerHTML = '';

    chrome.storage.local.get('wrappedSessions', function(data) {
        const wrappedSessions = data.wrappedSessions || [];
        wrappedSessions.forEach((session, index) => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'wrapped-session';
            sessionElement.innerHTML = `
                <div class="session-actions">
                    <button class="session-action view">view</button>
                    <button class="session-action edit">edit</button>
                    <button class="session-action delete">delete</button>
                </div>
                <img src="icons.png" alt="Folder">
                <span title="${session.name}">${session.name}</span>
            `;
            sessionElement.querySelector('img').addEventListener('click', () => openWrappedSession(index));
            sessionElement.querySelector('.view').addEventListener('click', (e) => viewWrappedSession(e, index));
            sessionElement.querySelector('.edit').addEventListener('click', (e) => editWrappedSession(e, index));
            sessionElement.querySelector('.delete').addEventListener('click', (e) => deleteWrappedSession(e, index));
            container.appendChild(sessionElement);
        });
    });
}

function viewWrappedSession(event, index) {
    event.stopPropagation();
    chrome.storage.local.get('wrappedSessions', function(data) {
        const session = data.wrappedSessions[index];
        let links = session.tabs.map(tab => `<li><a href="${tab.url}" target="_blank">${tab.title}</a></li>`).join('');
        const viewWindow = window.open('', '_blank', 'width=400,height=600');
        viewWindow.document.write(`
            <html>
                <head>
                    <title>View Session</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        ul { list-style-type: none; padding: 0; }
                        li { margin: 10px 0; }
                        a { text-decoration: none; color: #000; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h2>${session.name}</h2>
                    <ul>${links}</ul>
                </body>
            </html>
        `);
        viewWindow.document.close();
    });
}

function wrapThisUp() {
    chrome.tabs.query({}, function(tabs) {
        const sessionName = prompt("enter a name for this session:");
        if (sessionName) {
            const session = {
                name: sessionName,
                tabs: tabs.map(tab => ({ url: tab.url, title: tab.title })),
                timestamp: new Date().toISOString()
            };

            chrome.storage.local.get('wrappedSessions', function(data) {
                const wrappedSessions = data.wrappedSessions || [];
                wrappedSessions.push(session);
                chrome.storage.local.set({ wrappedSessions: wrappedSessions }, function() {
                    displayWrappedSessions();
                });
            });
        }
    });
}

function openWrappedSession(index) {
    chrome.storage.local.get('wrappedSessions', function(data) {
        const session = data.wrappedSessions[index];
        session.tabs.forEach(tab => {
            chrome.tabs.create({ url: tab.url, active: false }, function(newTab) {
                if (chrome.runtime.lastError) {
                    console.error("Error creating tab:", chrome.runtime.lastError.message);
                } else {
                    console.log("Tab created successfully:", newTab.id);
                }
            });
        });
    });
}

function editWrappedSession(event, index) {
    event.stopPropagation();
    chrome.storage.local.get('wrappedSessions', function(data) {
        const wrappedSessions = data.wrappedSessions;
        const newName = prompt("Enter a new name for this session:", wrappedSessions[index].name);
        if (newName) {
            wrappedSessions[index].name = newName;
            chrome.storage.local.set({ wrappedSessions: wrappedSessions }, function() {
                displayWrappedSessions();
            });
        }
    });
}

function deleteWrappedSession(event, index) {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this wrapped session?")) {
        chrome.storage.local.get('wrappedSessions', function(data) {
            const wrappedSessions = data.wrappedSessions;
            wrappedSessions.splice(index, 1);
            chrome.storage.local.set({ wrappedSessions: wrappedSessions }, function() {
                displayWrappedSessions();
            });
        });
    }
}



document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    populateCalendar(currentMonth);
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    populateCalendar(currentMonth);
});

document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    loadImage();
    populateCalendar(currentMonth);
    displayWrappedSessions();
});
