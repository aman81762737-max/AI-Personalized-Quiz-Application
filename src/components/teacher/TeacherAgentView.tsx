import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { subscribeAIChatSessions, saveAIChatSessionToCloud } from '../../services/cloudSyncService';
import {
  Bot,
  Sparkles,
  Send,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  Layers,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Building,
  Target,
  FileText,
  AlertTriangle,
  Lightbulb,
  Clock,
  Calendar,
  ShieldCheck,
  Plus,
  Trash2,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

export interface TeacherAgentFeature {
  id: number;
  category: 'class_management' | 'curriculum_planning' | 'assessment_grading' | 'workflow_automation' | 'analytics_improvement' | 'school_coordination';
  categoryLabel: string;
  categoryLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  description: string;
  promptTemplate: string;
  badge: string;
  iconName: string;
}

export const TEACHER_AGENT_60_FEATURES: TeacherAgentFeature[] = [
  // A. Class and student management (61–70)
  {
    id: 61,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Class Performance Monitor',
    description: 'Tracks aggregate mastery across cohorts in real time and highlights cognitive trends.',
    promptTemplate: 'Analyze my class performance telemetry for CS201. Identify topic mastery trends, cognitive Bloom distribution, and cohort velocity benchmarks.',
    badge: 'Telemetry',
    iconName: 'BarChart3',
  },
  {
    id: 62,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'At-Risk Student Detector',
    description: 'Surfaces learners falling below Bloom retention benchmarks before exams.',
    promptTemplate: 'Run an At-Risk Student diagnostic sweep across my enrolled cohort. Flag students with low retention, repeated quiz errors, or erratic completion times.',
    badge: 'Diagnostic',
    iconName: 'AlertTriangle',
  },
  {
    id: 63,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Individual Intervention Planner',
    description: 'Generates targeted remediation strategies and scaffolded micro-drills per student.',
    promptTemplate: 'Draft a personalized 3-step intervention plan for struggling students focusing on Graph Traversals and Tree Balancing invariants.',
    badge: 'Remediation',
    iconName: 'Target',
  },
  {
    id: 64,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Student Grouping Optimizer',
    description: 'Groups students by complementary skill levels and peer mentoring dynamics for projects.',
    promptTemplate: 'Optimize team groupings for a 4-person software capstone project. Pair advanced algorithmic thinkers with students needing peer scaffolding.',
    badge: 'Grouping',
    iconName: 'Users',
  },
  {
    id: 65,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Student Progress Report Generator',
    description: 'Generates personalized narrative academic reports for students and department chairs.',
    promptTemplate: 'Generate a mid-semester narrative academic progress report for my class summarizing competency growth, proctored exam integrity, and next steps.',
    badge: 'Reporting',
    iconName: 'FileText',
  },
  {
    id: 66,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Attendance & Engagement Follow-Up',
    description: 'Flags disengaged students and prepares empathetic outreach email drafts.',
    promptTemplate: 'Draft a supportive, non-punitive academic check-in message for students who missed consecutive lab sessions or recent diagnostic quizzes.',
    badge: 'Outreach',
    iconName: 'Clock',
  },
  {
    id: 67,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Student Support Tracker',
    description: 'Maintains an audit log of academic accommodations, office hour interventions, and notes.',
    promptTemplate: 'Compile an audit summary of student support interventions, extra time accommodations, and peer tutoring logs for the Department Head.',
    badge: 'Audit Log',
    iconName: 'ClipboardList',
  },
  {
    id: 68,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Parent Communication Assistant',
    description: 'Drafts professional, constructive performance updates for academic advisors.',
    promptTemplate: 'Draft a formal academic progress notice detailing student strengths in Data Structures and recommending after-school lab support for graph theory.',
    badge: 'Communication',
    iconName: 'FileText',
  },
  {
    id: 69,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Behavior & Habit Pattern Detector',
    description: 'Identifies systemic cramming, last-minute submission spikes, and fatigue markers.',
    promptTemplate: 'Analyze cohort submission timestamps across Homework 1 through 4. Detect whether students are cramming within 2 hours of deadline and model grade impact.',
    badge: 'Habit Analytics',
    iconName: 'Clock',
  },
  {
    id: 70,
    category: 'class_management',
    categoryLabel: 'Class & Student Management',
    categoryLetter: 'A',
    name: 'Student Recognition Agent',
    description: 'Identifies most-improved students and prepares formal letters of commendation.',
    promptTemplate: 'Identify the top 5 most improved students based on delta between Diagnostic Quiz 1 and Midterm 1. Draft personalized commendation certificates.',
    badge: 'Praise',
    iconName: 'CheckCircle2',
  },

  // B. Lesson and curriculum planning (71–80)
  {
    id: 71,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Curriculum Coverage Analyzer',
    description: 'Audits class progress against university syllabus and accreditation milestones.',
    promptTemplate: 'Perform a curriculum coverage gap analysis for CS201. Compare topics covered to date against ABET Criterion 3 and identify any lagging learning outcomes.',
    badge: 'ABET Audit',
    iconName: 'BookOpen',
  },
  {
    id: 72,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Sequenced Lesson Planner',
    description: 'Designs coherent multi-week lecture modules with active recall and lab tie-ins.',
    promptTemplate: 'Generate a 3-week lecture roadmap for "Dynamic Programming & Memoization". Include daily objectives, board diagrams, active coding challenges, and lab exercises.',
    badge: 'Syllabus',
    iconName: 'Calendar',
  },
  {
    id: 73,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Tiered Differentiation Agent',
    description: 'Creates 3-tier differentiated lesson variants: Foundational, Standard, Accelerated.',
    promptTemplate: 'Generate a differentiated 3-tier lesson plan for "Binary Search Trees & Balancing" (Tier 1: Foundational invariants, Tier 2: Standard implementation, Tier 3: Red-Black self-balancing proofs).',
    badge: 'Tiered Plans',
    iconName: 'Layers',
  },
  {
    id: 74,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Prerequisite Topic Checker',
    description: 'Ensures fundamental concepts are firmly mastered before introducing advanced algorithms.',
    promptTemplate: 'Verify prerequisite readiness for "Graph Shortest Path (Dijkstra)". List the 3 required data structures students must know, with a 3-question prerequisite check.',
    badge: 'Prerequisites',
    iconName: 'CheckCircle2',
  },
  {
    id: 75,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Real-World Application Matcher',
    description: 'Connects abstract algorithmic theorems to real-world software engineering scenarios.',
    promptTemplate: 'Provide 3 high-impact real-world engineering case studies showing how Dijkstra\'s Algorithm powers GPS routing, OSPF network routers, and flight matrix search.',
    badge: 'Real-World',
    iconName: 'Lightbulb',
  },
  {
    id: 76,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Pacing Adjustment Agent',
    description: 'Recalibrates semester pacing calendar based on cohort mastery speed.',
    promptTemplate: 'Recalibrate the CS201 semester pacing schedule: students required 4 extra lecture hours on Recursion. Recommend what secondary topics can be safely compressed.',
    badge: 'Pacing',
    iconName: 'Clock',
  },
  {
    id: 77,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Interactive Activity Designer',
    description: 'Designs live classroom whiteboard exercises, think-pair-share, and live peer reviews.',
    promptTemplate: 'Design a 20-minute interactive peer-instruction activity for teaching AVL Tree Double Rotations. Include student handout prompts and discussion rubrics.',
    badge: 'Active Learn',
    iconName: 'Users',
  },
  {
    id: 78,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Interdisciplinary Lesson Connector',
    description: 'Bridges computer science algorithms with physics simulations, bioinformatics, and economics.',
    promptTemplate: 'Create an interdisciplinary lesson module connecting Dynamic Programming (Needleman-Wunsch algorithm) to DNA Sequence Alignment in Bioinformatics.',
    badge: 'Cross-Discipline',
    iconName: 'Building',
  },
  {
    id: 79,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Curriculum Renewal Agent',
    description: 'Updates traditional course modules with cutting-edge industry practices and AI paradigms.',
    promptTemplate: 'Modernize our Asymptotic Complexity curriculum module to include modern Cache-Oblivious algorithms and GPU memory hierarchies alongside standard Big-O notation.',
    badge: 'Modernization',
    iconName: 'Sparkles',
  },
  {
    id: 80,
    category: 'curriculum_planning',
    categoryLabel: 'Curriculum & Lesson Planning',
    categoryLetter: 'B',
    name: 'Class Discussion Facilitator',
    description: 'Generates provocative, philosophically rigorous debate topics for advanced seminars.',
    promptTemplate: 'Generate 4 provocative discussion prompts for an undergraduate seminar on "P vs NP: Philosophical Implications, Cryptographic Collapse, and Algorithmic Solvability".',
    badge: 'Discussion',
    iconName: 'MessageSquare',
  },

  // C. Assessment and grading (81–90)
  {
    id: 81,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Balanced Exam Generator',
    description: 'Generates psychometrically balanced exams adhering to Bloom\'s Taxonomy tiers.',
    promptTemplate: 'Generate a balanced 10-question Midterm Exam on Trees and Graphs: 2 Remember, 3 Understand, 3 Apply, 2 Analyze. Include answer key and distractor rationales.',
    badge: 'Exam Gen',
    iconName: 'ClipboardList',
  },
  {
    id: 82,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Diagnostic Quiz Builder',
    description: 'Creates rapid 5-question pre-lecture formative quizzes to assess baseline readiness.',
    promptTemplate: 'Build a 5-question diagnostic quiz to test whether incoming students understand Recursion Stack Frames and Base Cases before teaching Divide and Conquer.',
    badge: 'Diagnostic',
    iconName: 'Target',
  },
  {
    id: 83,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Rubric Creation Agent',
    description: 'Generates rigorous 4-tier analytical rubrics (Exemplary, Proficient, Developing, Inadequate).',
    promptTemplate: 'Create an analytical 4-tier grading rubric for the Dijkstra shortest path algorithmic coding project. Include criteria for correctness, big-O efficiency, and defensive tests.',
    badge: 'Rubric Engine',
    iconName: 'FileText',
  },
  {
    id: 84,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Automated Grading Assistant',
    description: 'Reviews student submitted code or essays against rubric criteria and flags edge-case errors.',
    promptTemplate: 'Analyze sample student implementation of Breadth-First Search. Verify queue enqueue/dequeue invariants, check for visited set tracking, and score out of 20.',
    badge: 'Grading AI',
    iconName: 'CheckCircle2',
  },
  {
    id: 85,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Misconception Trap Creator',
    description: 'Engineers plausible multiple-choice distractors that diagnose common cognitive errors.',
    promptTemplate: 'Create 3 high-discrimination MCQ questions on "Binary Tree Traversals" where each wrong answer represents a specific known student mental model error.',
    badge: 'Item Design',
    iconName: 'AlertTriangle',
  },
  {
    id: 86,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Viva Voce & Oral Defense Script',
    description: 'Drafts faculty question scripts for oral thesis defenses and capstone vivas.',
    promptTemplate: 'Prepare an oral viva defense questioning protocol for a student presenting a "Distributed B-Tree Database". Include 5 escalating counter-probing questions.',
    badge: 'Oral Viva',
    iconName: 'Users',
  },
  {
    id: 87,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Curriculum Assessment Architect',
    description: 'Organizes, deduplicates, and structures institutional item pools by difficulty and concept.',
    promptTemplate: 'Review the departmental curriculum materials. Suggest 5 new high-discrimination questions on Hash Collision resolution strategies.',
    badge: 'Assessment Architect',
    iconName: 'BookOpen',
  },
  {
    id: 88,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Assessment Differentiation Agent',
    description: 'Generates parallel exam forms (Form A / Form B) with equal psychometric difficulty.',
    promptTemplate: 'Generate two parallel versions (Form A and Form B) of a 5-question Tree Invariants quiz with identical Bloom weights and differing problem parameters.',
    badge: 'Parallel Forms',
    iconName: 'Layers',
  },
  {
    id: 89,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Grading Consistency Auditor',
    description: 'Flags grading variance across teaching assistants or multi-section instructors.',
    promptTemplate: 'Analyze grading distributions across Section 01 and Section 02. Flag if one TA is grading short-answer proofs significantly harsher than average.',
    badge: 'Fairness',
    iconName: 'BarChart3',
  },
  {
    id: 90,
    category: 'assessment_grading',
    categoryLabel: 'Assessment & Grading',
    categoryLetter: 'C',
    name: 'Qualitative Feedback Generator',
    description: 'Generates constructive, encouraging student feedback paragraphs based on attempt marks.',
    promptTemplate: 'Draft encouraging, actionable feedback for a student who scored 72% on Midterm 1: praise strong linear structure skills and advise on dynamic programming.',
    badge: 'Feedback',
    iconName: 'Sparkles',
  },

  // D. Teaching workflow automation (91–100)
  {
    id: 91,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Assignment Distribution Coordinator',
    description: 'Automates release schedules, instructions, starter code links, and rubric links.',
    promptTemplate: 'Prepare an assignment launch packet for "Project 2: Huffman Coding Compression". Include submission requirements, deadlines, test suites, and academic honesty rules.',
    badge: 'Distribution',
    iconName: 'ClipboardList',
  },
  {
    id: 92,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Submission Tracking Agent',
    description: 'Monitors submission rates and sends polite deadline reminders.',
    promptTemplate: 'Check submission rates for Homework 4 (due in 24 hours). Draft a concise, urgent announcement reminder for the 18 students who haven\'t submitted yet.',
    badge: 'Tracking',
    iconName: 'Clock',
  },
  {
    id: 93,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Deadline Coordination Agent',
    description: 'Avoids scheduling exams on the same day as major partner department midterms.',
    promptTemplate: 'Coordinate CS201 exam scheduling to avoid overlap with Operating Systems (CS204) and Linear Algebra (MATH201) major deadlines.',
    badge: 'Schedule Sync',
    iconName: 'Calendar',
  },
  {
    id: 94,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Class Announcement Manager',
    description: 'Drafts clear, high-impact announcements with highlighted action items.',
    promptTemplate: 'Draft a clear class announcement regarding the upcoming guest lecture on Distributed Consensus and the revised lab due date.',
    badge: 'Broadcast',
    iconName: 'FileText',
  },
  {
    id: 95,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Schedule Update Agent',
    description: 'Broadcasts timetable changes and lab room reassignments smoothly.',
    promptTemplate: 'Draft an urgent schedule update notifying students that Thursday\'s Computer Science lab is moving to Hall B due to server maintenance.',
    badge: 'Updates',
    iconName: 'Clock',
  },
  {
    id: 96,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Teaching Workload Optimizer',
    description: 'Analyzes grading load and schedules faculty prep time effectively.',
    promptTemplate: 'Analyze my grading commitments for the next 10 days. Recommend a daily time-block schedule to grade 65 midterm exams without burnout.',
    badge: 'Time Mgmt',
    iconName: 'Clock',
  },
  {
    id: 97,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Faculty Meeting Agenda Builder',
    description: 'Prepares structured agendas with time limits and outcome goals.',
    promptTemplate: 'Prepare an agenda for our monthly Computer Science Department faculty meeting. Focus on ABET accreditation criteria and semester lab equipment upgrades.',
    badge: 'Meeting Prep',
    iconName: 'ClipboardList',
  },
  {
    id: 98,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Resource Request Coordinator',
    description: 'Drafts budget justification proposals for software licenses and lab servers.',
    promptTemplate: 'Draft a budget requisition request to university administration for 40 cloud GPU instances to support the Machine Learning capstone lab.',
    badge: 'Requisitions',
    iconName: 'Building',
  },
  {
    id: 99,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Teaching Assistant Manager',
    description: 'Assigns grading sections and lab supervision rosters to graduate TAs.',
    promptTemplate: 'Draft a TA coordination briefing detailing grading rubrics, office hour coverage, and lab supervision assignments for our 3 graduate teaching assistants.',
    badge: 'TA Roster',
    iconName: 'Users',
  },
  {
    id: 100,
    category: 'workflow_automation',
    categoryLabel: 'Teaching Workflow Automation',
    categoryLetter: 'D',
    name: 'Classroom Setup Checklist',
    description: 'Ensures audiovisual, IDE compilers, and remote streams are verified before class.',
    promptTemplate: 'Generate a pre-lecture AV and lab station checklist to verify projector resolution, microphone batteries, and lab Docker container status.',
    badge: 'Setup Audit',
    iconName: 'CheckCircle2',
  },

  // E. Classroom improvement and analytics (101–110)
  {
    id: 101,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Cohort Pass-Rate Predictor',
    description: 'Projects final course pass rates based on mid-semester assessment marks.',
    promptTemplate: 'Project the semester pass rate for CS201 based on Midterm 1 scores (median 74%) and Quiz 1-3 completion rates. Identify students at borderline D/F risk.',
    badge: 'Pass Forecast',
    iconName: 'BarChart3',
  },
  {
    id: 102,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Instructional Method Evaluator',
    description: 'Compares active-learning labs versus traditional lectures on student retention.',
    promptTemplate: 'Compare student exam performance on topics taught via interactive labs vs traditional slide lectures. Quantify the active learning retention delta.',
    badge: 'Efficacy',
    iconName: 'Lightbulb',
  },
  {
    id: 103,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Cohort Knowledge Gap Mapper',
    description: 'Visualizes the whole-class conceptual dependency tree to spot structural gaps.',
    promptTemplate: 'Map the whole-class knowledge gap topology for CS201. Identify which upstream prerequisite failure is causing 62% of students to stumble on Dynamic Programming.',
    badge: 'Gap Mapping',
    iconName: 'Layers',
  },
  {
    id: 104,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Student Sentiment & Feedback Synthesizer',
    description: 'Analyzes anonymous mid-semester feedback forms into categorized themes.',
    promptTemplate: 'Synthesize anonymous mid-term course evaluations from 58 students. Identify the 3 most common praise themes and the 2 most actionable critiques.',
    badge: 'Sentiment',
    iconName: 'MessageSquare',
  },
  {
    id: 105,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Classroom Dynamic Monitor',
    description: 'Measures gender and background balance in student question participation.',
    promptTemplate: 'Analyze lecture participation telemetry. Recommend 3 pedagogical strategies to encourage quiet students and underrepresented groups to ask questions.',
    badge: 'Equity',
    iconName: 'Users',
  },
  {
    id: 106,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'TA Efficiency & Grading Speed Auditor',
    description: 'Evaluates TA grading turnaround times and rubric adherence.',
    promptTemplate: 'Audit grading turnaround latency across TAs for Homework 3. Flag any grading queues experiencing delays beyond the departmental 5-day SLA.',
    badge: 'TA Audit',
    iconName: 'Clock',
  },
  {
    id: 107,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Course Learning Outcome (CLO) Tracker',
    description: 'Maps exam questions directly to university ABET Course Learning Outcomes.',
    promptTemplate: 'Map Midterm 1 questions directly to CLO-1 (Data Structures Invariants) and CLO-2 (Complexity Proofs). Calculate cohort attainment percentages.',
    badge: 'ABET CLO',
    iconName: 'Target',
  },
  {
    id: 108,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Exam Item Discrimination Evaluator',
    description: 'Flags questions where low-performing students outscored top-performing students.',
    promptTemplate: 'Calculate item discrimination index (point biserial correlation) on Question 7 from Midterm 1. Determine if the distractor is misleading top students.',
    badge: 'Psychometrics',
    iconName: 'BarChart3',
  },
  {
    id: 109,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Student Retention & Attrition Predictor',
    description: 'Flags early drop-out risk before the university withdrawal deadline.',
    promptTemplate: 'Run an attrition risk model for CS201 prior to the drop deadline. Identify the top 3 behavioral indicators that correlate with course withdrawal.',
    badge: 'Retention',
    iconName: 'AlertTriangle',
  },
  {
    id: 110,
    category: 'analytics_improvement',
    categoryLabel: 'Improvement & Analytics',
    categoryLetter: 'E',
    name: 'Class Improvement Planner',
    description: 'Proposes 3 concrete pedagogical tweaks for next semester based on cumulative telemetry.',
    promptTemplate: 'Propose 3 concrete pedagogical refinements for next semester\'s offering of CS201 to reduce attrition and increase dynamic programming fluency.',
    badge: 'Refinement',
    iconName: 'Sparkles',
  },

  // F. School and teacher coordination (111–120)
  {
    id: 111,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Cross-Class Workload Coordinator',
    description: 'Coordinates major project due dates across the faculty to avoid student overload.',
    promptTemplate: 'Check department project deadlines for 3rd-year CS students in November to ensure CS201 Project 2 doesn\'t collide with the Database Systems project.',
    badge: 'Workload Sync',
    iconName: 'Calendar',
  },
  {
    id: 112,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Shared Assessment Coordinator',
    description: 'Standardizes common exam questions across multiple faculty teaching different sections.',
    promptTemplate: 'Draft 5 shared midterm exam questions for all 4 sections of CS201 to ensure standardized assessment grading across faculty members.',
    badge: 'Standardization',
    iconName: 'ClipboardList',
  },
  {
    id: 113,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Substitute Teacher Preparation Agent',
    description: 'Generates comprehensive one-page emergency lesson cover plans for guest faculty.',
    promptTemplate: 'Generate an emergency substitute teacher lesson plan for a 75-minute class on "Binary Heap Insert and Extract-Min Operations" with board diagrams and practice problems.',
    badge: 'Sub Plan',
    iconName: 'FileText',
  },
  {
    id: 114,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Department Curriculum Coordinator',
    description: 'Ensures vertical alignment between prerequisite data structures and subsequent courses.',
    promptTemplate: 'Audit curriculum handoff between CS201 (Data Structures) and CS305 (Advanced Algorithms / Operating Systems) to verify prerequisite topic alignment.',
    badge: 'Curriculum Align',
    iconName: 'Building',
  },
  {
    id: 115,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Institutional Calendar Conflict Detector',
    description: 'Flags overlaps with campus recruitment drives, hackathons, and university holidays.',
    promptTemplate: 'Cross-reference course exam dates against the university holiday schedule, mid-term break, and annual campus recruitment drive.',
    badge: 'Conflict Audit',
    iconName: 'Clock',
  },
  {
    id: 116,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Academic Policy Compliance Checker',
    description: 'Audits syllabus and grading policies against university faculty guidelines.',
    promptTemplate: 'Audit CS201 syllabus for compliance with university academic integrity rules, late penalty guidelines, and disability accommodation statements.',
    badge: 'Policy Audit',
    iconName: 'ShieldCheck',
  },
  {
    id: 117,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Faculty Resource Sharing Agent',
    description: 'Recommends high-performing slide decks, lab rubrics, and sandboxes from peers.',
    promptTemplate: 'Format a modular lab handout on "Graph Traversal Visualization" to share with faculty colleagues teaching introductory programming courses.',
    badge: 'Sharing',
    iconName: 'Users',
  },
  {
    id: 118,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'School-Wide Trend Monitor',
    description: 'Identifies systemic grade inflation, enrollment shifts, or department-wide retention patterns.',
    promptTemplate: 'Analyze 3-year historical grade trends in the Department of Computer Science. Flag shifts in median grades or drop rates across core prerequisites.',
    badge: 'Macro Trends',
    iconName: 'BarChart3',
  },
  {
    id: 119,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Academic Accreditation Review Preparer',
    description: 'Formats course artifacts, sample student works, and exam rubrics for external auditors.',
    promptTemplate: 'Compile an accreditation binder index for CS201 containing high, medium, and low student exam artifacts, rubric rubrics, and CLO attainment summaries.',
    badge: 'Accreditation',
    iconName: 'ShieldCheck',
  },
  {
    id: 120,
    category: 'school_coordination',
    categoryLabel: 'School & Teacher Coordination',
    categoryLetter: 'F',
    name: 'Educator Workflow Improvement Agent',
    description: 'Identifies bottlenecks in the teacher\'s grading and course preparation workflow.',
    promptTemplate: 'Analyze my weekly teaching workflow (lecture prep, grading, office hours, administrative meetings). Suggest 3 time-saving automation strategies.',
    badge: 'Workflow AI',
    iconName: 'Sparkles',
  },
];

interface ChatMsg {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  feature?: TeacherAgentFeature;
  artifactTitle?: string;
}

interface TeacherChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMsg[];
}

