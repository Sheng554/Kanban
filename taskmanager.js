let tasks = [];   
let nextId = 1;
let currentEditId = null;

function getColumnList(columnId) {
    const section = document.getElementById(columnId);
    return section ? section.querySelector('ul') : null;
}

function updateTotalTaskCounter() {
    const counterSpan = document.getElementById('taskCounter');
    if (counterSpan) counterSpan.textContent = tasks.length;
}

function closeModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.style.display = 'none';
        currentEditId = null;
        document.getElementById('modalTitle').value = '';
        document.getElementById('modalDesc').value = '';
        document.getElementById('modalPriority').value = 'medium';
        document.getElementById('modalDueDate').value = '';
    }
}

function openModalForAdd(targetColumn) {
    currentEditId = null;
    document.getElementById('modalTitle').value = '';
    document.getElementById('modalDesc').value = '';
    document.getElementById('modalPriority').value = 'medium';
    document.getElementById('modalDueDate').value = '';
    const modal = document.getElementById('taskModal');
    modal.setAttribute('data-target-column', targetColumn);
    modal.style.display = 'flex';
}

// ========== 1. createTaskCard ==========
function createTaskCard(taskObj) {
    const li = document.createElement('li');
    li.setAttribute('data-task-id', taskObj.id);
    li.className = 'task-card';

    const titleElem = document.createElement('h3');
    titleElem.className = 'task-title';
    titleElem.textContent = taskObj.title;
    li.appendChild(titleElem);

    const descElem = document.createElement('p');
    descElem.className = 'task-desc';
    descElem.textContent = taskObj.desc;
    li.appendChild(descElem);

    const rowDiv = document.createElement('div');
    rowDiv.className = 'task-row';

    const priorityElem = document.createElement('span');
    let priorityClass = '';
    let priorityText = '';
    switch (taskObj.priority) {
        case 'high':
            priorityClass = 'priority-high';
            priorityText = 'HIGH';
            break;
        case 'medium':
            priorityClass = 'priority-medium';
            priorityText = 'MEDIUM';
            break;
        case 'low':
            priorityClass = 'priority-low';
            priorityText = 'LOW';
            break;
        default:
            priorityClass = 'priority-medium';
            priorityText = 'MEDIUM';
    }
    priorityElem.classList.add('priority-badge');
    priorityElem.classList.add(priorityClass);
    priorityElem.textContent = priorityText;
    rowDiv.appendChild(priorityElem);

    const dueElem = document.createElement('span');
    dueElem.className = 'due-date';
    dueElem.textContent = taskObj.dueDate 
    ? 'Due: ' + taskObj.dueDate 
    : 'No due date';
    rowDiv.appendChild(dueElem);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.setAttribute('data-action', 'edit');
    rowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('data-action', 'delete');
    rowDiv.appendChild(deleteBtn);

    li.appendChild(rowDiv);
    return li;
}

// ========== 2. addTask ==========
function addTask(columnId, taskObj) {
    const newTask = {
        id: nextId++,
        columnId: columnId,
        title: taskObj.title,
        desc: taskObj.desc,
        priority: taskObj.priority,
        dueDate: taskObj.dueDate || ''
    };
    tasks.push(newTask);

    const listContainer = getColumnList(columnId);
    if (listContainer) {
        const card = createTaskCard(newTask);
        listContainer.appendChild(card);
    }
    updateTotalTaskCounter();
    filterTasks(); 
}

// ========== 3. deleteTask ==========
function deleteTask(taskId) {
    const card = document.querySelector(`li[data-task-id='${taskId}']`);
    if (!card) return;

    card.classList.add('fade-out');
    const onAnimationEnd = () => {
        card.removeEventListener('animationend', onAnimationEnd);
        card.remove();
        const index = tasks.findIndex(t => t.id == taskId);
        if (index !== -1) tasks.splice(index, 1);
        updateTotalTaskCounter();
    };
    card.addEventListener('animationend', onAnimationEnd);
}

// ========== 4. editTask ==========
function editTask(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;

    currentEditId = taskId;
    const modal = document.getElementById('taskModal');
    document.getElementById('modalTitle').value = task.title;
    document.getElementById('modalDesc').value = task.desc;
    document.getElementById('modalPriority').value = task.priority;
    document.getElementById('modalDueDate').value = task.dueDate || '';
    modal.style.display = 'flex';
}

// ========== 5. updateTask ==========
function updateTask(taskId, updatedData) {
    const taskIndex = tasks.findIndex(t => t.id == taskId);
    if (taskIndex === -1) return;

    const oldTask = tasks[taskIndex];
    const newTask = { ...oldTask, ...updatedData };
    tasks[taskIndex] = newTask;

    if (updatedData.columnId && updatedData.columnId !== oldTask.columnId) {
        const oldCard = document.querySelector(`li[data-task-id='${taskId}']`);
        if (oldCard) oldCard.remove();
        const newList = getColumnList(updatedData.columnId);
        if (newList) {
            const newCard = createTaskCard(newTask);
            newList.appendChild(newCard);
        }
    } else {
        const oldCard = document.querySelector(`li[data-task-id='${taskId}']`);
        if (oldCard) {
            const newCard = createTaskCard(newTask);
            oldCard.parentNode.replaceChild(newCard, oldCard);
        }
    }
    updateTotalTaskCounter();
    filterTasks(); 
}

