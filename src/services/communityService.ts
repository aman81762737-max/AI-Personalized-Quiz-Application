import { ClassroomRoom, CommunityPost, CommunityReply, CommunityAttachment } from '../types';
import { aiService } from './aiService';

const STORAGE_KEY_CLASSROOMS = 'community_classrooms_v2';
const STORAGE_KEY_POSTS = 'community_posts_v2';

const SEED_CLASSROOMS: ClassroomRoom[] = [
  {
    id: 'room-general',
    name: 'General Studies & Academic Doubt Clearing',
    subject: 'General Curriculum',
    code: 'GEN-101',
    description: 'Open multi-disciplinary academic room for asking doubts, clarifying syllabus topics, sharing notes, and discussing study materials across all faculty and cohorts.',
    teacherId: 'faculty-01',
    teacherName: 'Dr. Alan Vance',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    bannerColor: 'from-blue-600 to-indigo-800',
    isDefault: true,
  },
  {
    id: 'room-cs301',
    name: 'CS 301: Advanced Data Structures & Algorithms',
    subject: 'Computer Science',
    code: 'CS-301',
    description: 'Deep dive into self-balancing search trees, amortized analysis, flow networks, and NP-completeness proofs.',
    teacherId: 'faculty-01',
    teacherName: 'Dr. Alan Vance',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    bannerColor: 'from-cyan-600 to-blue-800',
  },
  {
    id: 'room-phy202',
    name: 'PHY 202: Classical Mechanics & Thermodynamics',
    subject: 'Physics',
    code: 'PHY-202',
    description: 'Rotational dynamics, Hamiltonian systems, Carnot heat cycles, and statistical thermodynamics.',
    teacherId: 'faculty-02',
    teacherName: 'Prof. Sarah Chen',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    bannerColor: 'from-purple-600 to-pink-800',
  },
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post-gen-01',
    classroomId: 'room-general',
    authorId: 'faculty-01',
    authorName: 'Dr. Alan Vance',
    authorRole: 'teacher',
    title: 'Welcome to the General Academic Hub — Guidelines & Doubt Resolution',
    content: 'Welcome students and fellow faculty! Use this room to post questions on core concepts, request study guidance, or discuss difficult syllabus topics. All student queries undergo verification by our AI Study Guard to keep our discussions constructive, respectful, and academically centered. Feel free to ask any doubt!',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    postType: 'announcement',
    replies: [
      {
        id: 'rep-gen-01',
        postId: 'post-gen-01',
        authorId: 'student-01',
        authorName: 'Alex Rivera',
        authorRole: 'student',
        content: 'Thank you Professor! For the upcoming midterm, will the dynamic programming recurrence proofs be required in pseudo-code or formal mathematical induction?',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        aiVerification: {
          isStudyRelated: true,
          confidence: 0.98,
        },
      },
      {
        id: 'rep-gen-02',
        postId: 'post-gen-01',
        authorId: 'faculty-01',
        authorName: 'Dr. Alan Vance',
        authorRole: 'teacher',
        content: '@Alex Rivera Both are acceptable! State the base case, recurrence step, and verify the optimal substructure clearly.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        replyToUser: 'Alex Rivera',
        isOfficialFacultyAnswer: true,
      },
    ],
  },
  {
    id: 'post-cs-01',
    classroomId: 'room-cs301',
    authorId: 'faculty-01',
    authorName: 'Dr. Alan Vance',
    authorRole: 'teacher',
    title: 'Lecture Handout: AVL Tree Rotations & Height-Balance Invariants',
    content: 'Attached is the complete lecture slide deck and annotated study guide covering single (LL / RR) and double (LR / RL) tree rotations. Notice how the balance factor is maintained strictly within {-1, 0, +1}. Please review before taking our proctored assessment.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    postType: 'material',
    attachments: [
      {
        name: 'AVL_Tree_Rotations_Comprehensive_Handout.pdf',
        size: '2.4 MB',
        type: 'pdf',
        contentPreview: '=== AVL TREE ROTATIONS COMPREHENSIVE GUIDE ===\n1. Definition: An AVL tree is a self-balancing binary search tree in which the heights of the two child subtrees of any node differ by at most one.\n2. Invariant: Balance Factor BF(N) = Height(Left(N)) - Height(Right(N)) in {-1, 0, +1}.\n3. Left-Left (LL) Case: Right rotation around grandparent.\n4. Right-Right (RR) Case: Left rotation around grandparent.\n5. Left-Right (LR) Case: Left rotate child, then right rotate grandparent.\n6. Right-Left (RL) Case: Right rotate child, then left rotate grandparent.\n7. Time Complexity: Search, Insert, and Delete are all guaranteed O(log N).',
      },
    ],
    replies: [
      {
        id: 'rep-cs-01',
        postId: 'post-cs-01',
        authorId: 'student-02',
        authorName: 'Elena Rostova',
        authorRole: 'student',
        content: 'In the RL rotation diagram on page 4, why does the newly inserted node become the root of that subtree instead of the original parent?',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        aiVerification: {
          isStudyRelated: true,
          confidence: 0.99,
        },
      },
      {
        id: 'rep-cs-02',
        postId: 'post-cs-01',
        authorId: 'faculty-01',
        authorName: 'Dr. Alan Vance',
        authorRole: 'teacher',
        content: '@Elena Rostova Because the inner grandchild has an intermediate key value between the root and its right child. Rotating it upwards restores the BST ordering invariant on both sides!',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        replyToUser: 'Elena Rostova',
        isOfficialFacultyAnswer: true,
      },
    ],
  },
  {
    id: 'post-phy-01',
    classroomId: 'room-phy202',
    authorId: 'faculty-02',
    authorName: 'Prof. Sarah Chen',
    authorRole: 'teacher',
    title: 'Thermodynamics Carnot Cycle Equations & Derivation Sheet',
    content: 'Attached is the reference formula sheet for the reversible Carnot cycle: isothermal expansion, adiabatic expansion, isothermal compression, and adiabatic compression. Post any doubts regarding heat engine efficiency calculations below.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    postType: 'material',
    attachments: [
      {
        name: 'Carnot_Cycle_Formulas_and_Derivations.pdf',
        size: '1.8 MB',
        type: 'pdf',
        contentPreview: '=== CARNOT CYCLE DERIVATION SHEET ===\n1. Stage 1: Reversible Isothermal Gas Expansion at Th (Q_in = W_1 = nRT_h * ln(V2/V1)).\n2. Stage 2: Reversible Adiabatic Gas Expansion (T_h -> T_c, Q = 0).\n3. Stage 3: Reversible Isothermal Gas Compression at Tc (Q_out = nRT_c * ln(V3/V4)).\n4. Stage 4: Reversible Adiabatic Gas Compression (T_c -> T_h, Q = 0).\n5. Net Thermal Efficiency: eta = 1 - (T_c / T_h) = W_net / Q_in.\n6. Carnot Theorem: No engine operating between two heat reservoirs can be more efficient than a Carnot engine between the same reservoirs.',
      },
    ],
    replies: [],
  },
];

