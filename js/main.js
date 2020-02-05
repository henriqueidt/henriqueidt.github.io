let db = null;
let todoListEl;
let checkBoxEl;

function startServiceWorkers() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('../sw_cached_page.js')
        .then(reg => console.log('service worker registered'))
        .catch(err => console.log(error))
    })
  }
}

function openIndexedDB() {
  let openRequest = indexedDB.open('store');

  openRequest.onupgradeneeded = () => {
    db = openRequest.result;
    db.createObjectStore('todo', {keyPath: 'id', autoIncrement: true});
  }

  openRequest.onerror = () => {
    console.error("Error", openRequest.error);
  };
  
  openRequest.onsuccess = () => {
    db = openRequest.result
    readTasksFromDatabase();
  };
}

function readTasksFromDatabase() {
  const transaction = db.transaction('todo', 'readonly');
  const todoList = transaction.objectStore('todo');
  const request = todoList.openCursor();

  request.onsuccess = e => {
    const cursor = e.target.result;

    if(cursor) {
      createHtmlTask(cursor.value.name, cursor.value.id, cursor.value.market)
      cursor.continue();
    }
  }

}

function addTaskToDatabase(task) {
  const transaction = db.transaction('todo', 'readwrite');

  transaction.onerror = e => console.log(`Error: ${e.target.error}`)

  const todoList = transaction.objectStore('todo');
  const request = todoList.add({
    name: task,
    market: checkBoxEl.checked
  })

  request.onsuccess = e => {
    const taskId = e.target.result
    createHtmlTask(task, taskId);
    a = e.target.result
  }
}

function removeTaskFromDatabase(id) {
  const transaction = db.transaction('todo', 'readwrite');

  transaction.onerror = e => console.log(`Error: ${e.target.error}`)

  const todoList = transaction.objectStore('todo');
  todoList.delete(parseInt(id))
}

function createHtmlTask(text, id, isMarket = false) {
  const html = `
    <li data-id=${id} data-market=${isMarket || checkBoxEl.checked}>
      <span>${text}</span>
      <button class="delete-button js-delete-button">
        <img class="delete" src="./trash-can.svg" alt="">
      </button>
    </li>
  `
  todoListEl.insertAdjacentHTML('beforeend', html)
}

function addTask(taskInputEl) {
  const inputText = taskInputEl.value
  addTaskToDatabase(inputText);
  taskInputEl.value = ''
}

function deleteNode(node) {
  removeTaskFromDatabase(node.dataset.id)
  node.parentNode.removeChild(node);
}

function handleListClick(event) {
  if(event.target.className.indexOf('delete') >= 0) {
    deleteNode(event.target.closest('li'));
  }
}

function handleInputKey(event) {
  if(event.key === 'Enter') {
    addTask(event.target)
    event.target.value = ''
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  startServiceWorkers();

  openIndexedDB();

  const taskInputEl = document.querySelector('.js-task-input');
  const addButtonEl = document.querySelector('.js-add-button');
  todoListEl = document.querySelector('.js-todo-list');
  checkBoxEl = document.querySelector('#market');

  addButtonEl.addEventListener('click', event => addTask(taskInputEl));
  todoListEl.addEventListener('click', handleListClick);
  taskInputEl.addEventListener('keyup', handleInputKey);
  
  
})