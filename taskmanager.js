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

const sampleTask = {
    id: 999,
    title: "Test Task",
    desc: "This is a test description",
    priority: "high",
    dueDate: "2025-12-31"
};
const card = createTaskCard(sampleTask);
console.log(card);
document.querySelector('#todo ul').appendChild(card);

addTask('todo', {
    title: "Test Add",
    desc: "Added via console",
    priority: "medium",
    dueDate: "2025-01-01"
});

deleteTask(1);