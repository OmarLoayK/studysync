import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "./firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc,} from "firebase/firestore";
import { db } from "./firebase/config";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-400">StudySync</h1>

          <nav className="flex gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Log In
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-300 ring-1 ring-blue-500/20">
              Stay organized. Study smarter.
            </p>

            <h2 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              Plan your school life with{" "}
              <span className="text-blue-400">StudySync</span>
            </h2>

            <p className="mb-6 text-lg text-slate-400">
              Manage assignments, track deadlines, organize classes, and stay ahead
              with a clean and simple student dashboard.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Get Started
              </Link>

              <Link
                to="/dashboard"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-100 hover:bg-slate-800"
              >
                View Demo
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Today’s Overview</h3>
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-300 ring-1 ring-green-500/20">
                On Track
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Calculus Homework</p>
                    <p className="text-sm text-slate-400">Due tonight • Math 212</p>
                  </div>
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-300 ring-1 ring-red-500/20">
                    High
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Physics Lab Report</p>
                    <p className="text-sm text-slate-400">Due tomorrow • Physics 221</p>
                  </div>
                  <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm font-medium text-yellow-300 ring-1 ring-yellow-500/20">
                    Medium
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Computer Science Quiz Prep</p>
                    <p className="text-sm text-slate-400">Friday • CS 235</p>
                  </div>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-300 ring-1 ring-blue-500/20">
                    Planned
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-white">7</p>
                <p className="text-sm text-slate-400">Tasks</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-sm text-slate-400">Classes</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-white">86%</p>
                <p className="text-sm text-slate-400">Progress</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-2 text-lg font-semibold text-white">Track Assignments</h3>
              <p className="text-slate-400">
                Keep all homework, quizzes, projects, and exams in one place.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-2 text-lg font-semibold text-white">Organize Classes</h3>
              <p className="text-slate-400">
                Separate tasks by subject so your week stays clear and manageable.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-2 text-lg font-semibold text-white">Stay Ahead</h3>
              <p className="text-slate-400">
                See what is due soon, what is overdue, and what needs attention first.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <h1 className="mb-2 text-3xl font-bold text-slate-800">Welcome back</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-xl bg-blue-600 py-3 text-white">
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <h1 className="mb-2 text-3xl font-bold text-slate-800">Create your account</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-xl bg-blue-600 py-3 text-white">
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [proofLink, setProofLink] = useState("");
  const [completionNote, setCompletionNote] = useState("");
  const [tasks, setTasks] = useState([]);

  const handleLogout = async () => {
  await signOut(auth);
  navigate("/");
  };

  const fetchTasks = async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    const taskList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTasks(taskList);
  };
  

  const handleAddTask = async (e) => {
  e.preventDefault();

  if (!title || !course || !dueDate) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    if (editingTaskId) {
      await updateDoc(doc(db, "tasks", editingTaskId), {
        title,
        course,
        dueDate,
        priority,
        proofLink,
        completionNote,
      });
    } else {
      await addDoc(collection(db, "tasks"), {
        title,
        course,
        dueDate,
        priority,
        proofLink,
        completionNote,
        completed: false,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
    }

    setTitle("");
    setCourse("");
    setDueDate("");
    setPriority("Medium");
    setProofLink("");
    setCompletionNote("");
    setEditingTaskId(null);

    fetchTasks();
  } catch (error) {
    alert(error.message);
  }
};

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      fetchTasks();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleComplete = async (
  taskId,
  currentStatus,
  proofLink,
  completionNote
) => {
  if (!currentStatus && !proofLink.trim() && !completionNote.trim()) {
    alert("Add a proof link or a completion note before marking this task complete.");
    return;
  }

  try {
    await updateDoc(doc(db, "tasks", taskId), {
      completed: !currentStatus,
    });
    fetchTasks();
  } catch (error) {
    alert(error.message);
  }
};
const handleEditTask = (task) => {
  setTitle(task.title || "");
  setCourse(task.course || "");
  setDueDate(task.dueDate || "");
  setPriority(task.priority || "Medium");
  setProofLink(task.proofLink || "");
  setCompletionNote(task.completionNote || "");
  setEditingTaskId(task.id);
};

const handleCancelEdit = () => {
  setTitle("");
  setCourse("");
  setDueDate("");
  setPriority("Medium");
  setProofLink("");
  setCompletionNote("");
  setEditingTaskId(null);
};

  useEffect(() => {
    fetchTasks();
  }, []);

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const highPriorityTasks = tasks.filter((task) => task.priority === "High");

  const getPriorityColor = (priorityLevel) => {
    if (priorityLevel === "High") {
      return "bg-red-500/15 text-red-300 border border-red-500/30";
    }
    if (priorityLevel === "Medium") {
      return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30";
    }
    return "bg-green-500/15 text-green-300 border border-green-500/30";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-900/80 p-6 md:flex">
          <h1 className="mb-10 text-3xl font-bold text-blue-400">StudySync</h1>

          <nav className="space-y-3">
            <div className="rounded-2xl bg-blue-600/15 px-4 py-3 font-semibold text-blue-300 ring-1 ring-blue-500/20">
              Dashboard
            </div>
            <div className="rounded-2xl px-4 py-3 text-slate-400">Tasks</div>
            <div className="rounded-2xl px-4 py-3 text-slate-400">Completed</div>
            <div className="rounded-2xl px-4 py-3 text-slate-400">Priorities</div>
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Productivity Tip</p>
            <p className="mt-2 text-sm text-slate-200">
              Finish high-priority work first, then clear smaller tasks fast.
            </p>
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-block rounded-full bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-300 ring-1 ring-blue-500/20">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Your Dashboard</h2>
              <p className="mt-2 text-slate-400">
                Stay on top of assignments, deadlines, and completed work.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600 md:hidden"
            >
              Log Out
            </button>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">Total Tasks</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{tasks.length}</h3>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">Incomplete</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{incompleteTasks.length}</h3>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">Completed</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{completedTasks.length}</h3>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">High Priority</p>
              <h3 className="mt-2 text-3xl font-bold text-white">{highPriorityTasks.length}</h3>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h3 className="mb-4 text-xl font-semibold text-white">
            {editingTaskId ? "Edit Task" : "Add New Task"}
          </h3>

            <form onSubmit={handleAddTask} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              <input
                type="text"
                placeholder="Proof link (optional)"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Completion note (optional)"
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              <div className="md:col-span-2 xl:col-span-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editingTaskId ? "Update Task" : "Add Task"}
                </button>

                {editingTaskId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-2xl bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-4 text-xl font-semibold text-white">Incomplete Tasks</h3>

              {incompleteTasks.length === 0 ? (
                <p className="text-slate-500">No incomplete tasks.</p>
              ) : (
                <div className="space-y-4">
                  {incompleteTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-slate-400">Course: {task.course}</p>
                      <p className="mb-4 text-slate-400">Due: {task.dueDate}</p>
                      {task.proofLink && (
                          <p className="mt-2 text-sm text-blue-400">
                            Proof:{" "}
                            <a
                              href={task.proofLink}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-blue-300"
                            >
                              Open Link
                            </a>
                          </p>
                        )}

                        {task.completionNote && (
                          <p className="mt-2 text-sm text-slate-300">
                            Note: {task.completionNote}
                          </p>
                        )}
                      
                      {task.proofLink && (
                        <p className="mt-2 text-sm text-blue-400">
                          Proof:{" "}
                          <a
                            href={task.proofLink}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-blue-300"
                          >
                            Open Link
                          </a>
                        </p>
                      )}
                      {task.completionNote && (
                        <p className="mt-2 text-sm text-slate-300">
                          Note: {task.completionNote}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                          handleToggleComplete(
                            task.id,
                            task.completed,
                            task.proofLink || "",
                            task.completionNote || ""
                          )
                        }
                          className="rounded-2xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-2xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-4 text-xl font-semibold text-white">Completed Tasks</h3>

              {completedTasks.length === 0 ? (
                <p className="text-slate-500">No completed tasks yet.</p>
              ) : (
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-lg font-semibold text-slate-400 line-through">
                          {task.title}
                        </h4>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-slate-400">Course: {task.course}</p>
                      <p className="mb-4 text-slate-400">Due: {task.dueDate}</p>
                        {task.proofLink && (
                          <p className="mt-2 text-sm text-blue-400">
                            Proof:{" "}
                            <a
                              href={task.proofLink}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-blue-300"
                            >
                              Open Link
                            </a>
                          </p>
                        )}
                        {task.completionNote && (
                          <p className="mt-2 text-sm text-slate-300">
                            Note: {task.completionNote}
                          </p>
                        )}

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleToggleComplete(
                              task.id,
                              task.completed,
                              task.proofLink || "",
                              task.completionNote || ""
                            )
                          }
                          className={`rounded-2xl px-4 py-2 font-semibold text-white ${
                            task.proofLink || task.completionNote
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-2xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <h1 className="p-10">Loading...</h1>;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Landing />}
      />
    </Routes>
  );
}

export default App;