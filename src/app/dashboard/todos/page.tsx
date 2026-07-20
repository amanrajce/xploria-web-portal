// src/app/dashboard/todos/page.tsx
"use client";

import { useState } from "react";
import { useTripStore, TodoItem } from "@/lib/store/useTripStore";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import clsx from "clsx";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function TodosPage() {
  const { activeTrip, getTripTodos, addTodo, toggleTodo, deleteTodo } = useTripStore();
  const [text, setText] = useState("");

  if (!activeTrip) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl p-12 max-w-md shadow-2xl">
          <p className="text-xploria-muted font-bold">Select a trip to manage your to-do list.</p>
        </div>
      </div>
    );
  }

  const todos    = getTripTodos(activeTrip.id);
  const done     = todos.filter((t) => t.done).length;
  const pct      = todos.length > 0 ? Math.round((done / todos.length) * 100) : 0;

  const handleAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!text.trim()) return;
    const todo: TodoItem = {
      id: generateId(), tripId: activeTrip.id,
      text: text.trim(), done: false, createdAt: Date.now(),
    };
    addTodo(todo);
    setText("");
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">To-do List</h1>
        <div className="flex items-center gap-2 text-xploria-muted mt-1 text-sm font-semibold">
          <span>{activeTrip.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-750 shrink-0" />
          <span>checklist</span>
        </div>
      </header>

      {/* Progress */}
      {todos.length > 0 && (
        <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between text-sm mb-3 font-bold">
            <span className="text-xploria-muted">{done} of {todos.length} completed</span>
            <span className="text-white">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-800/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-xploria-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Add */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          placeholder="Add a task (e.g., Book train tickets)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input flex-1"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-xploria-primary hover:bg-xploria-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-xploria-primary/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {/* Pending */}
      <div>
        <h3 className="text-xs font-bold text-xploria-muted uppercase tracking-wider mb-3">
          Pending ({todos.filter((t) => !t.done).length})
        </h3>
        {todos.filter((t) => !t.done).length === 0 ? (
          <p className="text-xploria-muted text-sm py-4 font-semibold">All done! Nothing pending.</p>
        ) : (
          <div className="space-y-2">
            {todos
              .filter((t) => !t.done)
              .map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {todos.filter((t) => t.done).length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-bold text-xploria-muted uppercase tracking-wider mb-3">
            Completed ({todos.filter((t) => t.done).length})
          </h3>
          <div className="space-y-2 opacity-75">
            {todos
              .filter((t) => t.done)
              .map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TodoRow({
  todo, onToggle, onDelete,
}: {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-xploria-card border border-[#24262c] rounded-xl px-4 py-3 hover:border-slate-700 transition-all duration-200 group text-left">
      <button
        onClick={onToggle}
        className={clsx(
          "transition-colors shrink-0",
          todo.done ? "text-xploria-primary" : "text-xploria-muted hover:text-xploria-primary"
        )}
      >
        {todo.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
      </button>
      <span
        className={clsx(
          "flex-1 text-sm font-semibold",
          todo.done ? "line-through text-xploria-muted" : "text-slate-200"
        )}
      >
        {todo.text}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-xploria-muted hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}