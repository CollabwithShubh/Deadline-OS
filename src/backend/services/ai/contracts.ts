import { TaskPriority, TaskRisk, TaskStatus } from '../../../types';

export interface PlanResponse {
  summary: string;
  tasks: {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline: string;
    estimatedHours: number;
    subtasks: { title: string; completed: boolean }[];
    tags: string[];
    risk: TaskRisk;
    category: string;
    executionStrategy: string;
  }[];
  riskAssessment: {
    level: TaskRisk;
    description: string;
    bottlenecks: string[];
  };
  timeline: {
    phaseName: string;
    duration: string;
    tasks: string[];
  }[];
}

export interface PriorityResponse {
  prioritizedTasks: {
    taskId: string;
    priority: TaskPriority;
    urgencyScore: number; // 0 - 100
    difficultyRating: 'low' | 'medium' | 'high' | 'expert';
    justification: string;
  }[];
}

export interface ScheduleResponse {
  schedule: {
    taskId: string;
    recommendedTimeSlot: string; // e.g. "09:00 AM - 10:30 AM"
    bufferMinutes: number;
    sessionType: 'focus' | 'administrative' | 'collaboration';
    energyRequirement: 'low' | 'medium' | 'high';
  }[];
}

export interface RiskResponse {
  riskScore: number; // 0 - 100
  riskLevel: TaskRisk;
  explanation: string;
  criticalFailurePoints: string[];
  mitigationSteps: string[];
}

export interface ExecutionResponse {
  nextAction: string;
  motivation: string;
  cognitiveLoadRecommendation: string;
  microAdjustments: string[];
}

export interface RecoveryResponse {
  recoveryScore: number; // 0 - 100
  actions: {
    taskId: string;
    type: 'keep' | 'move' | 'drop' | 'focus';
    actionDescription: string;
    newDeadline?: string;
  }[];
  recoveryTimeline: {
    time: string;
    action: string;
  }[];
}

export interface AnalyticsResponse {
  patterns: string[];
  strengths: string[];
  weaknesses: string[];
  tacticalAdvice: string;
}

export interface ReflectionResponse {
  learnings: string[];
  behavioralAdjustments: string[];
  estimatedVsActualRatio: number;
}

export interface CoachResponse {
  encouragement: string;
  tacticalDirective: string;
  suggestedPaceModifier: 'accelerate' | 'maintain' | 'decelerate';
}
