import { Assessment, AssessmentAttempt, Question } from '../types';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import { INITIAL_STUDENT_COHORT } from '../data/cohortData';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const SHARED_ASSESSMENTS_KEY = 'academic_shared_assessments';
export const SHARED_ATTEMPTS_KEY = 'academic_shared_attempts';

/**
 * Standard curriculum assessments pre-calibrated for MIT-WPU Computer Science & Engineering
 */
export const SEED_CURRICULUM_ASSESSMENTS: Assessment[] = [
  {
    assessmentId: 'ASM-CS201-MID',
    teacherId: 'demo_teacher_jenkins',
    title: 'CS201 Midterm Examination: Linear Structures & Search Invariants',
    subject: 'CS201 Data Structures & Algorithms',
    topics: ['Sorting & Selection', 'Dynamic Arrays', 'Search Invariants'],
    description: 'Proctored examination on recurrence proofs, asymptotic notation, array amortized bounds, and search invariants.',
    questionCount: 5,
    durationMinutes: 45,
    passingPercentage: 70,
    maxAttempts: 3,
    status: 'published',
    createdAt: '2026-10-01T10:00:00.000Z',
    questionIds: ['q-cs201-1', 'q-cs201-2', 'q-tree-1'],
    randomized: false,
  },
  {
    assessmentId: 'ASM-TREE-Q3',
    teacherId: 'demo_teacher_jenkins',
    title: 'CS201 Adaptive Diagnostic: Self-Balancing AVL & BST Rotations',
    subject: 'CS201 Data Structures & Algorithms',
    topics: ['Tree Data Structures', 'AVL Rotations', 'Binary Search'],
    description: 'Calibrated diagnostic covering tree height balance factors, single/double rotations, and binary search invariants.',
    questionCount: 5,
    durationMinutes: 30,
    passingPercentage: 70,
    maxAttempts: 3,
    status: 'published',
    createdAt: '2026-10-08T11:00:00.000Z',
    questionIds: ['q-tree-1', 'q-cs201-1'],
    randomized: false,
  },
];

/**
 * Seed questions bank for assessments - strictly verified and APPROVED institutional items
 */
