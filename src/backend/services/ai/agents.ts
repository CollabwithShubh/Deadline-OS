import { callGemini } from './geminiClient';
import { AIContextBlock, formatContextForPrompt } from './contextEngine';
import { 
  PlanResponse, 
  PriorityResponse, 
  ScheduleResponse, 
  RiskResponse, 
  ExecutionResponse, 
  RecoveryResponse, 
  AnalyticsResponse, 
  ReflectionResponse, 
  CoachResponse 
} from './contracts';
import { getDb } from '../../database/firebase';
import { collection, addDoc, setDoc, doc, getDocs, query, where, limit } from 'firebase/firestore';

// =========================================================
// 1. PLANNER AGENT
// =========================================================
export async function plannerAgent(prompt: string, context: AIContextBlock): Promise<PlanResponse> {
  const systemInstruction = `You are the [plannerAgent] of DeadlineOS.
Your objective is to deconstruct a user's raw goal into a mathematically optimized execution roadmap.
You MUST output your response STRICTLY as a single JSON object. Do not include markdown code block syntax (like \`\`\`json) or any extra text.

The JSON MUST conform to this exact contract schema:
{
  "summary": "A concise, highly professional 2-3 sentence summary explaining the critical path of the compiled roadmap.",
  "tasks": [
    {
      "title": "A precise, atomic title for a milestone task.",
      "description": "Detailed, descriptive task objectives outlining concrete goals.",
      "priority": "low | medium | high | critical",
      "deadline": "YYYY-MM-DD (estimate realistic deadline)",
      "estimatedHours": 2.5,
      "subtasks": [
        { "title": "Subtask milestone 1", "completed": false }
      ],
      "tags": ["Engineering", "Security", "etc."],
      "risk": "low | medium | high",
      "category": "Engineering | Optimization | Education | Creative | Business",
      "executionStrategy": "An elegant, technical execution strategy sentence to guide focus."
    }
  ],
  "riskAssessment": {
    "level": "low | medium | high",
    "description": "Specific bottlenecks, performance risks, or integration hazards.",
    "bottlenecks": ["State definitions", "etc."]
  },
  "timeline": [
    {
      "phaseName": "Phase 1: Name of Phase",
      "duration": "Duration (e.g. 1.5 Hours)",
      "tasks": ["Task Title 1"]
    }
  ]
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

[GOAL_PROMPT]
Create a structured roadmap for: "${prompt}"
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as PlanResponse;
  } catch (error) {
    console.warn('[plannerAgent] Failed to compile AI plan. Utilizing fallback strategy:', error);
    return getPlannerFallback(prompt);
  }
}

// =========================================================
// 2. PRIORITY AGENT
// =========================================================
export async function priorityAgent(context: AIContextBlock): Promise<PriorityResponse> {
  const systemInstruction = `You are the [priorityAgent] of DeadlineOS.
Your job is to adaptively re-evaluate task priority, urgency scores, and difficulty metrics based on context.
Do NOT use rigid hardcoded rules. Analyze deadline proximity, user timezone, historic session success rates, and active backlog load.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "prioritizedTasks": [
    {
      "taskId": "ID of the task",
      "priority": "low | medium | high | critical",
      "urgencyScore": 85, // 0 - 100 based on temporal pressure and backlog density
      "difficultyRating": "low | medium | high | expert",
      "justification": "A technical, objective single-sentence explaining why this priority shift occurred."
    }
  ]
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

Analyze all active tasks in the backlog and calculate optimal priorities and urgency.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as PriorityResponse;
  } catch (error) {
    console.warn('[priorityAgent] failed. Fallback triggered.', error);
    return {
      prioritizedTasks: context.tasks.map(t => ({
        taskId: t.id,
        priority: t.priority,
        urgencyScore: t.priority === 'critical' ? 95 : t.priority === 'high' ? 80 : 50,
        difficultyRating: 'medium',
        justification: "Calculated based on default temporal deadline boundaries."
      }))
    };
  }
}

