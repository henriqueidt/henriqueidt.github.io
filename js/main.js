let db = null;
let todoListEl;
let categorySelectorEl;
let checkBoxEl;
let modalEl;
let colorInputEl;
let colorNameInputEl;

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

function requstNotificationsPermission() {
  Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
});

  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function(reg) {
      reg.showNotification('Hello world!');
    });
  }
}

function openIndexedDB() {
  let openRequest = indexedDB.open('store', 11);

  openRequest.onupgradeneeded = () => {
	db = openRequest.result;
	db.objectStoreNames.contains('todo') || db.createObjectStore('todo', {
		keyPath: 'id',
		autoIncrement: true
	})
	db.objectStoreNames.contains('categories') || db.createObjectStore('categories', {
		keyPath: 'id',
		autoIncrement: true
	})
  }

  openRequest.onerror = () => {
    console.error('Error', openRequest.error);
  };

  openRequest.onsuccess = () => {
    db = openRequest.result
	readTasksFromDatabase();
	readCategoriesFromDatabase();
  };
}

function readTasksFromDatabase() {
  const transaction = db.transaction('todo', 'readonly');
  const todoList = transaction.objectStore('todo');
  const request = todoList.openCursor();

  request.onsuccess = e => {
    const cursor = e.target.result;

    if(cursor) {
      createHtmlTask(cursor.value.name, cursor.value.id, cursor.value.color)
      cursor.continue();
    }
  }
}

function readCategoriesFromDatabase() {
	const transaction = db.transaction('categories', 'readonly');
  const dbCategoryList = transaction.objectStore('categories');
  const request = dbCategoryList.openCursor();

  request.onsuccess = e => {
    const cursor = e.target.result;

    if(cursor) {
		  createHtmlOption(cursor.value)
      cursor.continue();
    }
  }
}

function addTaskToDatabase(task) {
  const transaction = db.transaction('todo', 'readwrite');
  transaction.onerror = e => console.log(`Error: ${e.target.error}`)

  const color = categorySelectorEl.dataset.value

  const todoList = transaction.objectStore('todo');
  const request = todoList.add({
    name: task,
    color
  })

  request.onsuccess = e => {
    const taskId = e.target.result
    createHtmlTask(task, taskId, color);
  }
}

function removeTaskFromDatabase(id) {
  const transaction = db.transaction('todo', 'readwrite');

  transaction.onerror = e => console.log(`Error: ${e.target.error}`)

  const todoList = transaction.objectStore('todo');
  todoList.delete(parseInt(id))
}

function createHtmlTask(text, id, color) {
  const html = `
    <li data-id=${id} style="background-color: ${color}">
      <span>${text}</span>
      <button class="delete-button js-delete-button">
        <img class="delete-image" src="./assets/trash-can.svg" alt="">
      </button>
    </li>
  `
  todoListEl.insertAdjacentHTML('beforeend', html)
}

function addTask(taskInputEl) {
  const inputText = taskInputEl.value
  if(inputText) {
    addTaskToDatabase(inputText);
    taskInputEl.value = ''
  }
}

function deleteNode(node) {
  removeTaskFromDatabase(node.dataset.id)
  node.classList.add('removed-item')
  setTimeout(() => node.parentNode.removeChild(node), 900);
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

function createHtmlOption(option, isNew = false) {
	const html = `
		<option data-value=${option.value} value=${option.id}>${option.name}</option>
	`
	categorySelectorEl.insertAdjacentHTML('beforeend', html);

	if(isNew) {
		categorySelectorEl.value = option.id
		categorySelectorEl.dataset.value = option.value
	}
}

function openModal() {
	modalEl.style.display = 'block'
}

function closeModal() {
	modalEl.style.display = 'none'
}

function handleSelectChange(e) {
	const { value } = e.target;
	if(value === "new") {
		openModal()
	}
}

function createCategory() {
	const colorName = colorNameInputEl.value;
	const colorValue = colorInputEl.value;
	addCategoryToDatabase({ colorName, colorValue });
	closeModal()
}

function addCategoryToDatabase({ colorName, colorValue }) {
	const transaction = db.transaction('categories', 'readwrite');

	transaction.onerror = e => console.log(`Error: ${e.target.error}`)

	const todoList = transaction.objectStore('categories');
	const request = todoList.add({
	  name: colorName,
	  value: colorValue
	})

	request.onsuccess = e => {
		const id = e.target.result
	  	createHtmlOption({ value: colorValue, name: colorName, id }, true);
	}
  }

document.addEventListener("DOMContentLoaded", function(event) {
	startServiceWorkers();
	// requstNotificationsPermission()

	openIndexedDB();

	const taskInputEl = document.querySelector('.js-task-input');
	const addButtonEl = document.querySelector('.js-add-button');
	categorySelectorEl = document.querySelector('.js-category-select');
	modalEl = document.querySelector('.js-modal');
	const modalBackdropEl = document.querySelector('.js-modal-backdrop');
	const modalCloseBtnEl = document.querySelector('.close-btn');
	colorNameInputEl = document.querySelector('#category-name-input');
	colorInputEl = document.querySelector('#category-color-input');
	todoListEl = document.querySelector('.js-todo-list');
	checkBoxEl = document.querySelector('#market');
	const createCategoryBtnEl = document.querySelector('.js-create-category-btn');

	addButtonEl.addEventListener('click', () => addTask(taskInputEl));
	todoListEl.addEventListener('click', handleListClick);
	taskInputEl.addEventListener('keyup', handleInputKey);
	modalBackdropEl.addEventListener('click', closeModal)
	modalCloseBtnEl.addEventListener('click', closeModal)
	categorySelectorEl.addEventListener('change', handleSelectChange)
	createCategoryBtnEl.addEventListener('click', createCategory);
})