// ========== Clear Done ==========
function clearDoneTasks() {
    const doneCards = document.querySelectorAll('#done .task-card');
    doneCards.forEach((card, index) => {
        setTimeout(() => {
            const taskId = parseInt(card.getAttribute('data-task-id'));
            deleteTask(taskId);
        }, index * 100);
    });
}

function filterTasks() {
    const priorityFilter = document.getElementById('priorityFilter');
    if (!priorityFilter) return;
    const selectedPriority = priorityFilter.value;
    const allCards = document.querySelectorAll('#board .task-card');
    allCards.forEach(card => {
        const priorityBadge = card.querySelector('.priority-badge');
        let cardPriority = '';
        if (priorityBadge) {
            const badgeText = priorityBadge.textContent;
            if (badgeText === 'HIGH') cardPriority = 'high';
            else if (badgeText === 'MEDIUM') cardPriority = 'medium';
            else if (badgeText === 'LOW') cardPriority = 'low';
        }
        if (selectedPriority === 'all' || cardPriority === selectedPriority) {
            card.classList.remove('is-hidden');
        } else {
            card.classList.add('is-hidden');
        }
    });
}

function initMockData() {
    if (tasks.length > 0) return;

    // To Do column - 3 tasks
    addTask('todo', {
        title: '📖 Learn Event Delegation',
        desc: 'Understand event bubbling & capturing, implement unified Edit/Delete listener in Kanban',
        priority: 'high',
        dueDate: '2026-04-20'
    });
    addTask('todo', {
        title: '🧩 Implement Inline Editing',
        desc: 'Double-click task title to turn into input field, save on Enter/blur',
        priority: 'high',
        dueDate: '2026-04-19'
    });
    addTask('todo', {
        title: '📦 Create Task Card with DOM',
        desc: 'Build card using createElement, no innerHTML',
        priority: 'low',
        dueDate: '2026-04-25'
    });

    // In Progress column - 1 tasks
    addTask('inprogress', {
        title: '🗑️ Staggered Delete Animation',
        desc: 'Clear Done removes each card with 100ms delay fade-out',
        priority: 'high',
        dueDate: '2026-04-16'
    });

    // Done column - 2 tasks
    addTask('done', {
        title: '✅ Build HTML Structure',
        desc: 'Three columns, modal, header with filter',
        priority: 'low',
        dueDate: '2026-04-10'
    });
    addTask('done', {
        title: '✅ Style & Responsive',
        desc: 'Flexbox layout, mobile friendly, smooth transitions',
        priority: 'low',
        dueDate: '2026-04-14'
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const allLists = document.querySelectorAll('#board ul');
    allLists.forEach(ul => {
        ul.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            const card = e.target.closest('li');
            if (!card) return;
            const taskId = parseInt(card.getAttribute('data-task-id'));
            if (action === 'edit') editTask(taskId);
            else if (action === 'delete') deleteTask(taskId);
        });

        ul.addEventListener('dblclick', (e) => {
            const titleElem = e.target.closest('.task-title');
            if (!titleElem) return;
            const card = titleElem.closest('li');
            const taskId = parseInt(card.getAttribute('data-task-id'));
            const currentTitle = titleElem.textContent;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentTitle;
            input.className = 'task-title-input';
            
            titleElem.replaceWith(input);
            input.focus();
            
            const saveTitle = () => {
                const newTitle = input.value.trim();
                if (newTitle && newTitle !== currentTitle) {
                    updateTask(taskId, { title: newTitle });
                } else if (!newTitle) {
                    const newH3 = document.createElement('h3');
                    newH3.className = 'task-title';
                    newH3.textContent = currentTitle;
                    input.replaceWith(newH3);
                    return;
                }
                const newH3 = document.createElement('h3');
                newH3.className = 'task-title';
                newH3.textContent = newTitle || currentTitle;
                input.replaceWith(newH3);
            };
            
            input.addEventListener('blur', saveTitle);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                }
            });
        });
    });

    const addButtons = document.querySelectorAll('.add-task-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('section');
            const columnId = section ? section.id : 'todo';
            openModalForAdd(columnId);
        });
    });

    const saveBtn = document.getElementById('saveTaskBtn');
    saveBtn.addEventListener('click', () => {
        const title = document.getElementById('modalTitle').value.trim();
        const desc = document.getElementById('modalDesc').value.trim();
        const priority = document.getElementById('modalPriority').value;
        const dueDate = document.getElementById('modalDueDate').value;
        if (!title) return alert('Please enter a task title');
        if (currentEditId !== null) {
            updateTask(currentEditId, { title, desc, priority, dueDate });
        } else {
            const targetColumn = document.getElementById('taskModal').getAttribute('data-target-column') || 'todo';
            addTask(targetColumn, { title, desc, priority, dueDate });
        }
        closeModal();
    });

    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    const modal = document.getElementById('taskModal');
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterTasks);
    }

    const clearDoneBtn = document.getElementById('clearDoneBtn');
    if (clearDoneBtn) {
        clearDoneBtn.addEventListener('click', clearDoneTasks);
    }

    initMockData();
});