// =========================================================
// 3. SCHEDULE AGENT
// =========================================================
export async function scheduleAgent(context: AIContextBlock): Promise<ScheduleResponse> {
  const systemInstruction = `You are the [scheduleAgent] of DeadlineOS.
Your objective is to map tasks to custom daily time blocks, ensuring cognitive buffers and matching task requirements with energy levels.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "schedule": [
    {
      "taskId": "ID of the task",
      "recommendedTimeSlot": "e.g. 09:00 AM - 10:30 AM",
      "bufferMinutes": 15,
      "sessionType": "focus | administrative | collaboration",
      "energyRequirement": "low | medium | high"
    }
  ]
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

Organize the optimal daily scheduling grid.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as ScheduleResponse;
  } catch (error) {
    console.warn('[scheduleAgent] failed. Fallback triggered.', error);
    return {
      schedule: context.tasks.map((t, i) => {
        const startHr = 9 + i * 2;
        return {
          taskId: t.id,
          recommendedTimeSlot: `${startHr.toString().padStart(2, '0')}:00 AM - ${(startHr + 1).toString().padStart(2, '0')}:30 AM`,
          bufferMinutes: 15,
          sessionType: 'focus',
          energyRequirement: 'high'
        };
      })
    };
  }
}

// =========================================================
// 4. RISK AGENT
// =========================================================
export async function riskAgent(context: AIContextBlock): Promise<RiskResponse> {
  const systemInstruction = `You are the [riskAgent] of DeadlineOS.
You mathematically predict failure vectors and bottlenecks by examining current timelines, session completion ratios, and complexity.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "riskScore": 45, // 0 - 100 (high backlog + past session drops = high score)
  "riskLevel": "low | medium | high",
  "explanation": "Descriptive diagnostic explanation of operational risk profile.",
  "criticalFailurePoints": ["List of likely bottlenecks"],
  "mitigationSteps": ["Actionable protective measures"]
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

Evaluate risk and calculate failure prediction metrics.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as RiskResponse;
  } catch (error) {
    console.warn('[riskAgent] failed. Fallback triggered.', error);
    const backlogSize = context.tasks.length;
    const isHigh = backlogSize > 4;
    return {
      riskScore: backlogSize * 15,
      riskLevel: isHigh ? 'high' : 'medium',
      explanation: `Operational drift correlated to ${backlogSize} open tasks and multitasking factors.`,
      criticalFailurePoints: ["Task fragmentation", "Context switching overhead"],
      mitigationSteps: ["Trigger focus sprint blocks immediately", "Consolidate active queues"]
    };
  }
}

// =========================================================
// 5. EXECUTION AGENT
// =========================================================
export async function executionAgent(taskId: string, context: AIContextBlock): Promise<ExecutionResponse> {
  const systemInstruction = `You are the [executionAgent] of DeadlineOS.
You support focus execution periods by crafting step-by-step next actions, tactical micro-adjustments, and managing cognitive loads.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "nextAction": "The immediate atomic physical action to perform (e.g. 'Open terminal and create schema.ts')",
  "motivation": "Highly tailored tactical operational boost, avoid generic motivational quotes.",
  "cognitiveLoadRecommendation": "Recommendations to handle current complexity",
  "microAdjustments": ["List of tactical environmental adjustments"]
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const targetTask = context.tasks.find(t => t.id === taskId) || { title: 'Unknown task' };
    const userPrompt = `
[CONTEXT]
${rawContext}

[TARGET_TASK]
Task Name: ${targetTask.title}
Task ID: ${taskId}

Generate the active focus directives.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as ExecutionResponse;
  } catch (error) {
    console.warn('[executionAgent] failed. Fallback triggered.', error);
    return {
      nextAction: "Execute the immediate next subtask block or setup your local code structure.",
      motivation: "Maintain absolute silence. You are 1 focus block away from substantial progress.",
      cognitiveLoadRecommendation: "Isolate a single browser tab, turn off all background channels.",
      microAdjustments: ["Mute Slack notifications", "Activate cyberpunk focus frequency sound"]
    };
  }
}

