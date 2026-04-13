export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  CreateTask: undefined;
  TaskDetail: { taskId: string; taskType: 'habit' | 'todo' };
  SkillDetail: { skillId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Progress: undefined;
  Clan: undefined;
  Profile: undefined;
};

export type TasksStackParamList = {
  TasksList: undefined;
  HabitDetail: { habitId: string };
  TodoDetail: { todoId: string };
  AddTask: { type: 'habit' | 'todo' };
};
