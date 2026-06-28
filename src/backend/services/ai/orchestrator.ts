import { buildAIContext } from './contextEngine';
import { 
  plannerAgent, 
  priorityAgent, 
  scheduleAgent, 
  riskAgent, 
  executionAgent, 
  recoveryAgent, 
  analyticsAgent, 
  reflectionAgent, 
  memoryAgent, 
  coachAgent,
  quickAddAgent
} from './agents';
import { 
  createPlanInDB, 
  createNotificationInDB, 
  updateTaskInDB 
} from '../dbService';

export interface OrchestrationRequest {
  userId: string;
  email: string;
  requestType: 'plan' | 'recovery' | 'execution' | 'analytics' | 'quick-add';
  payload: any;
}

/**
 * Core AI Orchestrator of DeadlineOS.
 * Executes specific multi-agent pipelines, enforces output contracts, registers learnings,
 * and persists results to Firestore.
 */
export async function aiOrchestrator(req: OrchestrationRequest): Promise<any> {
  const { userId, email, requestType, payload } = req;
  console.log(`[AI Orchestrator] Triggered pipeline "${requestType}" for user: ${email}`);

  // 1. Build and Inject Context Engine
  const context = await buildAIContext(userId, email);

  // 2. Select Agents and execute corresponding pipeline chains
  switch (requestType) {
    case 'plan': {
      // Pipeline: Understand -> Prioritize -> Schedule -> Risk -> Memory -> Save
      const prompt = payload.prompt || 'Execute generic sprint';

      // Call Planner Agent to deconstruct raw goal
      const basePlan = await plannerAgent(prompt, context);

      // Create a temporary context containing these new proposed tasks for priority + schedule + risk analysis
      const proposedContext = {
        ...context,
        tasks: basePlan.tasks.map((t, idx) => ({
          id: `proposed-${idx}`,
          ...t,
          subtasksCount: t.subtasks?.length || 0,
          completedSubtasksCount: 0
        }))
      };

      // Run parallel assessments on proposed roadmap
      const [priorities, schedules, risks] = await Promise.all([
        priorityAgent(proposedContext),
        scheduleAgent(proposedContext),
        riskAgent(proposedContext)
      ]);

      // Enrich proposed tasks with Agentic results
      const enrichedTasks = basePlan.tasks.map((t, idx) => {
        const matchingPriority = priorities?.prioritizedTasks?.find(p => p.taskId === `proposed-${idx}`);
        const matchingSchedule = schedules?.schedule?.find(s => s.taskId === `proposed-${idx}`);
        
        return {
          ...t,
          priority: matchingPriority?.priority || t.priority,
          executionStrategy: `${t.executionStrategy || ''} Recommended Slot: ${matchingSchedule?.recommendedTimeSlot || 'Morning block'}. Buffer: ${matchingSchedule?.bufferMinutes || 15}m.`
        };
      });

      const finalPlan = {
        prompt,
        summary: basePlan.summary,
        tasks: enrichedTasks,
        riskAssessment: {
          level: risks?.riskLevel || basePlan.riskAssessment?.level || 'low',
          description: risks?.explanation || basePlan.riskAssessment?.description || '',
          bottlenecks: risks?.criticalFailurePoints || basePlan.riskAssessment?.bottlenecks || []
        },
        timeline: basePlan.timeline,
        isApproved: false
      };

      // Store plan inside DB
      const savedPlan = await createPlanInDB(userId, finalPlan);

      // Extract memories/patterns from the goal prompt
      await memoryAgent(userId, context, `Goal Prompt: "${prompt}" - extracted milestones: ${finalPlan.tasks.map(t => t.title).join(', ')}`);

      // Queue system notification
      await createNotificationInDB(userId, {
        title: 'Roadmap Compiled',
        desc: `Orchestrator successfully compiled "${prompt}" with ${finalPlan.tasks.length} optimized vectors.`,
        type: 'success',
        read: false,
        time: 'Just now'
      });

      return { success: true, plan: savedPlan };
    }

    case 'recovery': {
      // Pipeline: Missed Tasks -> Triage (RecoveryAgent) -> Motivation (CoachAgent) -> Notification -> Save
      const inputSignal = payload.input || 'Help, I got stuck and lost momentum.';

      // Call Recovery Agent to deconstruct backlog and map Keep/Move/Drop/Focus
      const rescuePlan = await recoveryAgent(inputSignal, context);

      // Call Coach Agent to append direct encouragement and tactical modifier
      const coachAdvice = await coachAgent(context, rescuePlan.recoveryScore);

      const finalRescue = {
        ...rescuePlan,
        coachAdvice: {
          encouragement: coachAdvice.encouragement,
          directive: coachAdvice.tacticalDirective,
          paceModifier: coachAdvice.suggestedPaceModifier
        }
      };

      // Extract new memory pattern regarding what caused this backlog
      await memoryAgent(userId, context, `Backlog issue: "${inputSignal}". User reported blockage. Score dropped.`);

      // Trigger automatic task status adjustments for Move & Drop on backend if requested
      // We can let user approve first, or auto-apply. For MNC experience, we return the plan.

      return { success: true, rescuePlan: finalRescue };
    }

    case 'execution': {
      // Pipeline: Focus Mode Active -> ExecutionAgent (Action + Load recommendation) -> CoachAgent -> Return
      const taskId = payload.taskId;
      
      const [execDirectives, coachDirectives] = await Promise.all([
        executionAgent(taskId, context),
        coachAgent(context, context.tasks.length > 0 ? 80 : 100)
      ]);

      return {
        success: true,
        directives: {
          nextAction: execDirectives.nextAction,
          motivation: execDirectives.motivation,
          cognitiveLoad: execDirectives.cognitiveLoadRecommendation,
          microAdjustments: execDirectives.microAdjustments,
          coachBrief: coachDirectives.encouragement,
          paceModifier: coachDirectives.suggestedPaceModifier
        }
      };
    }

    case 'analytics': {
      // Pipeline: History -> AnalyticsAgent -> ReflectionAgent -> Return
      const [analytics, reflection] = await Promise.all([
        analyticsAgent(context),
        reflectionAgent(context)
      ]);

      return {
        success: true,
        analytics: {
          patterns: analytics.patterns,
          strengths: analytics.strengths,
          weaknesses: analytics.weaknesses,
          advice: analytics.tacticalAdvice
        },
        reflection: {
          learnings: reflection.learnings,
          adjustments: reflection.behavioralAdjustments,
          estimatedVsActualRatio: reflection.estimatedVsActualRatio
        }
      };
    }

    case 'quick-add': {
      const prompt = payload.prompt || '';
      const parsedTask = await quickAddAgent(prompt, context);

      // Create a notification about the smart task creation
      await createNotificationInDB(userId, {
        title: 'Smart Task Extracted',
        desc: `"${parsedTask.title}" compiled dynamically from natural language input.`,
        type: 'info',
        read: false,
        time: 'Just now'
      });

      // Save memory of this task
      await memoryAgent(userId, context, `Added task "${parsedTask.title}" of category ${parsedTask.category} and priority ${parsedTask.priority}`);

      return {
        success: true,
        task: parsedTask
      };
    }

    default:
      throw new Error(`Orchestration Request type "${requestType}" is unsupported.`);
  }
}