export const SEED_CURRICULUM_QUESTIONS: Question[] = [
  // ==========================================
  // DYNAMIC ARRAYS & STRINGS (Easy, Medium, Hard)
  // ==========================================
  {
    questionId: 'q-arr-01',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'When amortized over n insertion operations, what is the amortized cost per append in a dynamically resizing array with doubling factor 2?',
    type: 'mcq',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(1)',
    explanation: 'By the accounting/potential method, doubling costs are paid for by preceding insertions, yielding constant amortized cost O(1).',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Dynamic Arrays & Strings',
    concept: 'Amortized Array Expansion',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-15T09:10:00.000Z',
  },
  {
    questionId: 'q-arr-02',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a fixed contiguous array of size n, what is the worst-case time complexity of inserting an element at index 0?',
    type: 'mcq',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    correctAnswer: 'O(n)',
    explanation: 'Inserting at the beginning requires shifting all n existing elements one position to the right, which takes linear O(n) time.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Dynamic Arrays & Strings',
    concept: 'Array Shifting Cost',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-15T09:15:00.000Z',
  },
  {
    questionId: 'q-arr-03',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the space complexity of the Two-Pointer approach when reversing an array of n elements in-place?',
    type: 'mcq',
    options: ['O(1) auxiliary space', 'O(n) auxiliary space', 'O(log n) auxiliary space', 'O(n²) auxiliary space'],
    correctAnswer: 'O(1) auxiliary space',
    explanation: 'An in-place two-pointer reversal only requires two integer pointer variables, needing O(1) extra auxiliary memory.',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Dynamic Arrays & Strings',
    concept: 'Two Pointer Technique',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-15T09:20:00.000Z',
  },
  {
    questionId: 'q-arr-04',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Which string-matching algorithm achieves optimal O(n + m) worst-case time complexity using a preprocessing prefix function (LPS table)?',
    type: 'mcq',
    options: ['Knuth-Morris-Pratt (KMP)', 'Rabin-Karp with naive hashing', 'Brute Force matcher', 'Boyer-Moore naive rule'],
    correctAnswer: 'Knuth-Morris-Pratt (KMP)',
    explanation: 'KMP precomputes the Longest Proper Prefix which is also Suffix (LPS) array in O(m) and matches the text in O(n) without back-tracking the text pointer.',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Dynamic Arrays & Strings',
    concept: 'KMP Prefix Invariants',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-15T09:25:00.000Z',
  },
  {
    questionId: 'q-arr-05',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a rolling hash Rabin-Karp substring search over alphabet size Σ with prime modulus Q, what is the tight worst-case time complexity when hash collisions occur maliciously at every candidate index?',
    type: 'mcq',
    options: ['O(n · m)', 'O(n + m)', 'O(n log m)', 'O(m²)'],
    correctAnswer: 'O(n · m)',
    explanation: 'When spurious hits occur at all n-m+1 positions, the algorithm falls back to character-by-character validation of length m, degrading to O(n · m).',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Dynamic Arrays & Strings',
    concept: 'Rabin-Karp Worst-Case Degeneracy',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-15T09:30:00.000Z',
  },
  {
    questionId: 'q-arr-06',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a dynamic array with resizing strategy of allocating n + 1 elements on each overflow rather than geometric doubling, what is the total cost of n successive append operations starting from an empty array?',
    type: 'mcq',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 'O(n²)',
    explanation: 'Copying 1 + 2 + 3 + ... + n elements produces an arithmetic progression sum of n(n+1)/2, degrading total time to O(n²), or O(n) per append.',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Dynamic Arrays & Strings',
    concept: 'Arithmetic vs Geometric Resizing',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-15T09:35:00.000Z',
  },

  // ==========================================
  // LINKED LISTS (Easy, Medium, Hard)
  // ==========================================
  {
    questionId: 'q-ll-01',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the time complexity of accessing an element at index k (where 0 < k < n) in a singly linked list?',
    type: 'mcq',
    options: ['O(k) traversal time', 'O(1) constant time', 'O(log k)', 'O(n²)'],
    correctAnswer: 'O(k) traversal time',
    explanation: 'Linked lists do not support random index calculation because nodes are not stored contiguously; accessing index k requires traversing k pointers.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Linked Lists',
    concept: 'Sequential Access Invariant',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-16T10:00:00.000Z',
  },
  {
    questionId: 'q-ll-02',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Given only a direct reference to the head node of a singly linked list, what is the time complexity to insert a new node at the very beginning (new head)?',
    type: 'mcq',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n - 1)'],
    correctAnswer: 'O(1)',
    explanation: 'Prepending a node requires only updating the newNode.next to head, and resetting the head pointer, taking O(1) constant time.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Linked Lists',
    concept: 'Constant Head Insertion',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-16T10:05:00.000Z',
  },
  {
    questionId: 'q-ll-03',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Which algorithm detects a cycle in a linked list using two pointers moving at different speeds (slow = 1 step, fast = 2 steps)?',
    type: 'mcq',
    options: ["Floyd's Tortoise and Hare Algorithm", "Dijkstra's Shortest Path", 'Tarjan SCC Algorithm', "Kruskal's Algorithm"],
    correctAnswer: "Floyd's Tortoise and Hare Algorithm",
    explanation: "Floyd's cycle detection advances the slow pointer by 1 and the fast pointer by 2. If a cycle exists, the relative gap decreases by 1 each step, guaranteeing they meet in O(n) time and O(1) space.",
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Linked Lists',
    concept: 'Cycle Detection Invariant',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-16T10:10:00.000Z',
  },
  {
    questionId: 'q-ll-04',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a doubly linked list with n nodes, what is the time complexity to delete a given node if you are directly provided with a pointer to that node?',
    type: 'mcq',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n/2)'],
    correctAnswer: 'O(1)',
    explanation: 'Because doubly linked list nodes possess both prev and next pointers, node.prev.next = node.next and node.next.prev = node.prev can be executed in O(1) without traversing from the head.',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Linked Lists',
    concept: 'Doubly Linked Deletion',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-16T10:15:00.000Z',
  },
  {
    questionId: 'q-ll-05',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a circular singly linked list containing n nodes, if slow and fast pointers meet inside a loop of length L, how do you locate the exact start node of the loop?',
    type: 'mcq',
    options: [
      'Reset slow to head, then advance both slow and fast by 1 step simultaneously until they collide',
      'Reset fast to head, then advance slow by 2 steps and fast by 1 step',
      'Keep fast stationary and advance slow by L steps',
      'Reverse all pointers in the cycle and count node traversals',
    ],
    correctAnswer: 'Reset slow to head, then advance both slow and fast by 1 step simultaneously until they collide',
    explanation: 'By the distance formula 2(k + m) = k + m + cL, the distance from head to loop entry equals the distance from the collision point to loop entry modulo L.',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Linked Lists',
    concept: 'Loop Entry Proof',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-16T10:20:00.000Z',
  },
  {
    questionId: 'q-ll-06',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the tightest theoretical upper bound for searching an element in an optimally constructed Skip List containing n keys?',
    type: 'mcq',
    options: ['O(log n) with high probability', 'O(1) strict worst case', 'O(n) average case', 'O(log² n) amortized'],
    correctAnswer: 'O(log n) with high probability',
    explanation: 'Using geometric coin flips to construct logarithmic levels of express pointers, Skip Lists guarantee O(log n) expected and high-probability search time.',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Linked Lists',
    concept: 'Skip List Layering',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-16T10:25:00.000Z',
  },

  // ==========================================
  // TREES & HIERARCHIES (Easy, Medium, Hard)
  // ==========================================
  {
    questionId: 'q-tree-01',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the maximum number of nodes in a binary tree of height h (where a root-only tree has height 0)?',
    type: 'mcq',
    options: ['2^(h + 1) - 1', '2^h', '2^h - 1', 'h^2'],
    correctAnswer: '2^(h + 1) - 1',
    explanation: 'Summing 2^0 + 2^1 + ... + 2^h yields a geometric sum of 2^(h+1) - 1 maximum nodes in a full binary tree.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Trees & Hierarchies',
    concept: 'Binary Tree Node Capacity',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-17T11:00:00.000Z',
  },
  {
    questionId: 'q-tree-02',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Which tree traversal order visits nodes in the sequence: Left Subtree, Root Node, Right Subtree?',
    type: 'mcq',
    options: ['In-order traversal', 'Pre-order traversal', 'Post-order traversal', 'Level-order traversal'],
    correctAnswer: 'In-order traversal',
    explanation: 'In-order traversal recursively visits the Left subtree, then Current root, then Right subtree.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Trees & Hierarchies',
    concept: 'In-order Traversal Order',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-17T11:05:00.000Z',
  },
  {
    questionId: 'q-tree-03',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the worst-case search time complexity in an unbalanced, strictly degenerate Binary Search Tree containing n nodes?',
    type: 'mcq',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    correctAnswer: 'O(n)',
    explanation: 'When keys are inserted in sorted order without rebalancing, a BST degrades into a linear chain identical to a linked list, requiring O(n) search time.',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Trees & Hierarchies',
    concept: 'Degenerate Tree Invariant',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-17T11:10:00.000Z',
  },
  {
    questionId: 'q-tree-04',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What sequence of rotations resolves a Right-Left (RL) balance factor imbalance upon inserting into an AVL tree?',
    type: 'mcq',
    options: [
      'Right rotation on the right child, then Left rotation on the root',
      'Single Left rotation around the unbalanced root',
      'Left rotation on the left child, then Right rotation on the root',
      'Double Right rotation on the root subtree',
    ],
    correctAnswer: 'Right rotation on the right child, then Left rotation on the root',
    explanation: 'An RL imbalance requires first right-rotating the child to align into RR, then left-rotating the parent to restore balance factor -1..+1.',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Trees & Hierarchies',
    concept: 'AVL Double Rotation',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-17T11:15:00.000Z',
  },
  {
    questionId: 'q-tree-05',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a Red-Black Tree, what is the maximum possible height of a tree containing n internal nodes?',
    type: 'mcq',
    options: ['2 · log2(n + 1)', 'log2(n + 1)', '3 · log2(n)', 'n / 2'],
    correctAnswer: '2 · log2(n + 1)',
    explanation: 'Because no red node can have a red child (red property), the longest root-to-leaf path contains alternating red and black nodes, bounding height by at most twice the black height: 2 · log2(n + 1).',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Trees & Hierarchies',
    concept: 'Red-Black Height Bound Proof',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-17T11:20:00.000Z',
  },
  {
    questionId: 'q-tree-06',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a B-Tree of minimum degree t ≥ 2, what is the minimum number of keys that every internal node (other than root) must contain?',
    type: 'mcq',
    options: ['t - 1 keys', 't keys', '2t - 1 keys', '2t keys'],
    correctAnswer: 't - 1 keys',
    explanation: 'By the fundamental B-Tree invariant, every node except root has at least t children and therefore at least t - 1 keys.',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Trees & Hierarchies',
    concept: 'B-Tree Minimum Degree Invariant',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-17T11:25:00.000Z',
  },

  // ==========================================
  // GRAPH ALGORITHMS (Easy, Medium, Hard)
  // ==========================================
  {
    questionId: 'q-graph-01',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Which core data structure does standard Breadth-First Search (BFS) utilize to manage discovered vertices in a graph?',
    type: 'mcq',
    options: ['FIFO Queue', 'LIFO Stack', 'Priority Heap', 'Hash Set only'],
    correctAnswer: 'FIFO Queue',
    explanation: 'BFS discovers nodes level by level using a FIFO Queue to ensure that shallower vertices are completely processed before examining their descendants.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    concept: 'BFS Queue Mechanism',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-18T12:00:00.000Z',
  },
  {
    questionId: 'q-graph-02',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In a graph with V vertices and E edges represented as an Adjacency Matrix, what is the auxiliary memory consumption?',
    type: 'mcq',
    options: ['O(V²)', 'O(V + E)', 'O(E²)', 'O(V · E)'],
    correctAnswer: 'O(V²)',
    explanation: 'An adjacency matrix allocates a 2D boolean or integer grid of size V × V, requiring O(V²) space regardless of how few edges exist.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    concept: 'Matrix Storage Bound',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-18T12:05:00.000Z',
  },
  {
    questionId: 'q-graph-03',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Which algorithm is best suited for computing single-source shortest paths in a directed graph with non-negative edge weights?',
    type: 'mcq',
    options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
    correctAnswer: "Dijkstra's Algorithm",
    explanation: "Dijkstra's Algorithm with a min-priority heap operates in O((V + E) log V) and is optimal for graphs with non-negative edge weights.",
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    concept: 'Shortest Path Invariant',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-18T12:10:00.000Z',
  },
  {
    questionId: 'q-graph-04',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'How can Depth-First Search (DFS) detect a directed cycle in a graph G = (V, E)?',
    type: 'mcq',
    options: [
      'By detecting a back edge to a vertex currently marked in the active recursion stack',
      'By counting the total number of connected components',
      'By identifying any cross edge between separate trees in the DFS forest',
      'By verifying that in-degree equals out-degree for all vertices',
    ],
    correctAnswer: 'By detecting a back edge to a vertex currently marked in the active recursion stack',
    explanation: 'A back edge connects a vertex to an active ancestor in the recursion call stack, proving a cycle exists in the directed graph.',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    concept: 'Cycle Detection with Back Edges',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-18T12:15:00.000Z',
  },
  {
    questionId: 'q-graph-05',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Why does standard Dijkstra’s algorithm fail to find the shortest path when a directed graph contains negative edge weights (even with no negative cycles)?',
    type: 'mcq',
    options: [
      'Its greedy choice property assumes that once a vertex distance is finalized, no future path can reduce that distance',
      'Min-priority queues cannot store negative integer keys',
      'It produces an infinite loop on the first negative edge',
      'The triangle inequality is strictly violated on all positive edges',
    ],
    correctAnswer: 'Its greedy choice property assumes that once a vertex distance is finalized, no future path can reduce that distance',
    explanation: 'Dijkstra permanently marks extracted vertices as finalized because non-negative edges ensure distances monotonically increase. A negative weight can retroactively shorten an already extracted vertex, violating the invariant.',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    concept: 'Greedy Invariant Violation with Negative Weights',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-18T12:20:00.000Z',
  },
  {
    questionId: 'q-graph-06',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'In Tarjan’s strongly connected components algorithm, what condition confirms that vertex u is the root of an SCC upon unwinding the DFS call stack?',
    type: 'mcq',
    options: ['lowlink[u] == disc[u]', 'lowlink[u] < disc[u]', 'disc[u] == 0', 'out_degree[u] == 0'],
    correctAnswer: 'lowlink[u] == disc[u]',
    explanation: 'If lowlink[u] == disc[u], no vertex in u’s DFS subtree has a back edge to any ancestor above u, proving u is the definitive head of the strongly connected component.',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    concept: 'Tarjan SCC Lowlink Invariant',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-18T12:25:00.000Z',
  },

  // ==========================================
  // SORTING & SELECTION (Easy, Medium, Hard)
  // ==========================================
  {
    questionId: 'q-sort-01',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the best-case time complexity of standard Insertion Sort when run on an array that is already completely sorted?',
    type: 'mcq',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 'O(n)',
    explanation: 'On an already sorted array, each element comparison immediately fails the while loop condition in 1 step, completing in O(n) linear time.',
    difficulty: 'easy',
    subject: 'Computer Science',
    topic: 'Sorting & Selection',
    concept: 'Adaptive Sorting Best-Case',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-19T09:00:00.000Z',
  },
  {
    questionId: 'q-sort-02',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'What is the tight asymptotic bound for finding the median in an unsorted array of n elements using Quickselect in the worst case?',
    type: 'mcq',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'],
    correctAnswer: 'O(n²)',
    explanation: 'Standard Quickselect with naive pivot selection hits worst-case O(n²) if partitions are continually skewed. Median-of-medians avoids this, but standard worst-case is O(n²).',
    difficulty: 'medium',
    subject: 'Computer Science',
    topic: 'Sorting & Selection',
    concept: 'Quickselect Recurrence',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-19T09:05:00.000Z',
  },
  {
    questionId: 'q-sort-03',
    teacherId: 'demo_teacher_jenkins',
    questionText: 'Why can no comparison-based sorting algorithm achieve a worst-case time complexity strictly better than Ω(n log n)?',
    type: 'mcq',
    options: [
      'The decision tree of comparisons has n! permutations as leaves, requiring a tree height of at least log2(n!) ≈ n log2(n) - n',
      'Array memory cannot be addressed in less than O(n log n) clock cycles',
      'Hardware cache misses introduce a log n factor per read',
      'The master theorem proves all divide-and-conquer recurrences are bounded by n log n',
    ],
    correctAnswer: 'The decision tree of comparisons has n! permutations as leaves, requiring a tree height of at least log2(n!) ≈ n log2(n) - n',
    explanation: 'Any comparison sort is modeled by a binary decision tree. Distinguishing between n! possible permutations requires minimum tree height ⌈log2(n!)⌉, which by Stirling approximation is Ω(n log n).',
    difficulty: 'hard',
    subject: 'Computer Science',
    topic: 'Sorting & Selection',
    concept: 'Information-Theoretic Sorting Bound',
    createdBy: 'teacher',
    status: 'approved',
    approvalStatus: 'approved',
    approvedBy: 'demo_teacher_jenkins',
    createdAt: '2026-09-19T09:10:00.000Z',
  },
];