// =========================================================
// 6. RECOVERY AGENT
// =========================================================
export async function recoveryAgent(inputSignal: string, context: AIContextBlock): Promise<RecoveryResponse> {
  const systemInstruction = `You are the [recoveryAgent] of DeadlineOS.
Your objective is to help the user recover from backlogs, blockages, or wasted days.
Audit all active tasks and map them to appropriate emergency actions: 'keep', 'move' (delay), 'drop' (backlog), or 'focus'.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "recoveryScore": 85, // estimated target efficiency score after completing recovery (0-100)
  "actions": [
    {
      "taskId": "ID of the task provided in backlog",
      "type": "keep | move | drop | focus",
      "actionDescription": "A dramatic, logical explanation of why this triage was completed."
    }
  ],
  "recoveryTimeline": [
    {
      "time": "e.g. 10:00 AM",
      "action": "Specific micro-step for recovery"
    }
  ]
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

[RESCUE_SIGNAL]
"${inputSignal}"

Deconstruct active tasks and compile a triage timeline.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as RecoveryResponse;
  } catch (error) {
    console.warn('[recoveryAgent] failed. Fallback triggered.', error);
    return getRecoveryFallback(inputSignal, context);
  }
}

// =========================================================
// 7. ANALYTICS AGENT
// =========================================================
export async function analyticsAgent(context: AIContextBlock): Promise<AnalyticsResponse> {
  const systemInstruction = `You are the [analyticsAgent] of DeadlineOS.
You analyze completion logs, focus metrics, and daily trends to isolate core user strengths and behavioral weaknesses.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "patterns": ["Isolated behavior trends"],
  "strengths": ["Strengths demonstrated in completion velocity"],
  "weaknesses": ["Vulnerable hours or distraction patterns noticed"],
  "tacticalAdvice": "Specific structural recommendations for the user profile."
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

Examine completion history and sessions to compile performance reports.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as AnalyticsResponse;
  } catch (error) {
    console.warn('[analyticsAgent] failed. Fallback triggered.', error);
    return {
      patterns: ["Velocity spikes during 09:00 AM - 11:30 AM blocks"],
      strengths: ["Strong commitment on critical tasks once started"],
      weaknesses: ["Tendency to drop administrative items on Fridays"],
      tacticalAdvice: "Schedule complex creative engineering blocks in the early mornings."
    };
  }
}

// =========================================================
// 8. REFLECTION AGENT
// =========================================================
export async function reflectionAgent(context: AIContextBlock): Promise<ReflectionResponse> {
  const systemInstruction = `You are the [reflectionAgent] of DeadlineOS.
Compare planned hours vs actual hours across completed sessions. Isolate structural drift and estimate/actual accuracy ratio.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "learnings": ["Learnings regarding estimate drift"],
  "behavioralAdjustments": ["Actionable scheduling corrections"],
  "estimatedVsActualRatio": 1.25 // e.g. 1.25 means tasks took 25% longer than planned on average
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

Reflect on operational accuracy and compare estimates to real session logging data.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as ReflectionResponse;
  } catch (error) {
    console.warn('[reflectionAgent] failed. Fallback triggered.', error);
    return {
      learnings: ["Estimated scope was on average 20% lower than implementation reality."],
      behavioralAdjustments: ["Inject automated 15-minute buffers on high-risk engineering categories."],
      estimatedVsActualRatio: 1.2
    };
  }
}

// =========================================================
// 9. MEMORY AGENT
// =========================================================
export async function memoryAgent(userId: string, context: AIContextBlock, newSignalText?: string): Promise<any> {
  const db = getDb();

  // If a new signal is provided, analyze and extract a persistent rule, saving to Firestore collections:
  // user_context, user_patterns, memory
  if (newSignalText) {
    const systemInstruction = `You are the [memoryAgent] of DeadlineOS.
Your goal is to parse user messages or session results, and extract persistent behavior patterns or preferences.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "concept": "A single consolidated learning or user preference (e.g., 'Prefers early morning focus blocks', 'Gets distracted by excessive DSA subtasks')",
  "confidence": 0.95,
  "category": "workflow | sleep | energy | category_bias"
}`;

    try {
      const resText = await callGemini(newSignalText, { systemInstruction, responseMimeType: 'application/json' });
      const memoryObj = JSON.parse(resText.trim());

      // Save to 'memory' collection in Firestore
      await addDoc(collection(db, 'memory'), {
        userId,
        concept: memoryObj.concept,
        confidence: memoryObj.confidence,
        category: memoryObj.category,
        createdAt: new Date().toISOString()
      });

      console.log('[memoryAgent] Extracted and persisted new system memory:', memoryObj.concept);
      return memoryObj;
    } catch (error) {
      console.warn('[memoryAgent] failed to parse or persist memory rule:', error);
    }
  }

  return { success: true };
}

// =========================================================
// 10. COACH AGENT
// =========================================================
export async function coachAgent(context: AIContextBlock, score: number): Promise<CoachResponse> {
  const systemInstruction = `You are the [coachAgent] of DeadlineOS.
