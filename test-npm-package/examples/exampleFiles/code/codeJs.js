// A simple Todo list implementation in JavaScript

class TodoList {
    constructor() {
        this.todos = [];
    }

    addTodo(text) {
        this.todos.push({
            id: Date.now(),
            text,
            completed: false
        });
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
        }
    }

    removeTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
    }

    getCompletedTodos() {
        return this.todos.filter(todo => todo.completed);
    }

    getPendingTodos() {
        return this.todos.filter(todo => !todo.completed);
    }
}

// Example usage
const todoList = new TodoList();
todoList.addTodo("Learn JavaScript");
todoList.addTodo("Build a project");
todoList.addTodo("Write documentation");

console.log("All todos:", todoList.todos);
todoList.toggleTodo(todoList.todos[0].id);
console.log("Completed todos:", todoList.getCompletedTodos());
console.log("Pending todos:", todoList.getPendingTodos()); 