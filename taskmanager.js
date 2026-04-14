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
    priorityElem.className = `priority-badge ${priorityClass}`;
    priorityElem.textContent = priorityText;
    li.appendChild(priorityElem);

    const dueElem = document.createElement('span');
    dueElem.className = 'due-date';
    dueElem.textContent = taskObj.dueDate ? `Due: ${taskObj.dueDate}` : 'No due date';
    li.appendChild(dueElem);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.setAttribute('data-action', 'edit');
    li.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('data-action', 'delete');
    li.appendChild(deleteBtn);

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
}

// ========== 3. deleteTask(taskId) ==========
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

// ========== 4. editTask(taskId) ==========
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

// ========== 5. updateTask(taskId, updatedData) ==========
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
});