export class CommunityService {
  public getClassrooms(): ClassroomRoom[] {
    if (typeof window === 'undefined') return SEED_CLASSROOMS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLASSROOMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(SEED_CLASSROOMS));
    return SEED_CLASSROOMS;
  }

  public createClassroom(room: Omit<ClassroomRoom, 'id' | 'createdAt'>): ClassroomRoom {
    const newRoom: ClassroomRoom = {
      ...room,
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
      bannerColor: room.bannerColor || 'from-emerald-600 to-teal-800',
    };
    const current = this.getClassrooms();
    const updated = [newRoom, ...current];
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(updated));
    return newRoom;
  }

  public getPosts(classroomId?: string): CommunityPost[] {
    if (typeof window === 'undefined') return SEED_POSTS;
    let list: CommunityPost[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POSTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {}

    if (list.length === 0) {
      list = SEED_POSTS;
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(SEED_POSTS));
    }

    if (classroomId) {
      return list.filter((p) => p.classroomId === classroomId);
    }
    return list;
  }

  public createPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'replies'>): CommunityPost {
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    const all = this.getPosts();
    const updated = [newPost, ...all];
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
    return newPost;
  }

  public addReply(postId: string, reply: Omit<CommunityReply, 'id' | 'createdAt'>): CommunityReply {
    const newReply: CommunityReply = {
      ...reply,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const all = this.getPosts();
    const targetPost = all.find((p) => p.id === postId);
    if (targetPost) {
      targetPost.replies = [...targetPost.replies, newReply];
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(all));
    }
    return newReply;
  }

  public deletePost(postId: string): void {
    const all = this.getPosts();
    const filtered = all.filter((p) => p.id !== postId);
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(filtered));
  }

  /**
   * AI Study Guard: Verifies that a student message is coursework/study-related
   * before allowing publication. If non-study, returns false with an explanation.
   */
  public async verifyStudyRelatedness(
    text: string,
    postTitle?: string
  ): Promise<{ isStudyRelated: boolean; reason?: string }> {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return {
        isStudyRelated: false,
        reason: 'Please enter a substantive question, explanation, or doubt about the coursework.',
      };
    }

    // Fast heuristic detection of obvious off-topic content
    const lower = trimmed.toLowerCase();
    const nonStudyKeywords = [
      'fortnite', 'roblox', 'minecraft', 'discord nitro', 'crypto', 'bitcoin',
      'party tonight', 'hangout', 'insta', 'follow me', 'snapchat', 'tiktok',
      'dating', 'gossip', 'lol lmao haha', 'what games do you play',
      'selling', 'cheap price', 'free money', 'subscribe',
    ];

    const hasNonStudyTopic = nonStudyKeywords.some((kw) => lower.includes(kw));
    if (hasNonStudyTopic) {
      return {
        isStudyRelated: false,
        reason: 'Your message was flagged by AI Study Guard as unrelated to coursework. Community discussion is strictly reserved for academic questions, curriculum doubts, and study materials.',
      };
    }

    // Academic indicators
    const studyIndicators = [
      'how', 'why', 'what', 'solve', 'formula', 'theorem', 'proof', 'algorithm',
      'complexity', 'equation', 'chapter', 'lecture', 'assignment', 'exam', 'quiz',
      'question', 'doubt', 'concept', 'step', 'page', 'slide', 'diagram', 'example',
      'derive', 'calculate', 'definition', 'code', 'error', 'function', 'class',
      'time', 'space', 'tree', 'graph', 'physics', 'math', 'chemistry', 'biology',
      'professor', 'dr.', 'help', 'understand', 'explain', 'review', 'incur',
    ];

    const containsStudyIndicator = studyIndicators.some((word) => lower.includes(word));

    // If it has strong study indicators, immediately pass
    if (containsStudyIndicator || trimmed.length > 25) {
      return { isStudyRelated: true };
    }

    // Single-word or ambiguous phrases like "hi", "yo", "nice" without question/content
    if (trimmed.split(/\s+/).length <= 2) {
      return {
        isStudyRelated: false,
        reason: 'Your message is too brief or ambiguous. Please provide context about your academic doubt, concept question, or study inquiry.',
      };
    }

    return { isStudyRelated: true };
  }
}

export const communityService = new CommunityService();