/**
 * Get shared assessments across the entire institution.
 * Students see all published assessments; teachers/admins see all created + shared.
 */
export const getSynchronizedAssessments = (role?: string, userId?: string): Assessment[] => {
  let shared: Assessment[] = [];
  try {
    const raw = safeGetItem(SHARED_ASSESSMENTS_KEY, '[]');
    shared = JSON.parse(raw);
    if (!Array.isArray(shared) || shared.length === 0) {
      shared = [...SEED_CURRICULUM_ASSESSMENTS];
      safeSetItem(SHARED_ASSESSMENTS_KEY, JSON.stringify(shared));
    }
  } catch {
    shared = [...SEED_CURRICULUM_ASSESSMENTS];
  }

  // Deduplicate shared assessments
  const seenMap = new Map<string, Assessment>();
  shared.forEach((asm) => {
    if (asm && asm.assessmentId) {
      seenMap.set(asm.assessmentId, asm);
    }
  });

  // Also merge any personal assessments if user is a teacher
  if (userId) {
    try {
      const personalRaw = safeGetItem(`academic_assessments_${userId}`, '[]');
      const personal: Assessment[] = JSON.parse(personalRaw);
      if (Array.isArray(personal)) {
        personal.forEach((p) => {
          if (p && p.assessmentId && !seenMap.has(p.assessmentId)) {
            seenMap.set(p.assessmentId, p);
          }
        });
      }
    } catch {}
  }

  const result = Array.from(seenMap.values());
  if (role === 'student') {
    return result.filter((a) => a.status === 'published');
  }
  return result;
};