Provide tactical operational pacing advice, tailored directly to compliance levels, active bottlenecks, and target score metrics.
Avoid cliché motivation. Be rigorous, direct, and elite.
You MUST output your response STRICTLY as a single JSON object matching this contract:
{
  "encouragement": "Rigorous, highly tailored coaching operational prompt.",
  "tacticalDirective": "Specific next move on the active board.",
  "suggestedPaceModifier": "accelerate | maintain | decelerate"
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

[CURRENT_COMPLIANCE_SCORE]
${score} / 100

Generate the coaching tactical brief.
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim()) as CoachResponse;
  } catch (error) {
    console.warn('[coachAgent] failed. Fallback triggered.', error);
    return {
      encouragement: "Operator metrics indicate stabilized momentum. Ensure active channels remain isolated.",
      tacticalDirective: "Proceed immediately into the top-priority focus block of the day.",
      suggestedPaceModifier: score < 60 ? 'accelerate' : 'maintain'
    };
  }
}

// =========================================================
// 11. QUICK ADD AGENT
// =========================================================
export async function quickAddAgent(prompt: string, context: AIContextBlock): Promise<any> {
  const systemInstruction = `You are the [quickAddAgent] of DeadlineOS.
Your objective is to parse a raw natural language task, commitment, or goal statement (e.g., "I have DSA tomorrow", "wasted my week", "I have interview prep and assignments") and deconstruct it into a mathematically optimized Task object.
You MUST output your response STRICTLY as a single JSON object. Do not include markdown code block syntax (like \`\`\`json) or any extra text.

The JSON MUST conform to this exact contract schema:
{
  "title": "Precise, elegant, atomic title for the main task",
  "description": "A comprehensive objective summarizing what needs to be done, including why it is critical.",
  "priority": "low | medium | high | critical",
  "deadline": "YYYY-MM-DD (e.g. if prompt says 'tomorrow', compute the date of tomorrow based on current date. Current date is: ${new Date().toISOString().split('T')[0]})",
  "estimatedHours": 3.5,
  "subtasks": [
    { "title": "Subtask milestone 1", "completed": false },
    { "title": "Subtask milestone 2", "completed": false },
    { "title": "Subtask milestone 3", "completed": false }
  ],
  "tags": ["LeetCode", "Prep", "etc."],
  "risk": "low | medium | high",
  "category": "Education | Engineering | Creative | Business | Optimization",
  "executionStrategy": "An elegant, technical execution strategy sentence to guide focus."
}`;

  try {
    const rawContext = formatContextForPrompt(context);
    const userPrompt = `
[CONTEXT]
${rawContext}

[RAW_INPUT]
"${prompt}"
`;
    const resText = await callGemini(userPrompt, { systemInstruction, responseMimeType: 'application/json' });
    return JSON.parse(resText.trim());
  } catch (error) {
    console.warn('[quickAddAgent] failed. Fallback triggered.', error);
    const isDsa = prompt.toLowerCase().includes('dsa') || prompt.toLowerCase().includes('algorithm') || prompt.toLowerCase().includes('leetcode');
    const isStripe = prompt.toLowerCase().includes('stripe') || prompt.toLowerCase().includes('billing') || prompt.toLowerCase().includes('payment');

    if (isDsa) {
      return {
        title: "DSA High-Priority Practice Session",
        description: "Deconstructed DSA dynamic programming and recursion targets.",
        priority: "high",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 3.0,
        subtasks: [
          { title: "Review Graph Algorithmic theory", completed: false },
          { title: "Solve 2 topological sorting problems", completed: false },
          { title: "Optimize recursion space complexity", completed: false }
        ],
        tags: ["Education", "DSA"],
        risk: "medium",
        category: "Education",
        executionStrategy: "Establish core recurrence formulas before jumping to code implementation."
      };
    }

    if (isStripe) {
      return {
        title: "Stripe Signature Key Auditing",
        description: "Auditing billing environments for webhook validation keys.",
        priority: "critical",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 2.0,
        subtasks: [
          { title: "Configure local Stripe CLI tunnel checks", completed: false },
          { title: "Sanitize node backend logs", completed: false }
        ],
        tags: ["Security", "Billing"],
        risk: "high",
        category: "Engineering",
        executionStrategy: "Strictly validate signatures before processing transactions."
      };
    }

    return {
      title: prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt,
      description: `AI-constructed task from raw input: "${prompt}"`,
      priority: "medium",
      deadline: new Date().toISOString().split('T')[0],
      estimatedHours: 2.0,
      subtasks: [
        { title: "Isolate main scope boundaries", completed: false },
        { title: "Deep focused study run", completed: false }
      ],
      tags: ["Sprint"],
      risk: "low",
      category: "General",
      executionStrategy: "De-clutter active workplace channels to prevent multitasking drift."
    };
  }
}