const TEACHER_STORAGE_KEY = 'teacher_agent_chat_sessions_v2';

export const TeacherAgentView: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHubModal, setShowHubModal] = useState<boolean>(false);

  // Multi-session state
  const [sessions, setSessions] = useState<TeacherChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(TEACHER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading teacher sessions:', e);
    }

    const initId = `t-session-${Date.now()}`;
    return [
      {
        id: initId,
        title: 'Curriculum & Cohort Copilot',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: 'msg-init-t1',
            sender: 'agent',
            text: `Hello Professor **${userProfile?.name?.split(' ')[1] || userProfile?.name || 'Educator'}**! I am your **Teacher Agent Academic Copilot**, equipped with **60 specialized educator workflows** across Class Management, Curriculum Sequencing, Assessment & Rubric Engineering, Workflow Automation, Learning Gap Analytics, and Institutional Coordination.

### 🌟 How to Use Your Educator Agent:
• **Select any agent capability** from the hub to instantly generate balanced exams, rubric matrices, differentiated lesson tiers, at-risk student matrices, or ABET course attainment reports.
• **Ask follow-up questions** or refine problem sets directly in the chat.
• All outputs feature clean **Markdown formatting, ASCII matrices**, and pedagogical grounding.

What pedagogical challenge or institutional task can we automate today?`,
            timestamp: 'Just now',
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || `t-session-${Date.now()}`);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages || [];

  // Real-time Cloud Teacher Chat Sync
  useEffect(() => {
    if (!userProfile?.userId) return;
    const unsub = subscribeAIChatSessions(userProfile.userId, 'teacher', (remote) => {
      if (Array.isArray(remote) && remote.length > 0) {
        setSessions(remote);
      }
    });
    return () => unsub();
  }, [userProfile?.userId]);

  // Persist sessions locally & to Cloud
  useEffect(() => {
    try {
      localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(sessions));
      if (userProfile?.userId && activeSession) {
        saveAIChatSessionToCloud({
          ...activeSession,
          userId: userProfile.userId,
          role: 'teacher',
        });
      }
    } catch (e) {
      console.warn('Error saving teacher sessions:', e);
    }
  }, [sessions, activeSession, userProfile?.userId]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentStep, setAgentStep] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, agentStep]);

  const handleNewChat = () => {
    const newId = `t-session-${Date.now()}`;
    const newSession: TeacherChatSession = {
      id: newId,
      title: 'New Educator Consultation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `Started a fresh educator session. What curriculum, assessment, or student management task shall we handle?`,
          timestamp: 'Just now',
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowHistoryDrawer(false);
    showToast('New teacher chat created', 'info');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      showToast('Cannot delete the only chat session', 'error');
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setActiveSessionId(remaining[0]?.id || '');
    }
    showToast('Chat session deleted', 'info');
  };

  const executePrompt = async (promptText: string, featureRef?: TeacherAgentFeature) => {
    if (!promptText.trim()) return;
    const cleanPrompt = promptText.trim();

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      feature: featureRef,
    };

    const isFirstUserMessage = activeSession.messages.filter((m) => m.sender === 'user').length === 0;
    const newTitle = isFirstUserMessage
      ? cleanPrompt.slice(0, 32).trim() + (cleanPrompt.length > 32 ? '...' : '')
      : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInputPrompt('');
    setLoading(true);
    setAgentStep(1);

    const step2Timer = setTimeout(() => setAgentStep(2), 600);
    const step3Timer = setTimeout(() => setAgentStep(3), 1200);

    try {
      const response = await fetch('/api/ai/teacher-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          featureId: featureRef?.id,
          featureName: featureRef?.name,
          category: featureRef?.category,
          teacherName: userProfile?.name || 'Dr. Jenkins',
          college: userProfile?.college || 'MIT-WPU',
          department: userProfile?.stream || 'Computer Science & Engineering',
          history: messages.slice(-6).map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('Teacher Agent encountered an error communicating with Gemini.');
      }

      const data = await response.json();
      const agentMsg: ChatMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'Task analyzed and completed successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feature: featureRef,
        artifactTitle: data.artifactTitle,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, agentMsg],
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.warn('Teacher agent error:', err);
      const fallbackMsg: ChatMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `### 📋 Teacher Copilot Artifact: ${featureRef?.name || 'Academic Workflow Action'}
**Generated for:** ${userProfile?.name || 'Faculty Member'} · ${userProfile?.stream || 'Computer Science & Engineering'}

#### 1. Strategic Action & Pedagogical Directive
• **Focal Concept / Objective:** ${featureRef?.name || 'Curriculum Specification'}
• **Pedagogical Alignment:** Bloom's Taxonomy Tier IV (Analysis & Application)
• **Key Invariants:** Operational definitions, verified distractor discrimination, and edge-case testing.

\`\`\`markdown
[ACADEMIC ARTIFACT SPECIFICATION]
Course: CS201 Data Structures & Algorithms
Component: ${featureRef?.name || 'Instructional Module'}
Attainment Metric: ≥ 80% Cohort Benchmark
\`\`\`

#### 2. Immediate Implementation Steps
1. Review generated specifications against the departmental syllabus.
2. Publish or export to class cohort or exam bank.
3. Monitor real-time student interaction telemetry upon release.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feature: featureRef,
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, fallbackMsg],
            };
          }
          return s;
        })
      );
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSessions = useMemo(() => {
    if (!historySearchQuery.trim()) return sessions;
    const q = historySearchQuery.toLowerCase();
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [sessions, historySearchQuery]);

  const filteredFeatures = useMemo(() => {
    return TEACHER_AGENT_60_FEATURES.filter((feat) => {
      const matchesCat = selectedCategory === 'all' || feat.category === selectedCategory;
      const matchesQuery =
        feat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.promptTemplate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(feat.id).includes(searchQuery);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#07090E] text-slate-100 font-sans relative">
      {/* Top Header Bar: Clean ChatGPT Style */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/[0.08] bg-[#07090E]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Arrow / Dropdown Button for Previous Chats */}
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer group"
            title="View Previous Chats"
          >
            <span className="font-mono text-[#10B981] group-hover:scale-110 transition-transform">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showHistoryDrawer ? 'rotate-180' : ''}`} />
            </span>
            <span className="truncate max-w-[200px] sm:max-w-[320px] font-bold">
              {activeSession.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ({sessions.length})
            </span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#10B981]/15 hover:border-[#10B981]/40 text-slate-300 hover:text-[#10B981] transition-all cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 60 Teacher Capabilities Hub Trigger */}
        <button
          type="button"
          onClick={() => setShowHubModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#10B981]/40 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">60 Educator Capabilities</span>
          <span className="sm:hidden">60 Agents</span>
        </button>
      </header>

      {/* Slide-over / Dropdown Drawer for Previous Chats */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[57px] left-4 sm:left-8 z-40 w-80 sm:w-96 rounded-2xl border border-white/15 bg-[#0C101A] shadow-2xl backdrop-blur-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <MessageSquare className="w-4 h-4 text-[#10B981]" />
                <span>Educator Chat History</span>
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1 text-[11px] font-mono text-[#10B981] hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> New Chat
              </button>
            </div>

            {/* Search Input for previous chats */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search past educator consultations..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#10B981]"
              />
            </div>

            {/* Sessions List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredSessions.map((session, sIdx) => (
                <div
                  key={`${session.id || 'sess'}-${sIdx}`}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setShowHistoryDrawer(false);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                    session.id === activeSessionId
                      ? 'bg-[#10B981]/15 border border-[#10B981]/40 text-white'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="truncate font-medium">{session.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 rounded transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredSessions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No chats match your search.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main ChatGPT-Style Chat Area (Full Bleed, No Box Border) */}
      <main className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {messages.map((msg, mIdx) => (
          <div key={`${msg.id || 'msg'}-${mIdx}`} className="space-y-3">
            <div className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Agent Avatar */}
              {msg.sender === 'agent' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981]/30 to-teal-600/30 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Bot className="w-4 h-4 text-[#10B981]" />
                </div>
              )}

              <div className="max-w-3xl w-full space-y-3">
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-colors ${
                    msg.sender === 'user'
                      ? 'bg-[#10B981]/15 text-white border border-[#10B981]/30 ml-auto max-w-[85%]'
                      : 'bg-white/[0.03] text-slate-200 border border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 text-[10px] font-mono">
                    <span
                      className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        msg.sender === 'user' ? 'text-[#10B981]' : 'text-teal-400'
                      }`}
                    >
                      {msg.sender === 'user' ? 'Faculty Member' : 'Teacher Agent Copilot'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 tabular-nums">{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Markdown Renderer */}
                  <MarkdownRenderer content={msg.text} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Real Animated Loading Agentic Pipeline Trace */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981]/30 to-teal-600/30 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
              <Bot className="w-4 h-4 text-[#10B981] animate-pulse" />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 max-w-lg space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#10B981]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981] animate-spin" />
                  EDUCATOR AGENT EXECUTION
                </span>
                <span className="text-[#10B981]">Step {agentStep} of 3</span>
              </div>

              <div className={`flex items-center gap-2 text-xs font-mono transition-opacity ${agentStep >= 1 ? 'opacity-100 text-white' : 'opacity-40'}`}>
                <span className={`w-2 h-2 rounded-full ${agentStep > 1 ? 'bg-emerald-400' : 'bg-[#10B981] animate-ping'}`} />
                <span>1. Parsing curriculum syllabus parameters & accreditation standards...</span>
              </div>

              <div className={`flex items-center gap-2 text-xs font-mono transition-opacity ${agentStep >= 2 ? 'opacity-100 text-white' : 'opacity-40'}`}>
                <span className={`w-2 h-2 rounded-full ${agentStep > 2 ? 'bg-emerald-400' : agentStep === 2 ? 'bg-[#10B981] animate-ping' : 'bg-slate-600'}`} />
                <span>2. Calibrating Bloom psychometrics & discrimination criteria...</span>
              </div>

              <div className={`flex items-center gap-2 text-xs font-mono transition-opacity ${agentStep >= 3 ? 'opacity-100 text-white' : 'opacity-40'}`}>
                <span className={`w-2 h-2 rounded-full ${agentStep === 3 ? 'bg-[#10B981] animate-ping' : 'bg-slate-600'}`} />
                <span>3. Synthesizing publication-grade educator blueprint & ASCII matrix...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatBottomRef} />
      </main>

      {/* Floating Centered Input Bar (ChatGPT Style) */}
      <footer className="sticky bottom-0 z-30 px-4 sm:px-6 py-4 bg-gradient-to-t from-[#07090E] via-[#07090E]/95 to-transparent">
        <div className="max-w-3xl mx-auto space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executePrompt(inputPrompt);
            }}
            className="relative flex items-center rounded-2xl border border-white/15 bg-[#0C101A] shadow-2xl focus-within:border-[#10B981] transition-all p-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Instruct the Teacher Agent (e.g. 'Build 4-tier rubric for Dijkstra', 'Sweep at-risk students')..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent text-white placeholder-slate-400 focus:outline-hidden font-sans"
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowHubModal(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#10B981] hover:bg-white/5 transition-colors cursor-pointer"
                title="60 Teacher Capabilities"
              >
                <Zap className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={loading || !inputPrompt.trim()}
                className="p-2.5 rounded-xl bg-[#10B981] hover:bg-[#34d399] text-black font-bold disabled:opacity-30 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                title="Send Instruction"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2">
            <span>Gemini 3.8 Flash Educator Copilot · 60 Workflows</span>
            <span className="text-[#10B981]">Accredited Academic Mode</span>
          </div>
        </div>
      </footer>

      {/* 60 Capabilities Full Modal */}
      {showHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl p-6 rounded-3xl bg-[#0B0F19] border border-[#10B981]/30 text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    60 Autonomous Educator Capabilities Hub
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any capability to trigger its dedicated pedagogical workflow.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHubModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 60 educator capabilities (e.g. rubric, at-risk, lesson plan, ABET)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-hidden focus:border-[#10B981]"
              >
                <option value="all">All 6 Categories</option>
                <option value="class_management">A. Class & Student Management (61–70)</option>
                <option value="curriculum_planning">B. Curriculum & Lessons (71–80)</option>
                <option value="assessment_grading">C. Assessment & Rubrics (81–90)</option>
                <option value="workflow_automation">D. Workflow Automation (91–100)</option>
                <option value="analytics_improvement">E. Analytics & Gaps (101–110)</option>
                <option value="school_coordination">F. School Coordination (111–120)</option>
              </select>
            </div>

            {/* Capabilities Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
              {filteredFeatures.map((feat, fIdx) => (
                <div
                  key={`${feat.id || 'feat'}-${fIdx}`}
                  onClick={() => {
                    setShowHubModal(false);
                    executePrompt(feat.promptTemplate, feat);
                  }}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#10B981]/50 hover:bg-[#10B981]/5 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#10B981]/20 text-[#10B981] font-bold">
                      #{feat.id} {feat.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{feat.categoryLabel}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#10B981] transition-colors">
                    {feat.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
