import React, { createContext, useContext, useState, useEffect } from "react";
import { dbService } from "../firebase";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("all");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Subscribe to Projects when authenticated
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoadingProjects(false);
      return;
    }

    setLoadingProjects(true);
    const unsubscribe = dbService.subscribeProjects((loadedProjects) => {
      setProjects(loadedProjects);
      setLoadingProjects(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Subscribe to Tasks based on current activeProjectId
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    const unsubscribe = dbService.subscribeTasks(activeProjectId, (loadedTasks) => {
      setTasks(loadedTasks);
      setLoadingTasks(false);
    });

    return unsubscribe;
  }, [currentUser, activeProjectId]);

  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      setLoadingActivities(false);
      return;
    }

    setLoadingActivities(true);
    const unsubscribe = dbService.subscribeActivities((loadedActivities) => {
      setActivities(loadedActivities);
      setLoadingActivities(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const selectProject = (id) => {
    setActiveProjectId(id);
  };

  const createProject = async (name, description, color) => {
    const pId = await dbService.createProject({
      name,
      description,
      color,
      ownerId: currentUser.uid
    });
    return pId;
  };

  const createTask = async (taskData) => {
    const tId = await dbService.createTask({
      ...taskData,
      creatorId: currentUser.uid,
      creatorName: currentUser.displayName || currentUser.email
    });
    return tId;
  };

  const updateTask = async (taskId, updateData) => {
    await dbService.updateTask(taskId, updateData);
  };

  const deleteTask = async (taskId) => {
    await dbService.deleteTask(taskId);
  };

  const addComment = async (taskId, content) => {
    if (!currentUser) return;
    const commentData = {
      content,
      authorName: currentUser.displayName || currentUser.email,
      authorUid: currentUser.uid
    };
    return await dbService.addComment(taskId, commentData);
  };

  const value = {
    projects,
    tasks,
    activities,
    activeProjectId,
    loadingProjects,
    loadingTasks,
    loadingActivities,
    selectProject,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    addComment
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