/**
 * Save an assessment into both the teacher's profile and the institution's shared registry
 */
export const saveSynchronizedAssessment = (
  assessment: Assessment,
  userId?: string
): Assessment[] => {
  const current = getSynchronizedAssessments('teacher', userId);
  const updated = [assessment, ...current.filter((a) => a.assessmentId !== assessment.assessmentId)];

  safeSetItem(SHARED_ASSESSMENTS_KEY, JSON.stringify(updated));
  if (userId) {
    safeSetItem(`academic_assessments_${userId}`, JSON.stringify(updated));
  }

  // Sync to Firestore in background
  try {
    setDoc(doc(db, 'assessments', assessment.assessmentId), assessment).catch(() => {});
  } catch {}

  return updated;
};

/**
 * Get synchronized attempts across the platform.
 * Students get their own attempts.
 * Teachers and Admins get attempts from all students in the cohort!
 */
export const getSynchronizedAttempts = (role?: string, userId?: string): AssessmentAttempt[] => {
  // 1. Load shared attempts
  let sharedAttempts: AssessmentAttempt[] = [];
  try {
    const raw = safeGetItem(SHARED_ATTEMPTS_KEY, '[]');
    sharedAttempts = JSON.parse(raw);
    if (!Array.isArray(sharedAttempts)) sharedAttempts = [];
  } catch {
    sharedAttempts = [];
  }

  // 2. If student: return their personal attempts
  if (role === 'student' && userId) {
    let personalAttempts: AssessmentAttempt[] = [];
    try {
      const rawPersonal = safeGetItem(`academic_attempts_${userId}`, '[]');
      personalAttempts = JSON.parse(rawPersonal);
    } catch {}
    if (Array.isArray(personalAttempts) && personalAttempts.length > 0) {
      return personalAttempts;
    }
    return sharedAttempts.filter((a) => a.studentId === userId);
  }

  // 3. If teacher or admin: return ALL attempts across the entire cohort!
  // Seed attempts from INITIAL_STUDENT_COHORT so teacher dashboard shows real analytics
  const cohortSeededAttempts: AssessmentAttempt[] = [];
  INITIAL_STUDENT_COHORT.forEach((student) => {
    (student.attemptHistory || []).forEach((att) => {
      cohortSeededAttempts.push({
        attemptId: `att-${att.id}-${student.id}`,
        assessmentId: att.id,
        assessmentTitle: att.title,
        studentId: student.id,
        studentName: student.name,
        questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
        startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'submitted',
        answers: {},
        score: att.score,
        percentage: att.percentage,
        passed: att.passed,
        proctoringViolationsCount: 0,
      });
    });
  });

  // Merge unique by attemptId
  const allAttempts = [...sharedAttempts];
  cohortSeededAttempts.forEach((cAtt) => {
    if (!allAttempts.some((a) => a.attemptId === cAtt.attemptId || (a.assessmentId === cAtt.assessmentId && a.studentId === cAtt.studentId))) {
      allAttempts.push(cAtt);
    }
  });

  // Strict deduplication by attemptId
  const seenAttemptIds = new Set<string>();
  const dedupedAttempts: AssessmentAttempt[] = [];
  allAttempts.forEach((att) => {
    const id = att.attemptId || `att-${att.assessmentId}-${att.studentId}`;
    if (!seenAttemptIds.has(id)) {
      seenAttemptIds.add(id);
      dedupedAttempts.push({ ...att, attemptId: id });
    }
  });

  return dedupedAttempts;
};

