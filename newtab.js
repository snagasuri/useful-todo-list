var images = [
    'CATCH_A.png',
    'SUB01E.png',
    'SUB02E.png',
    'SUB03E.png',
    'SUB04E.png',
    'SUB05E.png',
    'SUB06E.png',
    'SUB07E.png',
    'SUB08E.png',
    'SUB09E.png',
    'SUB10E.png',
    'SUB11E.png',
    'SUB12E.png',
    'SUB13E.png',
    'SUB14E.png',
    'SUB15E.png',
    'SUB16E.png',
    'SUB17E.png',
    'SUB18E.png',
    'SUB19E.png',
    'SUB20E.png',
    'SUB21E.png',
    'SUB22E.png',
    'SUB23E.png',
    'SUB24EB.png',
    'SUB25E.png',
    'SUB26E.png',
    't.png'
];

document.getElementById('addTodo').addEventListener('click', addNewItem);
document.getElementById('newTodo').addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {  // 13 is the keyCode for Enter key
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

    // Make the item draggable
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
    chrome.storage.sync.set({ todos: todos });
}

function loadTodos() {
    chrome.storage.sync.get('todos', function(data) {
        var todos = data.todos || [];
        for (var i = 0; i < todos.length; i++) {
            addItem(todos[i].text, todos[i].checked);
        }
    });
}

// Drag and Drop Functions
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // required for Firefox
}

function handleDragOver(e) {
    if (draggedItem === this) return; // if the item is dragged over itself, do nothing

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    if (draggedItem === this) return; // if the item is dropped onto itself, do nothing

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

// Context menu code
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

    // Clear existing entries:
    monthDays.innerHTML = '';

    // Populate month name:
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    currentMonthDiv.innerText = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;

    // Get start day of the month:
    let day = firstDay.getDay();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysHeaderRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.innerText = day;
        daysHeaderRow.appendChild(dayHeader);
    });
    monthDays.appendChild(daysHeaderRow);
    
    // Generate days:
    let weekRow = document.createElement('tr');
    for (let i = 0; i < day; i++) {  // Fill in the blanks before the first day
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

    monthDays.appendChild(weekRow);  // Append the last week
}

document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    populateCalendar(currentMonth);
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    populateCalendar(currentMonth);
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === "sync" && changes.todos) {
        // Clear existing items
        document.getElementById('todoList').innerHTML = '';
        // Load updated items
        loadTodos();
    }
});

populateCalendar(currentMonth);
loadTodos();
loadImage();
