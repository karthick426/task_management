import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDoc,
  arrayUnion
} from "firebase/firestore";

// Detect if Firebase config is provided in env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock Mode:", error);
  }
}

export const isMock = !auth || !db;

// ==========================================
// LOCAL STORAGE MOCK DATABASE IMPLEMENTATION
// ==========================================

const getLocalData = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch local storage event for real-time multi-tab sync
  window.dispatchEvent(new Event("storage"));
};

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 11)}`;

// Listeners collection for mock mode
const mockListeners = {
  auth: [],
  tasks: {},
  projects: [],
  activities: []
};

const createActivity = async ({ action, target, type = "task", user = null }) => {
  const activity = {
    action,
    target,
    type,
    user: user?.displayName || user?.email || "You",
    userId: user?.uid || null,
    createdAt: new Date().toISOString()
  };

  if (!isMock) {
    await addDoc(collection(db, "activities"), activity);
    return activity;
  }

  const activities = getLocalData("flowsync_activities", []);
  const newActivity = { id: createId("act"), ...activity };
  setLocalData("flowsync_activities", [newActivity, ...activities].slice(0, 50));
  notifyMockListeners("activities");
  return newActivity;
};

// Helper to notify mock listeners
const notifyMockListeners = (type) => {
  if (type === "auth") {
    const session = getLocalData("flowsync_session", null);
    mockListeners.auth.forEach(cb => cb(session));
  } else if (type === "projects") {
    const projects = getLocalData("flowsync_projects", []);
    mockListeners.projects.forEach(cb => cb(projects));
  } else if (type === "tasks") {
    const tasks = getLocalData("flowsync_tasks", []);
    // If projectId is specified, filter tasks for that project or return all
    Object.keys(mockListeners.tasks).forEach(pId => {
      const filtered = pId === "all" ? tasks : tasks.filter(t => t.projectId === pId);
      mockListeners.tasks[pId].forEach(cb => cb(filtered));
    });
  } else if (type === "activities") {
    const activities = getLocalData("flowsync_activities", []);
    mockListeners.activities.forEach(cb => cb(activities));
  }
};

// Add standard storage listener to sync between tabs in mock mode
if (isMock) {
  window.addEventListener("storage", () => {
    notifyMockListeners("auth");
    notifyMockListeners("projects");
    notifyMockListeners("tasks");
    notifyMockListeners("activities");
  });
}

// Initial Mock Data setup if empty
if (isMock) {
  const defaultProjects = [
    { id: "proj-1", name: "FlowSync Launch", description: "Getting FlowSync AI ready for production launch.", color: "#6366F1", createdAt: new Date().toISOString() },
    { id: "proj-2", name: "Marketing Campaign", description: "Landing page SEO and social media graphics strategy.", color: "#06B6D4", createdAt: new Date().toISOString() }
  ];
  const defaultTasks = [
    { id: "task-1", projectId: "proj-1", title: "Complete Landing Page Hero Section", description: "Design animated blobs and floating UI mock components.", status: "in-progress", priority: "high", dueDate: "2026-06-15", assignee: "You", tags: ["Design", "Frontend"], comments: [], createdAt: new Date().toISOString() },
    { id: "task-2", projectId: "proj-1", title: "Implement Multi-step Auth", description: "Add login/registration panels with glassmorphic style sheets.", status: "todo", priority: "medium", dueDate: "2026-06-18", assignee: "You", tags: ["Security", "Auth"], comments: [], createdAt: new Date().toISOString() },
    { id: "task-3", projectId: "proj-1", title: "Verify real-time Firestore sync", description: "Attach snapshot listeners and test dragging sync across tabs.", status: "backlog", priority: "low", dueDate: "2026-06-25", assignee: "You", tags: ["Database"], comments: [], createdAt: new Date().toISOString() },
    { id: "task-4", projectId: "proj-1", title: "Configure tailwind config palette", description: "Merge dark theme palette with rounded corners (20px).", status: "completed", priority: "high", dueDate: "2026-06-10", assignee: "You", tags: ["Design"], comments: [], createdAt: new Date().toISOString() }
  ];
  const defaultActivities = [
    { id: "act-1", user: "You", action: "created a new task", target: "Complete Landing Page Hero Section", type: "task", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "act-2", user: "You", action: "completed a task", target: "Configure tailwind config palette", type: "task", createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: "act-3", user: "You", action: "joined the workspace", target: "FlowSync AI", type: "system", createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  if (getLocalData("flowsync_projects").length === 0) {
    setLocalData("flowsync_projects", defaultProjects);
  }
  if (getLocalData("flowsync_tasks").length === 0) {
    setLocalData("flowsync_tasks", defaultTasks);
  }
  if (getLocalData("flowsync_activities").length === 0) {
    setLocalData("flowsync_activities", defaultActivities);
  }
}

// ==========================================
// UNIFIED FLOWSYNC DB & AUTH SERVICES
// ==========================================

export const dbService = {
  // --- AUTH SERVICES ---
  onAuthChanged: (callback) => {
    if (!isMock) {
      return onAuthStateChanged(auth, callback);
    } else {
      mockListeners.auth.push(callback);
      // Immediately call with current session
      const session = getLocalData("flowsync_session", null);
      callback(session);
      return () => {
        mockListeners.auth = mockListeners.auth.filter(cb => cb !== callback);
      };
    }
  },

  register: async (email, password, displayName) => {
    if (!isMock) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } else {
      const users = getLocalData("flowsync_users", []);
      if (users.find(u => u.email === email)) {
        throw new Error("Email already in use.");
      }
      const newUser = { uid: "user-" + Math.random().toString(36).substr(2, 9), email, displayName };
      users.push({ ...newUser, password });
      setLocalData("flowsync_users", users);
      setLocalData("flowsync_session", newUser);
      notifyMockListeners("auth");
      return newUser;
    }
  },

  login: async (email, password) => {
    if (!isMock) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      const users = getLocalData("flowsync_users", []);
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password.");
      }
      const session = { uid: user.uid, email: user.email, displayName: user.displayName };
      setLocalData("flowsync_session", session);
      notifyMockListeners("auth");
      return session;
    }
  },

  loginWithGoogle: async () => {
    if (!isMock) {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } else {
      const googleUser = {
        uid: "google-" + Math.random().toString(36).substr(2, 9),
        email: "google-dev@flowsync.ai",
        displayName: "Google Developer"
      };
      setLocalData("flowsync_session", googleUser);
      notifyMockListeners("auth");
      return googleUser;
    }
  },

  logout: async () => {
    if (!isMock) {
      await signOut(auth);
    } else {
      localStorage.removeItem("flowsync_session");
      notifyMockListeners("auth");
    }
  },

  updateUserProfile: async ({ displayName }) => {
    if (!isMock) {
      await updateProfile(auth.currentUser, { displayName });
      return { ...auth.currentUser, displayName };
    }

    const session = getLocalData("flowsync_session", null);
    if (!session) throw new Error("No active user session.");
    const updatedSession = { ...session, displayName };
    const users = getLocalData("flowsync_users", []).map(user =>
      user.uid === session.uid ? { ...user, displayName } : user
    );
    setLocalData("flowsync_users", users);
    setLocalData("flowsync_session", updatedSession);
    notifyMockListeners("auth");
    await createActivity({ action: "updated profile settings", target: displayName || session.email, type: "profile", user: updatedSession });
    return updatedSession;
  },

  updateUserPassword: async ({ oldPassword, newPassword }) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    if (!isMock) {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("No authenticated user found.");
      if (oldPassword) {
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);
      }
      await updatePassword(user, newPassword);
      return true;
    }

    const session = getLocalData("flowsync_session", null);
    if (!session) throw new Error("No active user session.");
    const users = getLocalData("flowsync_users", []);
    const index = users.findIndex(user => user.uid === session.uid);
    if (index === -1) throw new Error("User record not found.");
    if (users[index].password !== oldPassword) throw new Error("Current password is incorrect.");
    users[index] = { ...users[index], password: newPassword };
    setLocalData("flowsync_users", users);
    await createActivity({ action: "updated workspace password", target: "Security settings", type: "profile", user: session });
    return true;
  },

  // --- PROJECT SERVICES ---
  subscribeProjects: (callback) => {
    if (!isMock) {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(projects);
      });
    } else {
      mockListeners.projects.push(callback);
      callback(getLocalData("flowsync_projects", []));
      return () => {
        mockListeners.projects = mockListeners.projects.filter(cb => cb !== callback);
      };
    }
  },

  createProject: async (projectData) => {
    if (!isMock) {
      const docRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: new Date().toISOString()
      });
      await createActivity({ action: "created a project space", target: projectData.name, type: "project", user: { uid: projectData.ownerId, displayName: projectData.ownerId } });
      return docRef.id;
    } else {
      const projects = getLocalData("flowsync_projects", []);
      const newProject = {
        id: "proj-" + Math.random().toString(36).substr(2, 9),
        ...projectData,
        createdAt: new Date().toISOString()
      };
      projects.unshift(newProject);
      setLocalData("flowsync_projects", projects);
      notifyMockListeners("projects");
      await createActivity({ action: "created a project space", target: newProject.name, type: "project", user: { uid: projectData.ownerId, displayName: "You" } });
      return newProject.id;
    }
  },

  // --- TASK SERVICES ---
  subscribeTasks: (projectId, callback) => {
    if (!isMock) {
      let q;
      if (projectId === "all") {
        q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
      } else {
        q = query(
          collection(db, "tasks"), 
          where("projectId", "==", projectId), 
          orderBy("createdAt", "desc")
        );
      }
      return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
      });
    } else {
      const key = projectId || "all";
      if (!mockListeners.tasks[key]) {
        mockListeners.tasks[key] = [];
      }
      mockListeners.tasks[key].push(callback);
      
      const allTasks = getLocalData("flowsync_tasks", []);
      const filtered = key === "all" ? allTasks : allTasks.filter(t => t.projectId === key);
      callback(filtered);

      return () => {
        mockListeners.tasks[key] = mockListeners.tasks[key].filter(cb => cb !== callback);
      };
    }
  },

  createTask: async (taskData) => {
    if (!isMock) {
      const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        comments: [],
        createdAt: new Date().toISOString()
      });
      await createActivity({ action: "created a new task", target: taskData.title, type: "task", user: { uid: taskData.creatorId, displayName: taskData.creatorName } });
      return docRef.id;
    } else {
      const tasks = getLocalData("flowsync_tasks", []);
      const newTask = {
        id: createId("task"),
        ...taskData,
        comments: [],
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      setLocalData("flowsync_tasks", tasks);
      notifyMockListeners("tasks");
      await createActivity({ action: "created a new task", target: newTask.title, type: "task", user: { uid: taskData.creatorId, displayName: taskData.creatorName } });
      return newTask.id;
    }
  },

  updateTask: async (taskId, updateData) => {
    if (!isMock) {
      const docRef = doc(db, "tasks", taskId);
      const snapshot = await getDoc(docRef);
      const oldTask = snapshot.exists() ? snapshot.data() : null;
      await updateDoc(docRef, updateData);
      const target = oldTask?.title || taskId;
      const action = updateData.status && oldTask?.status !== updateData.status
        ? `moved task to ${updateData.status.replace("-", " ")}`
        : updateData.dueDate && oldTask?.dueDate !== updateData.dueDate
          ? "rescheduled a task"
          : "updated a task";
      await createActivity({ action, target, type: "task", user: { uid: oldTask?.creatorId, displayName: oldTask?.creatorName } });
    } else {
      const tasks = getLocalData("flowsync_tasks", []);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        const oldTask = tasks[index];
        tasks[index] = { ...tasks[index], ...updateData };
        setLocalData("flowsync_tasks", tasks);
        notifyMockListeners("tasks");
        const action = updateData.status && oldTask.status !== updateData.status
          ? `moved task to ${updateData.status.replace("-", " ")}`
          : updateData.dueDate && oldTask.dueDate !== updateData.dueDate
            ? "rescheduled a task"
            : "updated a task";
        await createActivity({ action, target: oldTask.title, type: "task", user: { displayName: oldTask.assignee || "You" } });
      }
    }
  },

  deleteTask: async (taskId) => {
    if (!isMock) {
      const docRef = doc(db, "tasks", taskId);
      const snapshot = await getDoc(docRef);
      const task = snapshot.exists() ? snapshot.data() : null;
      await deleteDoc(docRef);
      await createActivity({ action: "deleted a task", target: task?.title || taskId, type: "task", user: { uid: task?.creatorId, displayName: task?.creatorName } });
    } else {
      const tasks = getLocalData("flowsync_tasks", []);
      const task = tasks.find(t => t.id === taskId);
      const filtered = tasks.filter(t => t.id !== taskId);
      setLocalData("flowsync_tasks", filtered);
      notifyMockListeners("tasks");
      await createActivity({ action: "deleted a task", target: task?.title || taskId, type: "task", user: { displayName: task?.assignee || "You" } });
    }
  },

  addComment: async (taskId, commentData) => {
    const newComment = {
      id: createId("comment"),
      ...commentData,
      createdAt: new Date().toISOString()
    };
    if (!isMock) {
      const docRef = doc(db, "tasks", taskId);
      const snapshot = await getDoc(docRef);
      const task = snapshot.exists() ? snapshot.data() : null;
      await updateDoc(docRef, { comments: arrayUnion(newComment) });
      await createActivity({ action: "commented on a task", target: task?.title || taskId, type: "comment", user: { uid: commentData.authorUid, displayName: commentData.authorName } });
    } else {
      const tasks = getLocalData("flowsync_tasks", []);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        const comments = tasks[index].comments ? [...tasks[index].comments, newComment] : [newComment];
        tasks[index] = { ...tasks[index], comments };
        setLocalData("flowsync_tasks", tasks);
        notifyMockListeners("tasks");
        await createActivity({ action: "commented on a task", target: tasks[index].title, type: "comment", user: { uid: commentData.authorUid, displayName: commentData.authorName } });
      }
    }
    return newComment;
  },

  subscribeActivities: (callback) => {
    if (!isMock) {
      const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 50));
      });
    }

    mockListeners.activities.push(callback);
    callback(getLocalData("flowsync_activities", []));
    return () => {
      mockListeners.activities = mockListeners.activities.filter(cb => cb !== callback);
    };
  }
};
