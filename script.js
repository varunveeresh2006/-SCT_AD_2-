// TodoList App JavaScript

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.init();
    }

    init() {
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    // Load todos from localStorage
    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos).map(todo => ({
                ...todo,
                createdAt: new Date(todo.createdAt)
            }));
        }
    }

    // Save todos to localStorage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Bind event listeners
    bindEvents() {
        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        // Add todo events
        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // Filter events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Download
        downloadBtn.addEventListener('click', () => this.downloadTodos());
    }

    // Add new todo
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text !== '') {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date()
            };
            
            this.todos.push(todo);
            input.value = '';
            this.saveTodos();
            this.render();
        }
    }

    // Delete todo
    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.render();
            }, 200);
        }
    }

    // Toggle todo completion
    toggleComplete(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    // Start editing todo
    startEditing(id, text) {
        this.editingId = id;
        this.render();
        
        // Focus on the edit input
        setTimeout(() => {
            const editInput = document.querySelector('.todo-edit-input');
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }, 0);
    }

    // Save edit
    saveEdit() {
        const editInput = document.querySelector('.todo-edit-input');
        const newText = editInput.value.trim();
        
        if (newText !== '') {
            this.todos = this.todos.map(todo =>
                todo.id === this.editingId ? { ...todo, text: newText } : todo
            );
            this.saveTodos();
        }
        
        this.editingId = null;
        this.render();
    }

    // Cancel edit
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    // Clear completed todos
    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    // Download todos as JSON
    downloadTodos() {
        const todoData = {
            todos: this.todos,
            exportDate: new Date().toISOString(),
            totalCount: this.todos.length,
            completedCount: this.getCompletedCount(),
            activeCount: this.getActiveCount()
        };
        
        const dataStr = JSON.stringify(todoData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Get filtered todos
    getFilteredTodos() {
        return this.todos.filter(todo => {
            if (this.currentFilter === 'active') return !todo.completed;
            if (this.currentFilter === 'completed') return todo.completed;
            return true;
        });
    }

    // Get counts
    getCompletedCount() {
        return this.todos.filter(todo => todo.completed).length;
    }

    getActiveCount() {
        return this.todos.length - this.getCompletedCount();
    }

    // Create todo item HTML
    createTodoHTML(todo) {
        const isEditing = this.editingId === todo.id;
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-content">
                    <button class="complete-btn ${todo.completed ? 'completed' : ''}" onclick="app.toggleComplete(${todo.id})">
                        ${todo.completed ? '<span class="check-icon">✓</span>' : ''}
                    </button>
                    
                    ${isEditing ? `
                        <input 
                            type="text" 
                            class="todo-edit-input" 
                            value="${todo.text}"
                            onkeypress="app.handleEditKeyPress(event)"
                            onblur="app.saveEdit()"
                        >
                    ` : `
                        <span 
                            class="todo-text ${todo.completed ? 'completed' : ''}"
                            ondblclick="app.startEditing(${todo.id}, '${todo.text.replace(/'/g, "\\'")}')"
                        >
                            ${todo.text}
                        </span>
                    `}
                    
                    <div class="todo-actions">
                        ${isEditing ? `
                            <button class="action-btn save-btn" onclick="app.saveEdit()" title="Save">
                                ✓
                            </button>
                            <button class="action-btn cancel-btn" onclick="app.cancelEdit()" title="Cancel">
                                ✕
                            </button>
                        ` : `
                            <button class="action-btn edit-btn" onclick="app.startEditing(${todo.id}, '${todo.text.replace(/'/g, "\\'")}')" title="Edit">
                                ✎
                            </button>
                            <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete">
                                🗑
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // Handle edit input key press
    handleEditKeyPress(event) {
        if (event.key === 'Enter') {
            this.saveEdit();
        } else if (event.key === 'Escape') {
            this.cancelEdit();
        }
    }

    // Update counts in UI
    updateCounts() {
        const completedCount = this.getCompletedCount();
        const activeCount = this.getActiveCount();
        const totalCount = this.todos.length;

        document.getElementById('allCount').textContent = totalCount;
        document.getElementById('activeCount').textContent = activeCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('activeFooterCount').textContent = activeCount;
        document.getElementById('completedFooterCount').textContent = completedCount;
    }

    // Show/hide action buttons
    updateActionButtons() {
        const clearBtn = document.getElementById('clearCompletedBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const footerStats = document.getElementById('footerStats');
        
        const hasCompleted = this.getCompletedCount() > 0;
        const hasTodos = this.todos.length > 0;
        
        clearBtn.style.display = hasCompleted ? 'block' : 'none';
        downloadBtn.style.display = hasTodos ? 'flex' : 'none';
        footerStats.style.display = hasTodos ? 'block' : 'none';
    }

    // Main render function
    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        // Update counts
        this.updateCounts();
        
        // Update action buttons visibility
        this.updateActionButtons();

        // Show/hide empty state
        if (filteredTodos.length === 0) {
            todoList.style.display = 'none';
            emptyState.style.display = 'block';
            
            // Update empty message based on filter
            const emptyMessage = document.querySelector('.empty-message');
            if (this.currentFilter === 'all') {
                emptyMessage.textContent = 'No todos yet. Add one above!';
            } else {
                emptyMessage.textContent = `No ${this.currentFilter} todos`;
            }
        } else {
            todoList.style.display = 'flex';
            emptyState.style.display = 'none';
            
            // Render todos
            todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});