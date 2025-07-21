const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");
const addBtn = document.getElementById("add-task-btn");
const container = document.getElementById("todo-container");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");

let todos = []; // All todos from API
let currentPage = 1; // Which page we are on
const todosPerPage = 10; // Show only 10 per page

// Fetch and load todos from dummy API
async function fetchTodos() {
  try {
    // 👉 Show loading state
    container.innerHTML =
      "<p class='text-center text-gray-500'>Loading tasks...</p>";

    const response = await fetch("https://dummyjson.com/todos");
    const data = await response.json();
    todos = data.todos;
    renderTodos();
  } catch (error) {
    console.error("Error fetching todos:", error);
    container.innerHTML = "<p class='text-red-500'>Failed to load todos.</p>";
  }
}

// Render todos with pagination
function renderTodos(todoArray = todos) {
  container.innerHTML = "";

  const startIndex = (currentPage - 1) * todosPerPage;
  const endIndex = startIndex + todosPerPage;

  const reversedTodos = [...todoArray].reverse(); // Reverse the Area and store into new variable.
  const paginatedTodos = reversedTodos.slice(startIndex, endIndex);

  paginatedTodos.forEach((todo) => {
    const todoItem = document.createElement("div");
    todoItem.className =
      "bg-white shadow p-4 rounded flex justify-between items-center mb-2";

    todoItem.innerHTML = `
      <div class="flex items-center gap-2">
        <input type="checkbox" ${todo.completed ? "checked" : ""} data-id="${
      todo.id
    }" />
        <span class="todo-text ${
          todo.completed ? "line-through text-gray-500" : ""
        }">${todo.todo}</span>
        <small class="text-sm text-gray-400 block">
          ${
            todo.createdAt && !isNaN(new Date(todo.createdAt))
              ? new Date(todo.createdAt).toLocaleDateString()
              : "No Date"
          }
        </small>
      </div>
    `;

    container.appendChild(todoItem);
  });

  // Checkbox logic
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const todoId = e.target.dataset.id;
      const isCompleted = e.target.checked;

      try {
        const res = await fetch(`https://dummyjson.com/todos/${todoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: isCompleted }),
        });

        const updatedTodo = await res.json();
        const index = todos.findIndex((t) => t.id == todoId);
        if (index !== -1) todos[index].completed = isCompleted;

        renderTodos(todoArray); // Re-render with same filtered list
      } catch (err) {
        alert("Error updating checkbox:", err);
      }
    });
  });

  renderPagination();
}

// Show page buttons
function renderPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(todos.length / todosPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.className = `px-3 py-1 mx-1 border rounded ${
      i === currentPage ? "bg-blue-500 text-white" : "bg-white text-black"
    }`;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTodos();
    });
    paginationContainer.appendChild(btn);
  }
}

// Add new todo task
addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title || !description) {
    alert("Please fill both Title and Description");
    return;
  }

  const newTask = {
    todo: `${title} - ${description}`, // merged with " - "
    completed: false,
    userId: 5,
    createdAt: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }),
  };

  try {
    const res = await fetch("https://dummyjson.com/todos/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    console.log(newTask);

    const data = await res.json();
    todos.push({ ...data, createdAt: newTask.createdAt }); // New at top
    titleInput.value = "";
    descInput.value = "";
    searchInput.value = "";
    dateFromInput.value = "";
    dateToInput.value = "";
    currentPage = 1;

    // Re-render the pagination.
    hidePaginationIfFilterActive();
    renderTodos();
  } catch (error) {
    alert("Error adding task!");
  }
});

// Search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  dateFromInput.value = "";
  dateToInput.value = "";

  if (!query) {
    renderTodos(); // reset
    hidePaginationIfFilterActive(); // Re-render pagination.
    return;
  }

  hidePaginationIfFilterActive(); // Hide pagination.

  const filtered = todos.filter((task) =>
    task.todo.toLowerCase().includes(query)
  );

  renderFilteredTodos(filtered);
});

// Filtering Search
function renderFilteredTodos(filteredTodos) {
  container.innerHTML = "";

  filteredTodos.forEach((todo) => {
    const todoItem = document.createElement("div");
    todoItem.className =
      "bg-white shadow p-4 rounded flex justify-between items-center mb-2";

    todoItem.innerHTML = `
      <div class="flex items-center gap-2">
        <input type="checkbox" ${todo.completed ? "checked" : ""} data-id="${
      todo.id
    }" />
        <span class="todo-text ${
          todo.completed ? "line-through text-gray-500" : ""
        }">${todo.todo}</span>
      </div>
    `;

    container.appendChild(todoItem);
  });

  // Same checkbox logic for filtered list
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const todoId = e.target.dataset.id;
      const isCompleted = e.target.checked;

      try {
        const res = await fetch(`https://dummyjson.com/todos/${todoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: isCompleted }),
        });

        const updatedTodo = await res.json();
        alert("Check box Updated");

        const index = todos.findIndex((t) => t.id == todoId);
        if (index !== -1) todos[index].completed = isCompleted;

        // Don't reset entire list, just re-filter current search
        const query = searchInput.value.trim().toLowerCase();
        const filtered = todos.filter((todo) =>
          todo.todo.toLowerCase().includes(query)
        );
        renderFilteredTodos(filtered);
      } catch (err) {
        alert("Error updating checkbox:" + err);
      }
    });
  });
}

// Function to filter todos by date range
function filterByDate() {
  const fromDateValue = dateFromInput.value;
  const toDateValue = dateToInput.value;
  searchInput.value = "";

  hidePaginationIfFilterActive(); // Hide pagination.

  if (!fromDateValue && !toDateValue) {
    renderTodos(todos);
    return;
  }

  const filteredTodos = todos.filter((todo) => {
    if (!todo.createdAt) return false;

    // Extract only the date part
    const todoDate = todo.createdAt.split(" ")[0]; // "2025-07-22"

    if (fromDateValue && toDateValue) {
      return todoDate >= fromDateValue && todoDate <= toDateValue;
    } else if (fromDateValue) {
      return todoDate >= fromDateValue;
    } else if (toDateValue) {
      return todoDate <= toDateValue;
    }

    return false;
  });

  console.log("Matched todos:", filteredTodos.length);
  renderTodos(filteredTodos);
}

// Hide pagination. If Date searching is on
function hidePaginationIfFilterActive() {
  const isSearchActive = searchInput.value.trim() !== "";
  const isDateActive = dateFromInput.value || dateToInput.value;
  document.getElementById("pagination").style.display =
    isSearchActive || isDateActive ? "none" : "flex";
}

// Initial fetch
fetchTodos();

dateFromInput.addEventListener("change", filterByDate);
dateToInput.addEventListener("change", filterByDate);
