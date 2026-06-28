import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  timezone: z.string().optional(),
  workHours: z.string().optional(),
  sleepTime: z.string().optional(),
  energyProfile: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  completed: z.boolean().default(false)
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  status: z.enum(['todo', 'in_progress', 'completed', 'overdue']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  deadline: z.string(), // YYYY-MM-DD or ISO
  estimatedHours: z.number().nonnegative().default(1),
  actualHours: z.number().nonnegative().default(0),
  subtasks: z.array(subtaskSchema).default([]),
  tags: z.array(z.string()).default([]),
  risk: z.enum(['low', 'medium', 'high']).default('low'),
  category: z.string().default('General'),
  executionStrategy: z.string().optional()
});

export const planRequestSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters')
});

export const recoveryRequestSchema = z.object({
  input: z.string().min(3, 'Input must be at least 3 characters')
});

export const executionStartSchema = z.object({
  taskId: z.string().optional(),
  durationMinutes: z.number().int().positive().default(25)
});

export const executionCompleteSchema = z.object({
  taskId: z.string().optional(),
  durationMinutes: z.number().int().positive().default(25),
  completed: z.boolean().default(false)
});
