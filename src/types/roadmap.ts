export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'doc';
  provider: string; // e.g., 'freeCodeCamp', 'MDN', 'MIT OCW', 'NeetCode', 'Fireship'
  durationOrReadTime?: string; // e.g., '14 mins', '45 min lecture'
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[]; // parent topic ids
  resources: RoadmapResource[];
  status?: TopicStatus;
  completedAt?: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  description: string;
  topics: RoadmapTopic[];
}

export interface RoadmapTrack {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  estimatedWeeks: number;
  totalTopics: number;
  phases: RoadmapPhase[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface CustomRoadmapRequest {
  targetGoal: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  weeklyHours: number;
  targetWeeks: number;
  additionalContext?: string;
}