// =========================================================
// LOCAL FALLBACKS
// =========================================================
function getPlannerFallback(prompt: string): PlanResponse {
  const isDsa = prompt.toLowerCase().includes('dsa') || prompt.toLowerCase().includes('algorithm') || prompt.toLowerCase().includes('leetcode');
  const isStripe = prompt.toLowerCase().includes('stripe') || prompt.toLowerCase().includes('billing') || prompt.toLowerCase().includes('payment');

  if (isDsa) {
    return {
      summary: "Deconstructed DSA graph and dynamic programming objectives. Focusing on mastering topological sort complexities and subset sum recurrence tables.",
      tasks: [
        {
          title: "Master DSA Dynamic Programming Recurrences",
          description: "Construct bottom-up topological subproblem models for matrix-chain multiplication and edit distance.",
          priority: "high",
          deadline: new Date().toISOString().split('T')[0],
          estimatedHours: 3,
          subtasks: [
            { title: "Define optimal state transition boundaries", completed: false },
            { title: "Verify overlapping dependencies on memoization matrices", completed: false }
          ],
          tags: ["Algorithms", "Education"],
          risk: "medium",
          category: "Education",
          executionStrategy: "Isolate recursion bases first. Do not pre-optimize; establish robust base recurrence correctness."
        }
      ],
      riskAssessment: {
        level: "medium",
        description: "Risk maps directly to nested state complexities and recursion depth limitations.",
        bottlenecks: ["Base case validations", "Stack depth limits"]
      },
      timeline: [
        {
          phaseName: "Phase 1: Recurrence Mapping",
          duration: "1.5 Hours",
          tasks: ["Master DSA Dynamic Programming Recurrences"]
        }
      ]
    };
  }

  if (isStripe) {
    return {
      summary: "Compiling billing integration checkpoints. Ensuring cryptographic signature validation, environment secret safety, and error logging sanity.",
      tasks: [
        {
          title: "Audit Webhook Secret Signing Key environment variables",
          description: "Establish signature integrity verification and secure endpoint tunnels to shield transactions from interception.",
          priority: "critical",
          deadline: new Date().toISOString().split('T')[0],
          estimatedHours: 2,
          subtasks: [
            { title: "Configure local Stripe CLI tunnel checks", completed: false },
            { title: "Sanitize node backend logs from secret leakage", completed: false }
          ],
          tags: ["Security", "Billing"],
          risk: "high",
          category: "Engineering",
          executionStrategy: "Strictly validate req.headers['stripe-signature'] against local buffer secrets before processing."
        }
      ],
      riskAssessment: {
        level: "high",
        description: "Integration endpoints will fail if local tunnel loses stability or credentials mismatch on boot.",
        bottlenecks: ["Stripe CLI local forwarding", "Secret synchronization"]
      },
      timeline: [
        {
          phaseName: "Phase 1: Verification & Signature Auditing",
          duration: "2.0 Hours",
          tasks: ["Audit Webhook Secret Signing Key environment variables"]
        }
      ]
    };
  }

  return {
    summary: `Synthesized roadmap for focus objective: "${prompt}". Mapping critical path structures and reducing cognitive friction.`,
    tasks: [
      {
        title: `Execute Focused Session: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`,
        description: "AI-optimized task unit designed to minimize multitasking overhead.",
        priority: "high",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 4,
        subtasks: [
          { title: "Synthesize target specifications & parameters", completed: false },
          { title: "Perform core coding/writing draft workflow", completed: false },
          { title: "Audit quality check and deploy", completed: false }
        ],
        tags: ["AI-Plan", "General"],
        risk: "medium",
        category: "Custom",
        executionStrategy: "Immerse yourself inside focused 45-minute focus intervals. Mute Slack, block secondary sites."
      }
    ],
    riskAssessment: {
      level: "medium",
      description: "Mild cognitive fatigue from multitasking and open focus loops.",
      bottlenecks: ["Decision fatigue", "Scope sprawl"]
    },
    timeline: [
      {
        phaseName: "Phase 1: Setup & Initialization",
        duration: "1.5 Hours",
        tasks: [`Execute Focused Session: ${prompt.substring(0, 40)}`]
      }
    ]
  };
}