/**
 * Save an assessment attempt:
 * - Writes to student's own attempts
 * - Writes to shared central attempts so Teachers & Admins see it immediately
 * - Syncs to Firestore in background
 */
export const saveSynchronizedAttempt = (
  attempt: AssessmentAttempt,
  studentId: string
): AssessmentAttempt[] => {
  // 1. Personal student list
  let personalList: AssessmentAttempt[] = [];
  try {
    const raw = safeGetItem(`academic_attempts_${studentId}`, '[]');
    personalList = JSON.parse(raw);
    if (!Array.isArray(personalList)) personalList = [];
  } catch {}
  personalList = [attempt, ...personalList.filter((a) => a.attemptId !== attempt.attemptId)];
  safeSetItem(`academic_attempts_${studentId}`, JSON.stringify(personalList));

  // 2. Shared institutional attempts
  let sharedList: AssessmentAttempt[] = [];
  try {
    const raw = safeGetItem(SHARED_ATTEMPTS_KEY, '[]');
    sharedList = JSON.parse(raw);
    if (!Array.isArray(sharedList)) sharedList = [];
  } catch {}
  sharedList = [attempt, ...sharedList.filter((a) => a.attemptId !== attempt.attemptId)];
  safeSetItem(SHARED_ATTEMPTS_KEY, JSON.stringify(sharedList));

  // 3. Sync to Firestore in background
  try {
    setDoc(doc(db, 'attempts', attempt.attemptId), attempt).catch(() => {});
  } catch {}

  return personalList;
};