function getRecoveryFallback(inputSignal: string, context: AIContextBlock): RecoveryResponse {
  const actions = context.tasks.map((task, idx) => {
    if (idx === 0) {
      return {
        taskId: task.id,
        type: "focus" as const,
        actionDescription: "Lock focus immediately. Dedicate your very next 45-minute session exclusively to this task. Shut down secondary browser tabs, and activate neural sound loops."
      };
    } else if (idx === 1) {
      return {
        taskId: task.id,
        type: "move" as const,
        actionDescription: "De-escalate immediate urgency by postponing the deadline by 24 hours. The risk is manageable, and trying to multitask would compromise your focus task."
      };
    } else {
      return {
        taskId: task.id,
        type: "drop" as const,
        actionDescription: "Drop from the active queue for now. This is secondary tail-overhead contributing to cognitive drain. Re-file under background backlog."
      };
    }
  });

  return {
    recoveryScore: 88,
    actions,
    recoveryTimeline: [
      { time: "09:00 AM", action: "Initialize Emergency Lockdown Mode. All incoming notifications muted." },
      { time: "09:15 AM", action: `Deep focus sprint on your primary target task (45m)` },
      { time: "10:00 AM", action: "10-minute restorative break (binaural frequencies)" },
      { time: "10:10 AM", action: "Clear secondary actionable items and postpone moving deadlines (30m)" },
      { time: "10:40 AM", action: "Review progress metrics and restore standard operations." }
    ]
  };
}
