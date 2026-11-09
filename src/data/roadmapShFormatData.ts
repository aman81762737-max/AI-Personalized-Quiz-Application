import { DetailedRoadmap } from './detailedRoadmapsData';

export interface RoadmapShTopicItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  colSpan?: 1 | 2;
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'doc';
    provider: string;
    durationOrReadTime?: string;
  }[];
}

export interface RoadmapShSubGroup {
  subTitle?: string;
  topics: RoadmapShTopicItem[];
}

export interface RoadmapShGroupContainer {
  id: string;
  groupTitle?: string;
  side: 'left' | 'right';
  topics: RoadmapShTopicItem[];
  subGroups?: RoadmapShSubGroup[];
}

export interface RoadmapShMilestone {
  id: string;
  milestoneTitle: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  spineSubtitle?: string;
  stepNumber?: number;
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'doc';
    provider: string;
    durationOrReadTime?: string;
  }[];
  leftContainer?: RoadmapShGroupContainer;
  rightContainer?: RoadmapShGroupContainer;
  fanOutRight?: RoadmapShTopicItem[];
  fanOutLeft?: RoadmapShTopicItem[];
}

export interface RoadmapShTrack {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  relatedRoadmaps: { id: string; title: string; completed?: boolean }[];
  milestones: RoadmapShMilestone[];
}

// =========================================================================
// 1. AI ENGINEER ROADMAP (Comprehensive, Beginner-Friendly & Intuitive)
// =========================================================================
export const AI_ENGINEER_ROADMAP_SH: RoadmapShTrack = {
  id: 'ai-ml',
  title: 'AI Engineer',
  tagline: 'Modern AI Engineering: LLMs, Prompting, Context, RAG & Agents',
  description: 'A step-by-step guide designed for beginners starting from scratch to master modern Artificial Intelligence. Understand how Large Language Models think, how to talk to them effectively, how to ground them in custom documents with RAG, and how to build autonomous agentic software.',
  badge: 'Frontier AI · 2026',
  relatedRoadmaps: [
    { id: 'vibe-coding', title: 'Vibe Coding' },
    { id: 'claude-code', title: 'Claude Code' },
    { id: 'prompt-eng', title: 'Prompt Engineering' },
    { id: 'inference-eng', title: 'Inference Engineering' },
    { id: 'forward-deployed', title: 'Forward Deployed Engineer' },
    { id: 'cs', title: 'Computer Science' },
    { id: 'fullstack', title: 'Full-Stack Developer' },
  ],
  milestones: [
    {
      id: 'ai-m1-intro',
      milestoneTitle: 'Introduction',
      category: 'Orientation & Foundations',
      difficulty: 'Beginner',
      estimatedHours: 6,
      stepNumber: 1,
      description: 'Welcome to AI Engineering! For decades, writing software meant writing strict, step-by-step rules ("if user clicks button A, do action B"). But foundation models introduce a completely new computing primitive: probabilistic reasoning engines that understand natural human language, images, and unstructured messy data. An AI Engineer is the software builder who harnesses these foundation models (like Gemini, Claude, and GPT-4) and wires them safely into reliable, lightning-fast real-world products. In this milestone, you will build your mental model of the AI ecosystem, understand your day-to-day role, and learn how AI transforms product development.',
      resources: [
        { title: 'The Rise of the AI Engineer (Mental Model Breakdown)', url: 'https://www.latent.space/p/ai-engineer', type: 'article', provider: 'Latent Space by Swyx', durationOrReadTime: '15 min read' },
        { title: 'AI Engineering in 100 Seconds', url: 'https://www.youtube.com/watch?v=2eWuYf-aZE4', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
        { title: 'State of AI & How to Learn in 2026', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', type: 'video', provider: 'Andrej Karpathy', durationOrReadTime: '45 mins' },
        { title: 'Roadmap.sh Official AI Engineer Roadmap Guide', url: 'https://roadmap.sh/ai-engineer', type: 'doc', provider: 'roadmap.sh', durationOrReadTime: 'Interactive Curriculum' },
      ],
      fanOutRight: [
        {
          id: 'ai-what-is',
          title: 'What is an AI Engineer?',
          category: 'Orientation',
          difficulty: 'Beginner',
          estimatedHours: 3,
          description: 'Imagine you want to build a self-driving car app, a medical document summarizer, or a coding assistant. Historically, you had two extremes: a Traditional Software Developer who wrote hardcoded logic, and a Machine Learning PhD Researcher who spent 6 months training raw neural networks with complex calculus and multi-million dollar GPU clusters.\n\nAn AI Engineer sits right in the high-impact middle. Instead of training raw models from scratch, an AI Engineer treats pre-trained foundation models (like GPT-4o, Claude 3.7, Gemini 2.5) as powerful cognitive building blocks. You connect these models to databases, write robust guardrails, evaluate output quality, chain complex reasoning steps together, and ship user-facing applications in weeks instead of years.',
          resources: [
            { title: 'What is an AI Engineer? (Complete Beginner Breakdown)', url: 'https://www.youtube.com/watch?v=2eWuYf-aZE4', type: 'video', provider: 'Fireship', durationOrReadTime: '3 mins' },
            { title: 'Why AI Engineering is the Fastest Growing Tech Discipline', url: 'https://www.latent.space/p/ai-engineer', type: 'article', provider: 'Latent Space', durationOrReadTime: '12 min read' },
          ],
        },
        {
          id: 'ai-roles-resp',
          title: 'Roles and Responsibilities',
          category: 'Orientation',
          difficulty: 'Beginner',
          estimatedHours: 4,
          description: 'What does an AI Engineer actually do on a typical workday? Unlike researchers who tune neural network loss functions, an AI Engineer focuses on product engineering:\n\n1. Prompt & Context Architecture: Crafting systematic instructions and feeding the model the exact information it needs.\n2. Knowledge Retrieval (RAG): Connecting the model to your company\'s live documents, PDFs, and SQL databases so it never hallucinates.\n3. Agentic Tool Calling: Giving the model "hands" by letting it call external APIs, send emails, or run code.\n4. Evaluation & Quality Guardrails: Building automated tests to verify that the model doesn\'t produce toxic answers, leak secrets, or hallucinate.\n5. Speed & Cost Optimization: Tuning caching, token limits, and model size so your app responds in under 500ms without draining your company budget.',
          resources: [
            { title: 'Day in the Life of an AI Engineer in 2026', url: 'https://www.youtube.com/results?search_query=day+in+the+life+ai+engineer', type: 'video', provider: 'Tech Lead Series', durationOrReadTime: '18 mins' },
            { title: 'AI Engineering Production Handbook', url: 'https://github.com/anthropics/anthropic-cookbook', type: 'doc', provider: 'Anthropic Cookbook', durationOrReadTime: 'Interactive Guide' },
          ],
        },
        {
          id: 'ai-impact-product',
          title: 'Impact on Product Development',
          category: 'Orientation',
          difficulty: 'Beginner',
          estimatedHours: 3,
          description: 'Generative AI changes the entire nature of software applications. In legacy apps, software was deterministic: if a user inputs "apple", you search a database for exact match "apple". If the user makes a typo or describes the feeling of eating fruit in autumn, the search bar returns 0 results.\n\nWith AI, software becomes semantic and cognitive: it understands meaning, intent, context, and emotion. Forms can be replaced with natural conversation, rigid search bars turn into personal research assistants, and complex 10-step workflows (like drafting a legal invoice or grading an exam) happen autonomously in seconds. Understanding this shift helps you design products users love rather than just slapping a random chatbot in the corner of a screen.',
          resources: [
            { title: 'How Generative AI is Reshaping UX & Products', url: 'https://www.youtube.com/watch?v=0pL4hU-H7oQ', type: 'video', provider: 'Y Combinator', durationOrReadTime: '22 mins' },
            { title: 'Designing Great AI Products: Lessons from OpenAI & Google', url: 'https://pair.withgoogle.com/guidebook/', type: 'doc', provider: 'Google PAIR', durationOrReadTime: 'Design Guide' },
          ],
        },
        {
          id: 'ai-vs-ml',
          title: 'AI Engineer vs ML Engineer',
          category: 'Orientation',
          difficulty: 'Beginner',
          estimatedHours: 4,
          description: 'Students often get confused between an AI Engineer and a Machine Learning (ML) Engineer. Here is the simple distinction:\n\n• Machine Learning Engineer:\nFocuses on the internal brain of the model. They write PyTorch or TensorFlow code, design neural network architectures, train on millions of GPU clusters, calculate loss functions, and optimize model weights. Requires heavy linear algebra, calculus, and data science.\n\n• AI Engineer:\nFocuses on the external application using the brain. You take ready-made foundation models (or fine-tuned open-source models like Llama) and integrate them into web, mobile, and enterprise stacks. You build vector search, prompt pipelines, API wrappers, and user interfaces. You need strong software engineering skills, API design, and system architecture rather than advanced mathematical proofs.',
          resources: [
            { title: 'AI Engineer vs ML Engineer: Which path should you choose?', url: 'https://www.youtube.com/results?search_query=ai+engineer+vs+ml+engineer', type: 'video', provider: 'Boris Cherny', durationOrReadTime: '12 mins' },
            { title: 'Comparing AI Engineering and ML Science Career Ladders', url: 'https://roadmap.sh/ai-engineer', type: 'article', provider: 'roadmap.sh', durationOrReadTime: 'Guide' },
          ],
        },
      ],
    },
    {
      id: 'ai-m2-how-llms-work',
      milestoneTitle: 'How LLMs Work',
      spineSubtitle: 'Working With LLMs',
      category: 'Model Foundations',
      difficulty: 'Beginner',
      estimatedHours: 10,
      stepNumber: 2,
      description: 'To control an AI model effectively, you must understand how its brain actually operates. Large Language Models (LLMs) do not possess consciousness or real human understanding. Instead, they are massive pattern-recognition systems trained on billions of sentences from the internet to master one single game: "Given this sequence of words, what is the single most probable word that comes next?" In this milestone, you will learn how text is converted into numbers (tokens), how models manage active memory (context), and how to tune mathematical dials (temperature, top-k, top-p) to make answers either rock-solid reliable or richly imaginative.',
      resources: [
        { title: 'Large Language Models Explained with Amazing Visuals', url: 'https://www.youtube.com/watch?v=LPZh9BOjkQs', type: 'video', provider: '3Blue1Brown', durationOrReadTime: '27 mins' },
        { title: 'Intro to Large Language Models (Beginner Friendly)', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', type: 'video', provider: 'Andrej Karpathy', durationOrReadTime: '60 mins' },
        { title: 'The Illustrated Transformer: Visual Step-by-Step Guide', url: 'https://jalammar.github.io/illustrated-transformer/', type: 'article', provider: 'Jay Alammar', durationOrReadTime: '20 min read' },
      ],
      leftContainer: {
        id: 'ai-core-elements',
        groupTitle: 'Core LLM Elements',
        side: 'left',
        topics: [
          {
            id: 'ai-tokens',
            title: 'Tokens',
            colSpan: 1,
            category: 'Core Elements',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Computers cannot understand human words, letters, or sentences directly — they only understand numbers. When you send text to an AI model, the system first runs a tool called a "tokenizer" that chops your text into small bite-sized building blocks called tokens.\n\nThink of tokens like the syllables or Lego bricks of language. A token can be a full short word (like "cat"), part of a longer word (like "un", "break", or "able" in "unbreakable"), a punctuation mark, or even a space. In the English language, 1 token is roughly equal to 4 characters, or about 0.75 words. For example, the sentence "Learning AI is fun!" is split into 5 tokens: ["Learn", "ing", " AI", " is", " fun!"].\n\nWhy is this so important for you to know?\n1. AI models generate responses one single token at a time in a continuous loop.\n2. Every model has a maximum token limit (its Context Window).\n3. Every API provider (OpenAI, Google, Anthropic) charges money based on the exact number of input tokens and output tokens.\n4. Tokenization explains why models sometimes struggle with word puzzles (like "how many \'r\'s are in strawberry?") — because the model sees the token "strawberry", not the individual letters!',
            resources: [
              { title: 'Tokens & Tokenization Explained Simply', url: 'https://www.youtube.com/watch?v=zduSFxRajkE', type: 'video', provider: 'Andrej Karpathy', durationOrReadTime: '15 mins' },
              { title: 'Interactive Tokenizer Playground (See words turn to tokens)', url: 'https://platform.openai.com/tokenizer', type: 'doc', provider: 'OpenAI Tools', durationOrReadTime: 'Live Interactive Tool' },
            ],
          },
          {
            id: 'ai-context',
            title: 'Context',
            colSpan: 1,
            category: 'Core Elements',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Imagine you are sitting at a study desk taking a difficult test. The size of your desk determines how many open textbooks, reference notes, and scratch papers you can look at simultaneously while solving a problem. In AI, this desk is called the "Context".\n\nContext is the entire conversation and background information provided to the model in a single prompt. When you chat with ChatGPT, the model doesn\'t actually remember your previous message through continuous conscious memory. Instead, behind the scenes, your app sends the entire history of past messages back to the model every single time you hit enter! Understanding context is key to knowing how to inject instructions, guidelines, user profiles, and reference documents into the model\'s active working memory.',
            resources: [
              { title: 'What is Context in Large Language Models?', url: 'https://www.youtube.com/results?search_query=what+is+context+window+llm', type: 'video', provider: 'AI Simplified', durationOrReadTime: '10 mins' },
              { title: 'Managing LLM Context Effectively', url: 'https://docs.anthropic.com/en/docs/build-with-claude/context-windows', type: 'doc', provider: 'Anthropic Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-sampling-params',
            title: 'Sampling Parameters',
            colSpan: 2,
            category: 'Inference',
            difficulty: 'Beginner',
            estimatedHours: 3,
            description: 'When an LLM generates the next word, it doesn\'t just pick one answer; it calculates a probability percentage for thousands of possible candidate words. For example, after "The sky is...", the model might score: "blue" (70%), "dark" (15%), "cloudy" (10%), and "green" (0.001%).\n\nSampling parameters are the mathematical dials and filters that you, the engineer, use to tell the model how to make its final choice from this list. Do you want it to always pick the #1 most predictable word every time (ideal for writing code and math formulas)? Or do you want it to explore creative, unusual words (ideal for brainstorming stories or marketing slogans)? By mastering Temperature, Top-K, and Top-P, you control the personality, accuracy, and creativity of your AI.',
            resources: [
              { title: 'Sampling Parameters Explained (Temperature, Top-P, Top-K)', url: 'https://www.youtube.com/watch?v=UqQzJ_Z3uO0', type: 'video', provider: 'IBM Technology', durationOrReadTime: '8 mins' },
              { title: 'Complete Guide to LLM Decoding Strategies', url: 'https://huggingface.co/blog/how-to-generate', type: 'article', provider: 'Hugging Face', durationOrReadTime: '15 min read' },
            ],
          },
          {
            id: 'ai-temperature',
            title: 'Temperature',
            colSpan: 2,
            category: 'Inference',
            difficulty: 'Beginner',
            estimatedHours: 3,
            description: 'Temperature is the single most common setting you will adjust in any AI API. It is a number typically between 0.0 and 2.0 (most commonly 0.0 to 1.0) that controls the "randomness" or "risk-taking" of the model:\n\n• Temperature = 0.0 (Laser-Focused & Deterministic):\nThe model behaves like a strict mathematician or code compiler. It will almost always choose the highest-probability next token. If you ask the same question 10 times, you will get the exact same answer 10 times. Always use 0.0 for writing code, JSON extraction, answering math questions, or grading student exams.\n\n• Temperature = 0.7 to 1.0 (Balanced & Conversational):\nGood for natural human conversation, helpful tutoring, and essay drafting. It allows pleasant variety without going off the rails.\n\n• Temperature = 1.2+ (Wild & Unpredictable):\nThe model takes high risks, picking lower-probability words. Can produce wild creative poetry, but risks making up nonsensical words or rambling.',
            resources: [
              { title: 'Temperature in LLMs Explained Visually', url: 'https://www.youtube.com/results?search_query=temperature+in+llms+explained', type: 'video', provider: 'StatQuest', durationOrReadTime: '10 mins' },
              { title: 'OpenAI API Temperature Guide', url: 'https://platform.openai.com/docs/guides/text-generation', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Official Guide' },
            ],
          },
          {
            id: 'ai-top-k',
            title: 'Top-K',
            colSpan: 1,
            category: 'Inference',
            difficulty: 'Intermediate',
            estimatedHours: 3,
            description: 'Top-K is a simple filtering rule: "Out of all 50,000+ words in the vocabulary, only consider the top K highest-probability words and completely ignore the rest."\n\nFor example, if you set Top-K = 40, the model sorts all words by likelihood and throws away everything below rank 40. This prevents the model from ever accidentally picking bizarre or nonsensical words that have a 0.0001% probability, ensuring high-quality and coherent text.',
            resources: [
              { title: 'Top-K vs Top-P: What is the difference?', url: 'https://www.youtube.com/results?search_query=top+k+vs+top+p+llm', type: 'video', provider: 'Fireship Shorts', durationOrReadTime: '5 mins' },
              { title: 'Hugging Face Parameter Guide', url: 'https://huggingface.co/docs/transformers/generation_strategies', type: 'doc', provider: 'Hugging Face', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-top-p',
            title: 'Top-P',
            colSpan: 1,
            category: 'Inference',
            difficulty: 'Intermediate',
            estimatedHours: 3,
            description: 'Top-P (also called "Nucleus Sampling") is a smarter, dynamic version of Top-K. Instead of picking a fixed number of words (like top 40), Top-P sets a cumulative probability threshold (usually 0.9 or 90%).\n\nImagine the model is predicting the next word after "I had a cup of...". Words like "coffee" (60%) and "tea" (32%) already sum up to 92%. Because that exceeds 90%, the model dynamically stops and only considers those two obvious choices! But if the context is ambiguous with many possibilities, the pool dynamically widens to 20 words until their sum reaches 90%. In practice, setting Top-P = 0.9 and Temperature = 0.7 produces natural, fluid human-like speech.',
            resources: [
              { title: 'Nucleus Sampling (Top-P) Explained', url: 'https://www.youtube.com/results?search_query=top+p+nucleus+sampling', type: 'video', provider: 'AI Coffee Break', durationOrReadTime: '12 mins' },
              { title: 'Anthropic Model Parameter Best Practices', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', type: 'doc', provider: 'Anthropic Guide', durationOrReadTime: 'Guide' },
            ],
          },
        ],
      },
      rightContainer: {
        id: 'ai-common-terminology',
        groupTitle: 'Common Terminology',
        side: 'right',
        topics: [
          {
            id: 'ai-vs-agi',
            title: 'AI vs AGI',
            colSpan: 2,
            category: 'Foundations',
            difficulty: 'Beginner',
            estimatedHours: 2,
            description: 'You will hear these two acronyms everywhere in the tech industry:\n\n• Artificial Narrow Intelligence (ANI / Current AI):\nEvery AI tool that exists today is Narrow AI. It excels at specific tasks — like translating English to Spanish, writing Python functions, or spotting cancer in X-rays — but it cannot independently decide to buy groceries, invent new physics, or live in the real world. It has no continuous consciousness or goals outside its prompt.\n\n• Artificial General Intelligence (AGI):\nThe hypothetical future threshold where an AI system matches or exceeds human intellectual capability across virtually every economically valuable task, including autonomous scientific discovery, learning any skill on the fly, and adapting to novel environments.',
            resources: [
              { title: 'What is AGI and when will it arrive?', url: 'https://www.youtube.com/watch?v=5q87K1WaoFI', type: 'video', provider: 'ColdFusion', durationOrReadTime: '18 mins' },
              { title: 'OpenAI Charter and AGI Safety Guidelines', url: 'https://openai.com/charter', type: 'article', provider: 'OpenAI', durationOrReadTime: 'Whitepaper' },
            ],
          },
          {
            id: 'ai-llm-term',
            title: 'Large Language Model (LLM)',
            colSpan: 2,
            category: 'Foundations',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'A Large Language Model (LLM) is a massive artificial neural network based on the Transformer architecture. What makes it "Large"? Two things:\n\n1. Parameters (Synapses): Modern models have between 7 billion to over 1 trillion parameters (weights) that were tuned during training.\n2. Training Data: They read virtually the entire public internet, millions of books, scientific journals, and open-source code repositories.\nBecause of this colossal scale, LLMs develop what researchers call "emergent capabilities" — the ability to reason, write jokes, debug complex code, solve math riddles, and translate between languages without needing hardcoded programming rules for each task.',
            resources: [
              { title: 'Large Language Models in 5 Minutes', url: 'https://www.youtube.com/watch?v=2eWuYf-aZE4', type: 'video', provider: 'Fireship', durationOrReadTime: '5 mins' },
              { title: 'Transformers: The Architecture Behind LLMs', url: 'https://jalammar.github.io/illustrated-transformer/', type: 'doc', provider: 'Illustrated Guide', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'ai-embeddings-term',
            title: 'Embeddings',
            colSpan: 1,
            category: 'Terminology',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Embeddings are the "GPS coordinates of human thought". When you search for something in traditional software, computers look for exact keyword matches. But if you search "puppy", you also want results for "dog", "canine", and "golden retriever" — even if the word "puppy" doesn\'t appear!\n\nAn embedding model reads any piece of text (a word, a paragraph, or a document) and converts it into a list of numbers (a vector, e.g. [0.24, -0.81, 0.55...]). In this mathematical space, concepts with similar meanings are placed close together. For example, "king" and "queen" will be right next to each other, while "airplane" will be far away. Embeddings are the secret sauce behind modern search engines, recommendation systems, and RAG.',
            resources: [
              { title: 'What are Vector Embeddings? Visual Explanation', url: 'https://www.youtube.com/watch?v=gQddtTdmG_8', type: 'video', provider: 'StatQuest', durationOrReadTime: '15 mins' },
              { title: 'OpenAI Embeddings Guide & Use Cases', url: 'https://platform.openai.com/docs/guides/embeddings', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Official Spec' },
            ],
          },
          {
            id: 'ai-training-term',
            title: 'Training',
            colSpan: 1,
            category: 'Terminology',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Training is the intensive, expensive process where a model actually learns. It happens in two major phases:\n\n1. Pre-Training (Self-Supervised Learning):\nThe raw model reads trillions of words and practices predicting the next token over and over. This costs tens of millions of dollars in electricity and GPUs, resulting in a "Base Model" (which knows facts, but talks like raw internet text).\n\n2. Post-Training & Alignment (RLHF / Instruction Tuning):\nHuman trainers teach the model how to be a helpful, polite assistant. If you ask "How do I make coffee?", the base model might just repeat the question, while the aligned assistant actually gives you step-by-step instructions and politely refuses dangerous requests.',
            resources: [
              { title: 'How ChatGPT is Trained from Scratch', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', type: 'video', provider: 'Andrej Karpathy', durationOrReadTime: '40 mins' },
              { title: 'RLHF: Reinforcement Learning from Human Feedback', url: 'https://huggingface.co/blog/rlhf', type: 'article', provider: 'Hugging Face', durationOrReadTime: '18 min read' },
            ],
          },
          {
            id: 'ai-inference-term',
            title: 'Inference',
            colSpan: 1,
            category: 'Terminology',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'While "training" is learning the textbook before the exam, "inference" is actually sitting down and answering a question during the exam.\n\nIn software, inference means sending a prompt to the model and having it compute matrix multiplications through its billions of weights to generate the response tokens in real-time. Inference requires specialized GPU hardware (like Nvidia H100s) and generates latency (delay), which is why AI Engineers spend significant time optimizing streaming and caching.',
            resources: [
              { title: 'Training vs Inference in 3 Minutes', url: 'https://www.youtube.com/results?search_query=training+vs+inference+machine+learning', type: 'video', provider: 'Simplilearn', durationOrReadTime: '5 mins' },
              { title: 'Production Inference Optimization Guide', url: 'https://vllm.ai/', type: 'doc', provider: 'vLLM Docs', durationOrReadTime: 'Technical Guide' },
            ],
          },
          {
            id: 'ai-vectordb-term',
            title: 'Vector DBs',
            colSpan: 1,
            category: 'Terminology',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'A Vector Database (like Pinecone, ChromaDB, or Qdrant) is a specialized database built to store and search through millions of embeddings at lightning speed.\n\nUnlike SQL databases (which search for exact matches like "WHERE id = 5"), a Vector DB finds the nearest conceptual neighbors (Approximate Nearest Neighbors). If a user asks "How do I fix a leaky pipe?", the Vector DB instantly finds company manuals about plumbing repair even if they use different terminology.',
            resources: [
              { title: 'Vector Databases in 100 Seconds', url: 'https://www.youtube.com/watch?v=klTvEwg3oJ4', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Pinecone Vector Database Architecture Guide', url: 'https://www.pinecone.io/learn/vector-database/', type: 'article', provider: 'Pinecone Learning Center', durationOrReadTime: '15 min read' },
            ],
          },
          {
            id: 'ai-agents-term',
            title: 'AI Agents',
            colSpan: 1,
            category: 'Terminology',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'A standard LLM is like a brain trapped in a jar: it can talk to you, but it cannot look at the clock, check your bank balance, or book a flight. An AI Agent gives the model hands, eyes, and tools.\n\nAn agent runs in a continuous loop: it evaluates your goal, breaks it down into a plan, calls real-world software tools (like running a web search, querying a database, or executing a Python script), reads the output observation, and decides what to do next until your goal is completely fulfilled.',
            resources: [
              { title: 'AI Agents Explained: What are they and how do they work?', url: 'https://www.youtube.com/watch?v=F8NKVhkZZWI', type: 'video', provider: 'Dave Ebbelaar', durationOrReadTime: '18 mins' },
              { title: 'Building Effective Agents: Anthropic Guide', url: 'https://www.anthropic.com/research/building-effective-agents', type: 'doc', provider: 'Anthropic Research', durationOrReadTime: 'Research Paper' },
            ],
          },
          {
            id: 'ai-rags-term',
            title: 'RAGs',
            colSpan: 1,
            category: 'Terminology',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'RAG stands for Retrieval-Augmented Generation. Think of an ordinary LLM like a student taking a closed-book history test: it can only answer based on what it memorized months ago during training. If you ask about your private company policies or news from yesterday, it will either guess and make things up (hallucinate) or say it doesn\'t know.\n\nRAG turns the test into an open-book exam! When a user asks a question, your app first searches your private database or documents, grabs the 3 most relevant pages, and pastes them directly into the prompt: "Using ONLY these 3 pages, answer the user\'s question." The model reads the fresh facts and generates an accurate, hallucination-free answer with exact citations.',
            resources: [
              { title: 'RAG from Scratch: Complete Visual Guide', url: 'https://www.youtube.com/watch?v=wXhhRgt_W7Y', type: 'video', provider: 'LangChain', durationOrReadTime: '20 mins' },
              { title: 'What is RAG? (Retrieval-Augmented Generation)', url: 'https://aws.amazon.com/what-is/retrieval-augmented-generation/', type: 'article', provider: 'AWS Architecture', durationOrReadTime: '10 min read' },
            ],
          },
          {
            id: 'ai-context-window-term',
            title: 'Context Window',
            colSpan: 2,
            category: 'Terminology',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'The Context Window is the maximum amount of text (measured in tokens) that an AI model can hold in its active memory at one time, including your prompt and its answer.\n\nEarly models had tiny context windows (e.g. 4,000 tokens ≈ 3 pages of text). Today, frontier models boast context windows ranging from 128,000 tokens (approx. an entire 300-page novel) up to 2,000,000 tokens in Gemini 1.5/2.0 (approx. 1 hour of video or entire software codebases!). However, larger context windows cost more money and can suffer from "needle in a haystack" attention fatigue, so choosing the right context size is a key engineering decision.',
            resources: [
              { title: 'The Power of Long Context Windows in AI', url: 'https://www.youtube.com/results?search_query=long+context+window+llm', type: 'video', provider: 'Google Developers', durationOrReadTime: '14 mins' },
              { title: 'Managing Large Contexts in Production', url: 'https://platform.openai.com/docs/guides/optimizing-llm-accuracy', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-finetuning-term',
            title: 'Fine-tuning',
            colSpan: 2,
            category: 'Terminology',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Fine-tuning is the process of taking an already trained model and adjusting its internal weights on hundreds or thousands of high-quality examples of a specific task.\n\nWhen should you use fine-tuning instead of prompt engineering?\n• Prompt engineering is best for teaching the model WHAT facts to know.\n• Fine-tuning is best for teaching the model HOW to speak, format, or behave.\nFor example, if you want a model to consistently reply in strict medical ICD-10 billing codes or adopt the exact stylistic tone of your customer service team, fine-tuning permanently burns that behavior into the model weights, saving token costs on every single request.',
            resources: [
              { title: 'Fine-tuning LLMs Explained (LoRA & QLoRA)', url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos', type: 'video', provider: 'Yannic Kilcher', durationOrReadTime: '24 mins' },
              { title: 'OpenAI Fine-Tuning Step-by-Step Guide', url: 'https://platform.openai.com/docs/guides/fine-tuning', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Official Guide' },
            ],
          },
          {
            id: 'ai-prompt-eng-term',
            title: 'Prompt Engineering',
            colSpan: 2,
            category: 'Terminology',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Prompt Engineering is the practice of designing, structuring, and optimizing natural language instructions given to an LLM to reliably produce the exact desired output without ambiguity, hallucinations, or formatting errors.\n\nFar from just "talking to a chatbot", professional prompt engineering involves system roles, few-shot demonstration examples, XML delimiters, markdown formatting, chain-of-thought triggers, and strict JSON schemas to ensure enterprise-grade reliability.',
            resources: [
              { title: 'Prompt Engineering Course by DeepLearning.AI', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', type: 'article', provider: 'Andrew Ng', durationOrReadTime: '1 hour course' },
              { title: 'Anthropic Prompt Engineering Interactive Tutorial', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', type: 'doc', provider: 'Anthropic', durationOrReadTime: 'Interactive Tutorial' },
            ],
          },
          {
            id: 'ai-inference-eng-term',
            title: 'Inference Engineering',
            colSpan: 2,
            category: 'Terminology',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Inference Engineering is the discipline of optimizing how models execute in production to reduce latency (time to first token) and cut cloud GPU expenses. Techniques include:\n\n1. KV Caching: Storing previously computed attention keys so the model doesn\'t re-read prompts from scratch on every word.\n2. Quantization: Compressing 16-bit floating point numbers down to 4-bit or 8-bit integers so models fit on cheaper GPUs.\n3. Speculative Decoding: Using a tiny fast model to draft words and a giant model to approve them in batches.',
            resources: [
              { title: 'Inference Engineering & vLLM Architecture', url: 'https://www.youtube.com/watch?v=5z3eK1O5E_w', type: 'video', provider: 'Hugging Face Talks', durationOrReadTime: '30 mins' },
              { title: 'vLLM: High-Throughput and Low-Latency Serving', url: 'https://github.com/vllm-project/vllm', type: 'doc', provider: 'vLLM Project', durationOrReadTime: 'Open Source Repo' },
            ],
          },
        ],
      },
    },
    {
      id: 'ai-m3-prompt-eng',
      milestoneTitle: 'Prompt Engineering',
      category: 'Prompt Craft & Delimiters',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 3,
      description: 'Master the craft of instructing artificial intelligence with precision. In this milestone, you will graduate from casual chatting to writing production-ready prompt systems. Learn how to establish persona boundaries, enforce RFC-compliant JSON Schema outputs for seamless frontend integration, and apply reasoning techniques (like Few-Shot and Chain-of-Thought) that dramatically increase model accuracy.',
      resources: [
        { title: 'Prompt Engineering Masterclass (Beginner to Advanced)', url: 'https://www.youtube.com/watch?v=jC4v5AS4RIM', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '45 mins' },
        { title: 'OpenAI Official Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Best Practices' },
        { title: 'Anthropic Prompt Design Handbook', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', type: 'article', provider: 'Anthropic', durationOrReadTime: '20 min read' },
      ],
      leftContainer: {
        id: 'ai-prompt-architecture',
        groupTitle: 'Prompt Architecture',
        side: 'left',
        topics: [
          {
            id: 'ai-input-format',
            title: 'Input Format',
            colSpan: 2,
            category: 'Prompting',
            difficulty: 'Beginner',
            estimatedHours: 3,
            description: 'How you format your prompt directly dictates how the model\'s attention mechanism focuses. When you dump messy, unformatted text into a prompt, the model easily confuses your instructions with user data.\n\nBy using clean delimiters — such as XML tags (<instructions>, <context>, <examples>), Markdown headers (#, ##), and triple backticks (```) — you create clear boundaries that prevent prompt confusion and make outputs 10x more predictable.',
            resources: [
              { title: 'Why XML Tags Make Claude & GPT 10x Smarter', url: 'https://www.youtube.com/watch?v=v21tG_gAOxk', type: 'video', provider: 'AI Jason', durationOrReadTime: '12 mins' },
              { title: 'Structuring Prompts with Markdown & XML', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags', type: 'doc', provider: 'Anthropic Guide', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-system-prompting',
            title: 'System Prompting',
            colSpan: 2,
            category: 'Prompting',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'In modern API architectures, conversations are split into three roles: System, User, and Assistant.\n\nThe System Prompt is the foundational constitution of your application. It is fed to the model before any user message. It defines who the AI is, what rules it MUST never violate, what format it must output, and what tone it should take. Because system prompts have high authority in the model\'s attention hierarchy, they are your primary tool for establishing safety and brand consistency.',
            resources: [
              { title: 'How to Write the Perfect System Prompt', url: 'https://www.youtube.com/watch?v=1F3Tz9uX4p4', type: 'video', provider: 'Liam Ottley', durationOrReadTime: '15 mins' },
              { title: 'System Prompt Best Practices and Real Examples', url: 'https://platform.openai.com/docs/guides/text-generation/system-messages', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Official Guide' },
            ],
          },
          {
            id: 'ai-role-behavior',
            title: 'Role & Behavior',
            colSpan: 2,
            category: 'Prompting',
            difficulty: 'Beginner',
            estimatedHours: 3,
            description: 'Instructing the model to adopt a specific persona drastically changes its vocabulary, tone, and reasoning depth. Contrast telling an AI:\n"Explain quantum physics" vs "You are a patient Nobel-prize winning physics professor teaching a 10-year-old child using kitchen cooking analogies."\nBy assigning explicit expertise, target audience, and refusal policies, you eliminate bland generic corporate answers and get sharp, tailored results.',
            resources: [
              { title: 'Persona & Role Prompting Guide', url: 'https://www.youtube.com/results?search_query=role+prompting+llm', type: 'video', provider: 'Prompt Engineering Institute', durationOrReadTime: '10 mins' },
              { title: 'Google Gemini Prompt Crafting Handbook', url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies', type: 'doc', provider: 'Google AI Studio', durationOrReadTime: 'Handbook' },
            ],
          },
          {
            id: 'ai-prompt-context',
            title: 'Context',
            colSpan: 1,
            category: 'Prompting',
            difficulty: 'Beginner',
            estimatedHours: 3,
            description: 'Feeding the model the exact background facts, user profile data, recent orders, or documentation excerpts it needs to answer the question accurately without guessing.',
            resources: [
              { title: 'Injecting Dynamic Context into Prompts', url: 'https://www.youtube.com/watch?v=0l4gU7s_4l4', type: 'video', provider: 'LangChain Tutorials', durationOrReadTime: '14 mins' },
              { title: 'Context Window Optimization', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', type: 'doc', provider: 'Anthropic Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'ai-prompt-constraints',
            title: 'Constraints',
            colSpan: 1,
            category: 'Prompting',
            difficulty: 'Beginner',
            estimatedHours: 3,
            description: 'Negative constraints, length limits, banned tokens, and strict validation criteria that keep the model focused and prevent unwanted rambling.',
            resources: [
              { title: 'Setting Negative Constraints in Prompts', url: 'https://www.youtube.com/results?search_query=setting+constraints+in+prompts', type: 'video', provider: 'Prompt Engineering Series', durationOrReadTime: '8 mins' },
              { title: 'Constraint Prompting Guidelines', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'Best Practices' },
            ],
          },
          {
            id: 'ai-structured-output',
            title: 'Structured Output',
            colSpan: 2,
            category: 'Prompting',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'If you want your React frontend or Node.js server to parse AI responses, you cannot accept freeform prose like "Sure! Here is your answer: ...". You need 100% guaranteed, RFC-compliant JSON that matches a strict TypeScript or Zod schema.\n\nModern APIs provide "Structured Outputs" with JSON Schema enforcement. The model\'s output logits are constrained at generation time so that it literally cannot emit an invalid bracket, missing key, or wrong type.',
            resources: [
              { title: 'OpenAI Structured Outputs (100% Reliable JSON)', url: 'https://www.youtube.com/watch?v=b4O5_7yQ1y4', type: 'video', provider: 'Fireship', durationOrReadTime: '6 mins' },
              { title: 'Structured Outputs API Guide with Zod', url: 'https://platform.openai.com/docs/guides/structured-outputs', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'API Specification' },
            ],
          },
        ],
        subGroups: [
          {
            subTitle: 'Prompting Techniques',
            topics: [
              {
                id: 'ai-zero-shot',
                title: 'Zero-Shot',
                colSpan: 1,
                category: 'Techniques',
                difficulty: 'Beginner',
                estimatedHours: 2,
                description: 'Direct instruction with no prior worked examples. You simply state the task: "Translate this sentence to French: ...". Great for simple tasks.',
                resources: [
                  { title: 'Zero-Shot vs Few-Shot Prompting Explained', url: 'https://www.youtube.com/watch?v=dOxUroR57WU', type: 'video', provider: 'IBM Technology', durationOrReadTime: '7 mins' },
                  { title: 'Prompt Engineering Guide: Zero-Shot', url: 'https://www.promptingguide.ai/techniques/zeroshot', type: 'doc', provider: 'DAIR.AI', durationOrReadTime: 'Guide' },
                ],
              },
              {
                id: 'ai-few-shot',
                title: 'Few-Shot',
                colSpan: 1,
                category: 'Techniques',
                difficulty: 'Beginner',
                estimatedHours: 3,
                description: 'Providing 2 to 5 high-quality input/output demonstration pairs before the target query. Showing the model examples of your exact desired tone and edge cases is the single most effective way to improve output consistency.',
                resources: [
                  { title: 'The Power of Few-Shot Examples in Prompts', url: 'https://www.youtube.com/results?search_query=few+shot+prompting+tutorial', type: 'video', provider: 'AI Explained', durationOrReadTime: '11 mins' },
                  { title: 'Few-Shot Prompting Technique Guide', url: 'https://www.promptingguide.ai/techniques/fewshot', type: 'doc', provider: 'DAIR.AI', durationOrReadTime: 'Guide' },
                ],
              },
              {
                id: 'ai-react-prompt',
                title: 'ReAct',
                colSpan: 1,
                category: 'Techniques',
                difficulty: 'Intermediate',
                estimatedHours: 4,
                description: 'Reasoning and Acting: prompting the model to alternate between Thought, Action, and Observation before giving the final answer.',
                resources: [
                  { title: 'ReAct Prompting: How AI Thinks and Acts', url: 'https://www.youtube.com/watch?v=Eug2ClVQ11o', type: 'video', provider: 'LangChain', durationOrReadTime: '15 mins' },
                  { title: 'ReAct Paper & Implementation Guide', url: 'https://react-lm.github.io/', type: 'article', provider: 'Princeton / Google Research', durationOrReadTime: 'Paper' },
                ],
              },
              {
                id: 'ai-cot-prompt',
                title: 'CoT',
                colSpan: 1,
                category: 'Techniques',
                difficulty: 'Intermediate',
                estimatedHours: 4,
                description: 'Chain-of-Thought: prompting the model with "Think step by step" or asking it to write its scratchpad calculations before writing the final conclusion.',
                resources: [
                  { title: 'Chain of Thought Prompting Explained Simply', url: 'https://www.youtube.com/watch?v=3qZ5R8jC9qE', type: 'video', provider: 'StatQuest', durationOrReadTime: '12 mins' },
                  { title: 'Chain-of-Thought Guide on PromptingGuide.ai', url: 'https://www.promptingguide.ai/techniques/cot', type: 'doc', provider: 'DAIR.AI', durationOrReadTime: 'Guide' },
                ],
              },
            ],
          },
          {
            subTitle: 'Model Interaction',
            topics: [
              {
                id: 'ai-direct-chat',
                title: 'Direct Chat',
                colSpan: 1,
                category: 'Interaction',
                difficulty: 'Beginner',
                estimatedHours: 2,
                description: 'Streaming conversational multi-turn state via standard chat completions API with message role arrays.',
                resources: [
                  { title: 'Building a Chatbot with Streaming Responses', url: 'https://www.youtube.com/watch?v=mkoxchE0f3A', type: 'video', provider: 'Vercel', durationOrReadTime: '15 mins' },
                  { title: 'OpenAI Chat Completions API Reference', url: 'https://platform.openai.com/docs/api-reference/chat', type: 'doc', provider: 'OpenAI Docs', durationOrReadTime: 'API Docs' },
                ],
              },
              {
                id: 'ai-tool-interaction',
                title: 'Function Calling',
                colSpan: 1,
                category: 'Interaction',
                difficulty: 'Intermediate',
                estimatedHours: 5,
                description: 'Declarative OpenAPI / JSON Schema tool definitions that the model invokes programmatically when it needs external computation or live data.',
                resources: [
                  { title: 'Function Calling in 10 Minutes (Live Code)', url: 'https://www.youtube.com/watch?v=0lxnpH_H7YI', type: 'video', provider: 'Fireship', durationOrReadTime: '10 mins' },
                  { title: 'Function Calling and Tool Use Guide', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', type: 'doc', provider: 'Anthropic Docs', durationOrReadTime: 'Guide' },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'ai-m4-context-eng',
      milestoneTitle: 'Context Engineering',
      category: 'Context Architecture',
      difficulty: 'Intermediate',
      estimatedHours: 8,
      stepNumber: 4,
      description: 'While Prompt Engineering is about what you say to the model, Context Engineering is about what dynamic information you deliver to the model so it can reason with factual accuracy. Learn how to design context layers, integrate Anthropic\'s Model Context Protocol (MCP), enforce context security to prevent prompt injection attacks, and apply compaction algorithms to stay within token budgets.',
      resources: [
        { title: 'What is Context Engineering? The Next Frontier Beyond Prompts', url: 'https://www.youtube.com/watch?v=Bq3wK_3Q2qA', type: 'video', provider: 'Latent Space', durationOrReadTime: '35 mins' },
        { title: 'Anthropic Model Context Protocol (MCP) Official Spec', url: 'https://modelcontextprotocol.io/', type: 'doc', provider: 'Anthropic Spec', durationOrReadTime: 'Official Documentation' },
        { title: 'Defending Against Prompt Injection and Jailbreaks', url: 'https://simonwillison.net/series/prompt-injection/', type: 'article', provider: 'Simon Willison', durationOrReadTime: 'Security Series' },
      ],
      rightContainer: {
        id: 'ai-context-fundamentals',
        groupTitle: 'Fundamentals',
        side: 'right',
        topics: [
          {
            id: 'ai-context-vs-prompt',
            title: 'Context vs Prompt Eng.',
            colSpan: 2,
            category: 'Context',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Prompt engineering is the instructional framing: how you ask the question, what tone you request, and what rules you set. Context engineering is the information architecture: dynamically querying SQL databases, fetching live weather APIs, reading PDF extracts, and feeding that exact grounded knowledge into the prompt so the model never has to hallucinate.',
            resources: [
              { title: 'Prompt Engineering vs Context Engineering Explained', url: 'https://www.youtube.com/results?search_query=context+engineering+vs+prompt+engineering', type: 'video', provider: 'AI Architect Series', durationOrReadTime: '12 mins' },
              { title: 'Designing High-Precision Context Layers', url: 'https://www.latent.space/p/context-layer', type: 'article', provider: 'Latent Space', durationOrReadTime: '15 min read' },
            ],
          },
          {
            id: 'ai-context-layer',
            title: 'What is a Context Layer?',
            colSpan: 2,
            category: 'Context',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'The software architecture that dynamically gathers, filters, reranks, and compresses knowledge from across your company\'s databases and APIs before feeding it to the model.',
            resources: [
              { title: 'Building a Production Context Layer for AI', url: 'https://www.youtube.com/results?search_query=building+a+context+layer+for+llms', type: 'video', provider: 'Y Combinator Tech', durationOrReadTime: '20 mins' },
              { title: 'Context Architecture Handbook', url: 'https://docs.llamaindex.ai/en/stable/', type: 'doc', provider: 'LlamaIndex Docs', durationOrReadTime: 'Handbook' },
            ],
          },
          {
            id: 'ai-context-sources',
            title: 'Context Sources',
            colSpan: 1,
            category: 'Context',
            difficulty: 'Intermediate',
            estimatedHours: 4,
            description: 'Connecting diverse live enterprise sources: relational SQL databases, vector document stores, live web search, and GitHub repositories.',
            resources: [
              { title: 'Connecting LLMs to Real-Time Data Sources', url: 'https://www.youtube.com/watch?v=kYJ5oQ6H9pQ', type: 'video', provider: 'LangChain Tutorials', durationOrReadTime: '16 mins' },
              { title: 'Data Ingestion Best Practices for RAG', url: 'https://docs.llamaindex.ai/en/stable/module_guides/loading/documents_and_nodes/', type: 'doc', provider: 'LlamaIndex', durationOrReadTime: 'Docs' },
            ],
          },
          {
            id: 'ai-mcp-protocol',
            title: 'MCP',
            colSpan: 1,
            category: 'Context',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Model Context Protocol: Anthropic\'s open standard that provides a universal, standardized USB-like connection between AI assistants and local or remote data stores.',
            resources: [
              { title: 'Anthropic Model Context Protocol (MCP) in 100 Seconds', url: 'https://www.youtube.com/watch?v=0k7yP0l_H4I', type: 'video', provider: 'Fireship', durationOrReadTime: '3 mins' },
              { title: 'Model Context Protocol Official Documentation & Quickstart', url: 'https://modelcontextprotocol.io/quickstart', type: 'doc', provider: 'Model Context Protocol', durationOrReadTime: 'Official Docs' },
            ],
          },
          {
            id: 'ai-context-security',
            title: 'Context Security',
            colSpan: 2,
            category: 'Context',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Preventing prompt injection, indirect prompt injection from untrusted web pages, data exfiltration, and cross-tenant context leakage.',
            resources: [
              { title: 'Prompt Injection Explained Visually with Live Demos', url: 'https://www.youtube.com/watch?v=b4O5_7yQ1y4', type: 'video', provider: 'Computerphile', durationOrReadTime: '18 mins' },
              { title: 'OWASP Top 10 for Large Language Models', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', type: 'article', provider: 'OWASP Security', durationOrReadTime: 'Security Standard' },
            ],
          },
          {
            id: 'ai-context-eval',
            title: 'Context Evaluation',
            colSpan: 2,
            category: 'Context',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Measuring context precision, context recall, noise sensitivity, and needle-in-a-haystack retrieval accuracy.',
            resources: [
              { title: 'Evaluating LLMs: Metrics that Actually Matter', url: 'https://www.youtube.com/watch?v=Z_hZz1X1K3k', type: 'video', provider: 'Weights & Biases', durationOrReadTime: '22 mins' },
              { title: 'Ragas: Automated Evaluation Framework for Context & RAG', url: 'https://docs.ragas.io/en/stable/', type: 'doc', provider: 'Ragas Project', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
        subGroups: [
          {
            subTitle: 'Context Eng. Techniques',
            topics: [
              {
                id: 'ai-rag-dynamic',
                title: 'RAG & Dynamic Filtering',
                colSpan: 2,
                category: 'Techniques',
                difficulty: 'Intermediate',
                estimatedHours: 6,
                description: 'Semantic vector retrieval augmented with exact metadata filters (by user ID, document date, department, or organization security clearance).',
                resources: [
                  { title: 'Metadata Filtering in Vector Databases', url: 'https://www.youtube.com/watch?v=0k7yP0l_H4I', type: 'video', provider: 'Pinecone Video Guide', durationOrReadTime: '12 mins' },
                  { title: 'Advanced Filtering and Hybrid Queries', url: 'https://docs.pinecone.io/guides/data/filter-with-metadata', type: 'doc', provider: 'Pinecone Docs', durationOrReadTime: 'Documentation' },
                ],
              },
              {
                id: 'ai-memory-systems',
                title: 'Memory Systems',
                colSpan: 2,
                category: 'Techniques',
                difficulty: 'Advanced',
                estimatedHours: 6,
                description: 'Episodic vs semantic memory: maintaining user preferences, past decisions, and conversation facts across days or months using Mem0 or vector recall.',
                resources: [
                  { title: 'Building Long-Term Memory for AI Assistants', url: 'https://www.youtube.com/watch?v=0lxnpH_H7YI', type: 'video', provider: 'LangChain Academy', durationOrReadTime: '25 mins' },
                  { title: 'Mem0: The Memory Layer for Personalized AI', url: 'https://github.com/mem0ai/mem0', type: 'doc', provider: 'Mem0 Open Source', durationOrReadTime: 'Open Source Repo' },
                ],
              },
              {
                id: 'ai-context-compaction',
                title: 'Context Compaction',
                colSpan: 2,
                category: 'Techniques',
                difficulty: 'Advanced',
                estimatedHours: 5,
                description: 'Summarization, selective token pruning, and lossy compression algorithms that retain vital conversational facts while staying within token budgets.',
                resources: [
                  { title: 'Context Compression and Token Optimization Techniques', url: 'https://www.youtube.com/results?search_query=llm+context+compression', type: 'video', provider: 'LlamaIndex Series', durationOrReadTime: '15 mins' },
                  { title: 'Context Compression Pipeline Guide', url: 'https://python.langchain.com/docs/how_to/contextual_compression/', type: 'doc', provider: 'LangChain Docs', durationOrReadTime: 'Guide' },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'ai-m5-embeddings-vectors',
      milestoneTitle: 'Embeddings & Vector Databases',
      spineSubtitle: 'Semantic Retrieval',
      category: 'Vector Systems',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 5,
      description: 'Dive deep into mathematical vector space. Understand how dense and sparse embeddings capture meaning, how cosine similarity measures conceptual distance, and how to query leading vector databases like Pinecone, ChromaDB, and Qdrant at sub-100 millisecond latencies.',
      resources: [
        { title: 'Vector Embeddings & Vector Databases Masterclass', url: 'https://www.youtube.com/watch?v=klTvEwg3oJ4', type: 'video', provider: 'Fireship', durationOrReadTime: '20 mins' },
        { title: 'HNSW Graph Indexing Explained Visually', url: 'https://www.youtube.com/watch?v=QvLQywX7S_Y', type: 'video', provider: 'Pinecone Academy', durationOrReadTime: '16 mins' },
        { title: 'Comprehensive Guide to Vector Databases', url: 'https://www.pinecone.io/learn/vector-database/', type: 'doc', provider: 'Pinecone Guide', durationOrReadTime: '25 min read' },
      ],
      leftContainer: {
        id: 'ai-vector-architecture',
        groupTitle: 'Vector Architecture',
        side: 'left',
        topics: [
          {
            id: 'ai-dense-vs-sparse',
            title: 'Dense vs Sparse Embeddings',
            colSpan: 2,
            category: 'Embeddings',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Dense embeddings (like OpenAI text-embedding-3 or BGE) capture semantic concepts and meanings, while Sparse embeddings (like BM25 or SPLADE) capture exact keyword frequencies and rare terminology. Combining both yields Hybrid Search.',
            resources: [
              { title: 'Dense vs Sparse Vectors Explained', url: 'https://www.youtube.com/watch?v=gQddtTdmG_8', type: 'video', provider: 'Pinecone Video Guide', durationOrReadTime: '14 mins' },
              { title: 'Hybrid Search with Dense and Sparse Vectors', url: 'https://docs.pinecone.io/guides/search/hybrid-search', type: 'doc', provider: 'Pinecone Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-distance-metrics',
            title: 'Cosine & Euclidean Metrics',
            colSpan: 2,
            category: 'Embeddings',
            difficulty: 'Intermediate',
            estimatedHours: 4,
            description: 'Measuring the mathematical angle and distance between two high-dimensional vectors: Cosine Similarity (angle), Dot Product (angle + magnitude), and Euclidean Distance (straight-line distance).',
            resources: [
              { title: 'Cosine Similarity and Dot Product Visualized', url: 'https://www.youtube.com/watch?v=e9U0QAFbfLI', type: 'video', provider: 'StatQuest', durationOrReadTime: '12 mins' },
              { title: 'Vector Distance Metrics Guide', url: 'https://www.pinecone.io/learn/vector-similarity/', type: 'article', provider: 'Pinecone Learning', durationOrReadTime: '10 min read' },
            ],
          },
          {
            id: 'ai-pinecone',
            title: 'Pinecone',
            colSpan: 1,
            category: 'Vector DBs',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Serverless cloud vector database with instant autoscaling, real-time metadata indexing, and sub-50ms Approximate Nearest Neighbor queries.',
            resources: [
              { title: 'Pinecone in 100 Seconds', url: 'https://www.youtube.com/watch?v=klTvEwg3oJ4', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Pinecone Serverless Quickstart', url: 'https://docs.pinecone.io/guides/get-started/quickstart', type: 'doc', provider: 'Pinecone Docs', durationOrReadTime: 'Official Docs' },
            ],
          },
          {
            id: 'ai-chromadb',
            title: 'ChromaDB',
            colSpan: 1,
            category: 'Vector DBs',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Lightweight open-source local embedding database that runs completely in-memory or on local disk with Python and JavaScript SDKs.',
            resources: [
              { title: 'ChromaDB Crash Course for Beginners', url: 'https://www.youtube.com/watch?v=QSwJkwhm5-g', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '18 mins' },
              { title: 'ChromaDB Official Documentation', url: 'https://docs.trychroma.com/', type: 'doc', provider: 'ChromaDB Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-qdrant',
            title: 'Qdrant',
            colSpan: 1,
            category: 'Vector DBs',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'High-performance Rust-based vector search engine with payload filtering, product quantization, and distributed cluster support.',
            resources: [
              { title: 'Qdrant Vector Database Overview & Tutorial', url: 'https://www.youtube.com/watch?v=0k7yP0l_H4I', type: 'video', provider: 'Qdrant Team', durationOrReadTime: '20 mins' },
              { title: 'Qdrant Quickstart and Architecture', url: 'https://qdrant.tech/documentation/quick-start/', type: 'doc', provider: 'Qdrant Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'ai-milvus',
            title: 'Milvus / Weaviate',
            colSpan: 1,
            category: 'Vector DBs',
            difficulty: 'Advanced',
            estimatedHours: 6,
            description: 'Distributed billion-scale vector databases built for enterprise clustering, GPU acceleration, and hybrid GraphQL schemas.',
            resources: [
              { title: 'Milvus Billion-Scale Vector Search', url: 'https://www.youtube.com/results?search_query=milvus+vector+database+tutorial', type: 'video', provider: 'Zilliz', durationOrReadTime: '25 mins' },
              { title: 'Milvus Architecture Overview', url: 'https://milvus.io/docs/overview.md', type: 'doc', provider: 'Milvus Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-hybrid-search',
            title: 'Hybrid Search (Dense + BM25)',
            colSpan: 2,
            category: 'Embeddings',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Reciprocal Rank Fusion (RRF) combining keyword precision (for part numbers, serial codes, names) with semantic neural recall (for conceptual questions).',
            resources: [
              { title: 'Why Hybrid Search Beats Pure Vector Search', url: 'https://www.youtube.com/watch?v=gQddtTdmG_8', type: 'video', provider: 'Weaviate Podcasts', durationOrReadTime: '20 mins' },
              { title: 'Reciprocal Rank Fusion (RRF) Implementation Guide', url: 'https://docs.pinecone.io/guides/search/hybrid-search', type: 'doc', provider: 'Pinecone Docs', durationOrReadTime: 'Guide' },
            ],
          },
        ],
      },
    },
    {
      id: 'ai-m6-rag-pipelines',
      milestoneTitle: 'Production RAG Systems',
      category: 'Enterprise RAG',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 6,
      description: 'Build enterprise-grade Retrieval-Augmented Generation systems. Learn document parsing, semantic chunking, cross-encoder reranking, and self-correcting evaluation loops that eliminate hallucinations in mission-critical applications.',
      resources: [
        { title: 'Advanced RAG Techniques (Chunking, Reranking, HyDE)', url: 'https://www.youtube.com/watch?v=wXhhRgt_W7Y', type: 'video', provider: 'LangChain', durationOrReadTime: '30 mins' },
        { title: 'Evaluating RAG Pipelines with Ragas and TruLens', url: 'https://www.youtube.com/watch?v=Z_hZz1X1K3k', type: 'video', provider: 'Weights & Biases', durationOrReadTime: '25 mins' },
        { title: 'Production RAG Playbook by LlamaIndex', url: 'https://docs.llamaindex.ai/en/stable/', type: 'doc', provider: 'LlamaIndex', durationOrReadTime: 'Production Handbook' },
      ],
      rightContainer: {
        id: 'ai-rag-pipeline-container',
        groupTitle: 'RAG Pipeline Architecture',
        side: 'right',
        topics: [
          {
            id: 'ai-chunking-strat',
            title: 'Document Chunking Strategies',
            colSpan: 2,
            category: 'RAG',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'You cannot feed a 500-page PDF into an embedding model in one piece. You must split it into chunks. Learn fixed-size splitting, sliding window overlap, markdown header chunking, and parent-child chunk relationships.',
            resources: [
              { title: 'Document Chunking Strategies Explained Visually', url: 'https://www.youtube.com/watch?v=8OJC21T2SL4', type: 'video', provider: 'Greg Kamradt', durationOrReadTime: '20 mins' },
              { title: 'Chunking Strategies for LLM Applications', url: 'https://www.pinecone.io/learn/chunking-strategies/', type: 'article', provider: 'Pinecone Learning', durationOrReadTime: '15 min read' },
            ],
          },
          {
            id: 'ai-metadata-enrichment',
            title: 'Metadata Extraction & HyDE',
            colSpan: 2,
            category: 'RAG',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Hypothetical Document Embeddings (HyDE) and automated metadata tagging that generates hypothetical answers to bridge the vocabulary gap between short questions and long technical answers.',
            resources: [
              { title: 'HyDE: Hypothetical Document Embeddings Explained', url: 'https://www.youtube.com/results?search_query=hyde+hypothetical+document+embeddings', type: 'video', provider: 'AI Research Digest', durationOrReadTime: '12 mins' },
              { title: 'HyDE Paper Implementation in LangChain', url: 'https://python.langchain.com/docs/how_to/hypothetical_document_embeddings/', type: 'doc', provider: 'LangChain Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'ai-reranking',
            title: 'Cross-Encoder Re-ranking',
            colSpan: 2,
            category: 'RAG',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Filtering initial top 50 Approximate Nearest Neighbor results down to the 5 most deeply relevant passages using Cohere Rerank or BGE-Reranker cross-encoders.',
            resources: [
              { title: 'Why Reranking is the Secret Weapon in Modern RAG', url: 'https://www.youtube.com/watch?v=wXhhRgt_W7Y', type: 'video', provider: 'Cohere AI', durationOrReadTime: '18 mins' },
              { title: 'Cohere Rerank API Documentation', url: 'https://docs.cohere.com/docs/rerank-guide', type: 'doc', provider: 'Cohere Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-corrective-rag',
            title: 'Self-RAG & Corrective RAG',
            colSpan: 2,
            category: 'RAG',
            difficulty: 'Advanced',
            estimatedHours: 7,
            description: 'Autonomous validation: checking if retrieved documents actually contain the answer before generating, with automatic web-search fallback if documents are missing.',
            resources: [
              { title: 'Self-RAG & Corrective RAG (CRAG) Explained', url: 'https://www.youtube.com/watch?v=F8NKVhkZZWI', type: 'video', provider: 'LangChain Academy', durationOrReadTime: '22 mins' },
              { title: 'Corrective RAG Paper Summary', url: 'https://arxiv.org/abs/2401.15884', type: 'article', provider: 'arXiv Preprint', durationOrReadTime: 'Research Paper' },
            ],
          },
          {
            id: 'ai-ragas-eval',
            title: 'RAG Triad & Ragas Evaluation',
            colSpan: 2,
            category: 'RAG',
            difficulty: 'Advanced',
            estimatedHours: 6,
            description: 'Automated testing for Faithfulness (measuring hallucinations), Answer Relevance (did it answer the prompt?), and Context Relevance (did retrieval grab noise?).',
            resources: [
              { title: 'The RAG Triad: Evaluating LLM Quality Automatically', url: 'https://www.youtube.com/watch?v=Z_hZz1X1K3k', type: 'video', provider: 'TruEra', durationOrReadTime: '20 mins' },
              { title: 'Ragas Official Evaluation Metrics Guide', url: 'https://docs.ragas.io/en/stable/concepts/metrics/', type: 'doc', provider: 'Ragas Docs', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
    },
    {
      id: 'ai-m7-autonomous-agents',
      milestoneTitle: 'Autonomous AI Agents',
      spineSubtitle: 'Agentic Workflows',
      category: 'Agentic Workflows',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 7,
      description: 'Move beyond one-off question-answering to building autonomous software systems that can plan, reason, invoke external software APIs, recover from errors, and work in multi-agent collaboration teams.',
      resources: [
        { title: 'Building Autonomous AI Agents with LangGraph', url: 'https://www.youtube.com/watch?v=Eug2ClVQ11o', type: 'video', provider: 'Harrison Chase / LangChain', durationOrReadTime: '40 mins' },
        { title: 'Anthropic Research: What Actually Makes Agents Effective', url: 'https://www.anthropic.com/research/building-effective-agents', type: 'article', provider: 'Anthropic Research', durationOrReadTime: '20 min read' },
        { title: 'LangGraph State Machine Documentation', url: 'https://langchain-ai.github.io/langgraph/', type: 'doc', provider: 'LangGraph', durationOrReadTime: 'Official Docs' },
      ],
      leftContainer: {
        id: 'ai-agentic-frameworks',
        groupTitle: 'Agent Architecture',
        side: 'left',
        topics: [
          {
            id: 'ai-react-loops',
            title: 'ReAct Loops & Planning',
            colSpan: 2,
            category: 'Agents',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Plan-and-solve vs iterative Thought-Action-Observation loops for solving multi-step non-deterministic tasks without getting stuck in infinite loops.',
            resources: [
              { title: 'How AI Agents Think: ReAct Loops', url: 'https://www.youtube.com/watch?v=F8NKVhkZZWI', type: 'video', provider: 'Dave Ebbelaar', durationOrReadTime: '18 mins' },
              { title: 'ReAct Pattern Guide on LangChain', url: 'https://python.langchain.com/docs/concepts/agents/', type: 'doc', provider: 'LangChain', durationOrReadTime: 'Concepts' },
            ],
          },
          {
            id: 'ai-langgraph',
            title: 'LangGraph & State Machines',
            colSpan: 2,
            category: 'Agents',
            difficulty: 'Intermediate',
            estimatedHours: 8,
            description: 'Cyclic stateful graph workflows with durable execution, persistent checkpoints, and human-in-the-loop time-travel debugging.',
            resources: [
              { title: 'LangGraph Crash Course (Build a Production Agent)', url: 'https://www.youtube.com/watch?v=Eug2ClVQ11o', type: 'video', provider: 'LangChain Official', durationOrReadTime: '35 mins' },
              { title: 'LangGraph Quickstart Guide', url: 'https://langchain-ai.github.io/langgraph/tutorials/introduction/', type: 'doc', provider: 'LangGraph Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'ai-tool-calling-exec',
            title: 'Tool Calling & API Sandboxes',
            colSpan: 2,
            category: 'Agents',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Safe execution environments, Docker sandboxes, SQL generation with read-only database replicas, and web scraping with browser tools.',
            resources: [
              { title: 'Safe Code Execution for AI with E2B Sandboxes', url: 'https://www.youtube.com/watch?v=0lxnpH_H7YI', type: 'video', provider: 'E2B Team', durationOrReadTime: '15 mins' },
              { title: 'Tool Use and Execution Security Best Practices', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', type: 'doc', provider: 'Anthropic Docs', durationOrReadTime: 'Security Guide' },
            ],
          },
          {
            id: 'ai-multi-agent',
            title: 'Multi-Agent Collaboration',
            colSpan: 2,
            category: 'Agents',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Supervisor and worker patterns: specialized agents for researching, coding, reviewing, and testing collaborating on complex software projects.',
            resources: [
              { title: 'Multi-Agent Systems with LangGraph & CrewAI', url: 'https://www.youtube.com/watch?v=F8NKVhkZZWI', type: 'video', provider: 'CrewAI Tech', durationOrReadTime: '25 mins' },
              { title: 'Multi-Agent Hierarchical Architectures', url: 'https://langchain-ai.github.io/langgraph/tutorials/multi_agent/hierarchical_agent_teams/', type: 'doc', provider: 'LangGraph Tutorials', durationOrReadTime: 'Tutorial' },
            ],
          },
          {
            id: 'ai-human-in-loop',
            title: 'Human-in-the-Loop & Guardrails',
            colSpan: 2,
            category: 'Agents',
            difficulty: 'Advanced',
            estimatedHours: 6,
            description: 'NeMo Guardrails, Llama Guard, and interactive approval checkpoints before executing high-impact actions (like executing wire transfers or deleting files).',
            resources: [
              { title: 'Human in the Loop Architectures for AI Safety', url: 'https://www.youtube.com/watch?v=Eug2ClVQ11o', type: 'video', provider: 'AI Safety Series', durationOrReadTime: '18 mins' },
              { title: 'Nvidia NeMo Guardrails Documentation', url: 'https://github.com/NVIDIA/NeMo-Guardrails', type: 'doc', provider: 'NVIDIA Open Source', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
    },
    {
      id: 'ai-m8-serving-mlops',
      milestoneTitle: 'Deployment & MLOps',
      category: 'Production Operations',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 8,
      description: 'Ship AI applications to production. Master high-throughput low-latency inference serving with vLLM, weight quantization, prompt injection defense, and full observability with LangSmith.',
      resources: [
        { title: 'vLLM and Production LLM Deployment Architecture', url: 'https://www.youtube.com/watch?v=5z3eK1O5E_w', type: 'video', provider: 'vLLM Project', durationOrReadTime: '30 mins' },
        { title: 'LLM Observability and Tracing with LangSmith', url: 'https://www.youtube.com/watch?v=Z_hZz1X1K3k', type: 'video', provider: 'LangChain', durationOrReadTime: '20 mins' },
        { title: 'OWASP AI Security and Deployment Verification', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', type: 'doc', provider: 'OWASP', durationOrReadTime: 'Standard' },
      ],
      rightContainer: {
        id: 'ai-production-serving',
        groupTitle: 'Production Deployment',
        side: 'right',
        topics: [
          {
            id: 'ai-vllm-serving',
            title: 'vLLM & TensorRT Serving',
            colSpan: 2,
            category: 'Serving',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'PagedAttention, continuous batching, and high-throughput low-latency model inference servers for self-hosted open source models.',
            resources: [
              { title: 'How vLLM PagedAttention Works Under the Hood', url: 'https://www.youtube.com/watch?v=5z3eK1O5E_w', type: 'video', provider: 'vLLM Core Team', durationOrReadTime: '20 mins' },
              { title: 'vLLM Server Deployment Guide', url: 'https://docs.vllm.ai/en/latest/serving/deploying_with_k8s.html', type: 'doc', provider: 'vLLM Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'ai-quantization',
            title: 'Quantization (GGUF, AWQ, FP8)',
            colSpan: 1,
            category: 'Optimization',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Compressing 16-bit weights to 4-bit/8-bit integers so a 70B parameter model fits on a single consumer GPU with minimal quality degradation.',
            resources: [
              { title: 'Quantization Explained: Run Giant Models on Cheap GPUs', url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos', type: 'video', provider: 'Fireship', durationOrReadTime: '10 mins' },
              { title: 'Hugging Face Quantization Guide', url: 'https://huggingface.co/docs/transformers/main_classes/quantization', type: 'doc', provider: 'Hugging Face Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'ai-lora-peft',
            title: 'LoRA & PEFT Adapters',
            colSpan: 1,
            category: 'Optimization',
            difficulty: 'Advanced',
            estimatedHours: 7,
            description: 'Low-Rank Adaptation: injecting small trainable rank-decomposition matrices into transformer layers instead of retraining all weights.',
            resources: [
              { title: 'LoRA: Low-Rank Adaptation Explained Simply', url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos', type: 'video', provider: 'Yannic Kilcher', durationOrReadTime: '25 mins' },
              { title: 'PEFT: Parameter-Efficient Fine-Tuning Library', url: 'https://github.com/huggingface/peft', type: 'doc', provider: 'Hugging Face PEFT', durationOrReadTime: 'Repo' },
            ],
          },
          {
            id: 'ai-prompt-security',
            title: 'Prompt Injection Defense',
            colSpan: 2,
            category: 'Security',
            difficulty: 'Advanced',
            estimatedHours: 6,
            description: 'Defending against direct and indirect prompt injections, adversarial ASCII art, delimiter hijacking, and jailbreaks in enterprise apps.',
            resources: [
              { title: 'Real World Prompt Injection Attacks and Defenses', url: 'https://www.youtube.com/watch?v=b4O5_7yQ1y4', type: 'video', provider: 'Computerphile', durationOrReadTime: '18 mins' },
              { title: 'Lakera AI Prompt Security Guidelines', url: 'https://www.lakera.ai/blog/guide-to-prompt-injection', type: 'article', provider: 'Lakera AI', durationOrReadTime: 'Security Guide' },
            ],
          },
          {
            id: 'ai-observability',
            title: 'Observability (LangSmith & Tracing)',
            colSpan: 2,
            category: 'Observability',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Tracking latency, token costs, hallucination rates, and prompt versioning across releases using distributed traces.',
            resources: [
              { title: 'LangSmith: Observability & Testing for LLMs', url: 'https://www.youtube.com/watch?v=Z_hZz1X1K3k', type: 'video', provider: 'LangChain', durationOrReadTime: '20 mins' },
              { title: 'LangSmith Quickstart and Production Setup', url: 'https://docs.smith.langchain.com/', type: 'doc', provider: 'LangSmith Docs', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
    },
  ],
};

// =========================================================================
// 2. COMPUTER SCIENCE ROADMAP
// =========================================================================
export const CS_ROADMAP_SH: RoadmapShTrack = {
  id: 'cs',
  title: 'Computer Science & Algorithms',
  tagline: 'Formal Foundations, Data Structures, Invariant Proofs & Complexity',
  description: 'A structured, beginner-friendly academic journey through discrete mathematics, linear memory, logarithmic trees, graph theory, and dynamic programming.',
  badge: 'Core Academic',
  relatedRoadmaps: [
    { id: 'ai-ml', title: 'AI Engineer' },
    { id: 'backend', title: 'Backend Developer' },
    { id: 'cybersecurity', title: 'Cybersecurity' },
  ],
  milestones: [
    {
      id: 'cs-m1-math',
      milestoneTitle: 'Mathematical Foundations',
      category: 'Discrete Mathematics',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 1,
      description: 'Before writing algorithms, computer scientists study discrete mathematics: the language of precise logical reasoning. In this milestone, you will learn how computers represent truth, how to mathematically prove that code always works using loop invariants, and how to measure code speed using asymptotic Big-O notation.',
      resources: [
        { title: 'Discrete Mathematics for Computer Science (Full Course)', url: 'https://www.youtube.com/watch?v=tyDKR4FG3Yw', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '3 hours' },
        { title: 'Big-O Notation in 100 Seconds', url: 'https://www.youtube.com/watch?v=g2o22C3CRf8', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
        { title: 'MIT 6.042J: Mathematics for Computer Science', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/', type: 'doc', provider: 'MIT OpenCourseWare', durationOrReadTime: 'Course Notes' },
      ],
      fanOutRight: [
        {
          id: 'cs-logic',
          title: 'Discrete Math & Propositional Logic',
          category: 'Math',
          difficulty: 'Beginner',
          estimatedHours: 8,
          description: 'Propositional logic is how computers evaluate truth. Every "if/else" condition you ever write in code is based on boolean operators: AND (conjunction), OR (disjunction), NOT (negation), and XOR (exclusive or). Learn truth tables, De Morgan\'s laws, and how to simplify complex nested conditional logic.',
          resources: [
            { title: 'Propositional Logic and Truth Tables', url: 'https://www.youtube.com/watch?v=tyDKR4FG3Yw', type: 'video', provider: 'TrevTutor', durationOrReadTime: '20 mins' },
            { title: 'Boolean Algebra Reference Guide', url: 'https://en.wikipedia.org/wiki/Boolean_algebra', type: 'doc', provider: 'Wikipedia CS', durationOrReadTime: 'Reference' },
          ],
        },
        {
          id: 'cs-proofs-item',
          title: 'Proof Techniques & Invariants',
          category: 'Math',
          difficulty: 'Beginner',
          estimatedHours: 8,
          description: 'A mathematical proof guarantees that an algorithm works for ALL possible inputs, not just the few test cases you manually tested. Learn mathematical induction (domino effect proof), proof by contradiction, and loop invariants.',
          resources: [
            { title: 'Mathematical Induction in 5 Minutes', url: 'https://www.youtube.com/results?search_query=mathematical+induction+explained+simply', type: 'video', provider: 'Numberphile', durationOrReadTime: '8 mins' },
            { title: 'Loop Invariants and Correctness Proofs', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/', type: 'doc', provider: 'MIT Algorithms', durationOrReadTime: 'Lecture Notes' },
          ],
        },
        {
          id: 'cs-big-o-item',
          title: 'Asymptotic Analysis (Big-O)',
          category: 'Complexity',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Big-O notation tells you how an algorithm\'s runtime or memory usage scales as input size (N) grows from 10 items to 10 billion items. Learn O(1) constant time, O(log N) binary search, O(N) linear scans, O(N log N) sorting, and O(N²) quadratic nested loops.',
          resources: [
            { title: 'Big-O Notation Visualized in 100 Seconds', url: 'https://www.youtube.com/watch?v=g2o22C3CRf8', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
            { title: 'Big-O Cheat Sheet for All Data Structures', url: 'https://www.bigocheatsheet.com/', type: 'doc', provider: 'Big-O Cheat Sheet', durationOrReadTime: 'Interactive Sheet' },
          ],
        },
        {
          id: 'cs-bitwise',
          title: 'Bitwise Hacks & Representation',
          category: 'Architecture',
          difficulty: 'Beginner',
          estimatedHours: 5,
          description: 'At the bare silicon level, memory consists entirely of binary 0s and 1s. Learn Two\'s Complement representation of negative numbers, bitwise AND (&), OR (|), XOR (^), bitwise shifting (<< and >>), and bit masks.',
          resources: [
            { title: 'Bitwise Operators Explained Clearly', url: 'https://www.youtube.com/watch?v=nlfY-M4S6Z8', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '15 mins' },
            { title: 'Bit Twiddling Hacks by Stanford', url: 'https://graphics.stanford.edu/~seander/bithacks.html', type: 'doc', provider: 'Stanford University', durationOrReadTime: 'Code Vault' },
          ],
        },
      ],
    },
    {
      id: 'cs-m2-linear',
      milestoneTitle: 'Linear Data Structures',
      spineSubtitle: 'Sequential Memory',
      category: 'Data Structures',
      difficulty: 'Beginner',
      estimatedHours: 10,
      stepNumber: 2,
      description: 'Linear data structures store data sequentially in computer RAM. Learn how dynamic arrays achieve lightning-fast cache locality, how linked lists use pointers, and how stacks and queues enforce strict ordering rules.',
      resources: [
        { title: 'Data Structures Easy to Advanced (Full Course)', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'video', provider: 'William Fiset', durationOrReadTime: '2 hours' },
        { title: 'Dynamic Arrays and Amortized Analysis', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/', type: 'doc', provider: 'MIT 6.006', durationOrReadTime: 'Lecture Notes' },
      ],
      leftContainer: {
        id: 'cs-linear-container',
        groupTitle: 'Linear Collections',
        side: 'left',
        topics: [
          {
            id: 'cs-arrays',
            title: 'Dynamic Arrays & Amortized Doubling',
            colSpan: 2,
            category: 'Structures',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Dynamic arrays (like Python lists, JS arrays, or C++ vectors) allocate contiguous slots in physical memory. When full, they double their capacity to guarantee O(1) amortized insertion.',
            resources: [
              { title: 'Dynamic Arrays Explained Visually', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'video', provider: 'William Fiset', durationOrReadTime: '12 mins' },
              { title: 'Amortized Doubling Proof', url: 'https://en.wikipedia.org/wiki/Dynamic_array', type: 'doc', provider: 'Wikipedia', durationOrReadTime: 'Reference' },
            ],
          },
          {
            id: 'cs-linked-list',
            title: 'Singly & Doubly Linked Lists',
            colSpan: 1,
            category: 'Structures',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Unlike arrays, linked lists scatter elements across memory, connecting each node to the next via memory pointers. Learn traversal, pointer reversals, and head/tail sentinel nodes.',
            resources: [
              { title: 'Linked Lists in 100 Seconds', url: 'https://www.youtube.com/watch?v=oiW7EDT79hU', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Linked List Implementation Guide', url: 'https://www.geeksforgeeks.org/data-structures/linked-list/', type: 'doc', provider: 'GeeksforGeeks', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'cs-cycle-detect',
            title: 'Floyd’s Cycle Detection',
            colSpan: 1,
            category: 'Algorithms',
            difficulty: 'Intermediate',
            estimatedHours: 4,
            description: 'The Tortoise and Hare algorithm: using two pointers moving at speeds 1 and 2 to detect loops in pointer structures in O(N) time and O(1) auxiliary space.',
            resources: [
              { title: 'Floyd\'s Cycle Detection (Tortoise and Hare) Explained', url: 'https://www.youtube.com/watch?v=PvrxZaH_eZ4', type: 'video', provider: 'NeetCode', durationOrReadTime: '10 mins' },
              { title: 'Cycle Finding Algorithms on LeetCode', url: 'https://leetcode.com/problems/linked-list-cycle/', type: 'doc', provider: 'LeetCode', durationOrReadTime: 'Practice Problem' },
            ],
          },
          {
            id: 'cs-stacks',
            title: 'Stacks & Monotonic Stack Invariant',
            colSpan: 2,
            category: 'Structures',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Last-In, First-Out (LIFO) stack evaluation. Learn balanced parenthetical verification, postfix expression calculation, and monotonic stack algorithms for "Next Greater Element" problems.',
            resources: [
              { title: 'Monotonic Stack Explained with Animations', url: 'https://www.youtube.com/watch?v=Dq_OBPt9P34', type: 'video', provider: 'NeetCode', durationOrReadTime: '15 mins' },
              { title: 'Stack Data Structure Handbook', url: 'https://www.programiz.com/dsa/stack', type: 'doc', provider: 'Programiz', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'cs-queues',
            title: 'Queues & Circular Ring Buffers',
            colSpan: 2,
            category: 'Structures',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'First-In, First-Out (FIFO) queuing. Learn circular array wrap-around pointers, double-ended queues (deques), and task scheduling pipelines.',
            resources: [
              { title: 'Queues and Ring Buffers Explained', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'video', provider: 'William Fiset', durationOrReadTime: '14 mins' },
              { title: 'Circular Buffer Implementation in C & Python', url: 'https://en.wikipedia.org/wiki/Circular_buffer', type: 'doc', provider: 'Wikipedia', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
      rightContainer: {
        id: 'cs-hashing-container',
        groupTitle: 'Hashing & Searching',
        side: 'right',
        topics: [
          {
            id: 'cs-hash-tables',
            title: 'Hash Tables & Hash Functions',
            colSpan: 2,
            category: 'Hashing',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Hash tables map keys to values with O(1) average lookup. Learn universal hashing, MurmurHash, load factors, and dynamic resizing.',
            resources: [
              { title: 'Hash Tables and Hash Functions in 100 Seconds', url: 'https://www.youtube.com/watch?v=knV86FlSXJ8', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'MIT 6.006 Hash Tables Lecture', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/', type: 'doc', provider: 'MIT OCW', durationOrReadTime: 'Lecture' },
            ],
          },
          {
            id: 'cs-collision',
            title: 'Collision Resolution Strategies',
            colSpan: 2,
            category: 'Hashing',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Handling hash collisions: Chaining (linked lists in buckets) vs Open Addressing (Linear Probing, Quadratic Probing, Robin Hood hashing).',
            resources: [
              { title: 'Collision Resolution: Chaining vs Open Addressing', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', type: 'video', provider: 'William Fiset', durationOrReadTime: '15 mins' },
              { title: 'Hash Table Collision Techniques Comparison', url: 'https://en.wikipedia.org/wiki/Hash_table#Collision_resolution', type: 'doc', provider: 'Wikipedia', durationOrReadTime: 'Reference' },
            ],
          },
          {
            id: 'cs-binary-search',
            title: 'Binary Search Invariants',
            colSpan: 2,
            category: 'Searching',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Searching sorted spaces in logarithmic O(log N) time. Learn off-by-one boundary invariants, integer overflow prevention (mid = low + (high - low)/2), and binary searching on monotonic answer spaces.',
            resources: [
              { title: 'Binary Search Explained by Errichto', url: 'https://www.youtube.com/watch?v=GU7DpgHINWQ', type: 'video', provider: 'Errichto Algorithms', durationOrReadTime: '20 mins' },
              { title: 'Binary Search Mastery Guide on LeetCode', url: 'https://leetcode.com/discuss/general-discussion/786126/python-powerful-ultimate-binary-search-template', type: 'doc', provider: 'LeetCode Discuss', durationOrReadTime: 'Template Guide' },
            ],
          },
        ],
      },
    },
    {
      id: 'cs-m3-trees',
      milestoneTitle: 'Hierarchies & Trees',
      spineSubtitle: 'Logarithmic Structures',
      category: 'Trees & Heaps',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 3,
      description: 'Master hierarchical tree structures: Binary Search Trees, self-balancing AVL and Red-Black trees, binary heaps for priority queues, and Tries for prefix search.',
      resources: [
        { title: 'Tree Data Structures & Traversal Algorithms Masterclass', url: 'https://www.youtube.com/watch?v=oSWTXtMglKE', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '1 hour' },
        { title: 'Visual Algo Tree Visualizer', url: 'https://visualgo.net/en/bst', type: 'doc', provider: 'VisuAlgo', durationOrReadTime: 'Interactive Tool' },
      ],
      leftContainer: {
        id: 'cs-trees-container',
        groupTitle: 'Binary Search & Self-Balancing',
        side: 'left',
        topics: [
          {
            id: 'cs-bst-core',
            title: 'Binary Search Trees (BST)',
            colSpan: 2,
            category: 'Trees',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'BST property: left subtree < root < right subtree. In-order traversal yields sorted order. Learn insertion, search, and two-child deletion with in-order successor.',
            resources: [
              { title: 'Binary Search Trees in 100 Seconds', url: 'https://www.youtube.com/watch?v=7vw2iIdqHlM', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'BST Operations & Deletion Algorithm', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/', type: 'doc', provider: 'GeeksforGeeks', durationOrReadTime: 'Tutorial' },
            ],
          },
          {
            id: 'cs-avl-rotations',
            title: 'AVL Trees & Rotations',
            colSpan: 1,
            category: 'Trees',
            difficulty: 'Intermediate',
            estimatedHours: 8,
            description: 'Self-balancing trees maintaining balance factor in {-1, 0, 1}. Single (LL/RR) and Double (LR/RL) rotations restore O(log N) worst-case height.',
            resources: [
              { title: 'AVL Tree Rotations Explained Visually', url: 'https://www.youtube.com/watch?v=jDM6_TnYIqE', type: 'video', provider: 'Abdul Bari', durationOrReadTime: '25 mins' },
              { title: 'AVL Tree Interactive Visualizer', url: 'https://visualgo.net/en/bst', type: 'doc', provider: 'VisuAlgo', durationOrReadTime: 'Tool' },
            ],
          },
          {
            id: 'cs-red-black',
            title: 'Red-Black Trees',
            colSpan: 1,
            category: 'Trees',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Color invariants used in production C++ std::map and Java TreeMap. No two consecutive red nodes; equal black height guarantees bounded O(log N) operations.',
            resources: [
              { title: 'Red-Black Tree Rotations & Recoloring', url: 'https://www.youtube.com/watch?v=qvZGUFHWChY', type: 'video', provider: 'Abdul Bari', durationOrReadTime: '30 mins' },
              { title: 'Red-Black Tree Implementation Guide', url: 'https://en.wikipedia.org/wiki/Red%E2%80%93black_tree', type: 'doc', provider: 'Wikipedia', durationOrReadTime: 'Reference' },
            ],
          },
          {
            id: 'cs-heaps',
            title: 'Binary Heaps & Priority Queues',
            colSpan: 2,
            category: 'Trees',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Array-backed complete binary trees. Sift-Up and Sift-Down operations yield O(log N) insertion and extraction, with Floyd\'s O(N) Build-Heap algorithm.',
            resources: [
              { title: 'Heaps and Priority Queues Explained Visually', url: 'https://www.youtube.com/watch?v=HqPJF2L5h9U', type: 'video', provider: 'Abdul Bari', durationOrReadTime: '22 mins' },
              { title: 'Heap Data Structure on GeeksforGeeks', url: 'https://www.geeksforgeeks.org/heap-data-structure/', type: 'doc', provider: 'GeeksforGeeks', durationOrReadTime: 'Guide' },
            ],
          },
        ],
      },
      rightContainer: {
        id: 'cs-specialized-trees',
        groupTitle: 'Specialized Tree Structures',
        side: 'right',
        topics: [
          {
            id: 'cs-tries-prefix',
            title: 'Tries (Prefix Trees)',
            colSpan: 2,
            category: 'Advanced Trees',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Radix prefix trees for dictionary string lookups, prefix autocomplete, and spellcheckers in O(L) time where L is word length.',
            resources: [
              { title: 'Trie Data Structure in 5 Minutes', url: 'https://www.youtube.com/watch?v=zIjfhVPRZCg', type: 'video', provider: 'NeetCode', durationOrReadTime: '8 mins' },
              { title: 'Trie Implementation in Python & C++', url: 'https://algs4.cs.princeton.edu/52trie/', type: 'doc', provider: 'Princeton Algorithms', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'cs-segment-trees',
            title: 'Segment Trees',
            colSpan: 1,
            category: 'Advanced Trees',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Range sum/minimum queries and lazy propagation in O(log N) time for dynamic competitive programming and computational geometry.',
            resources: [
              { title: 'Segment Trees with Lazy Propagation Explained', url: 'https://www.youtube.com/watch?v=e_bZpknPlog', type: 'video', provider: 'Errichto', durationOrReadTime: '30 mins' },
              { title: 'CP-Algorithms Segment Tree Guide', url: 'https://cp-algorithms.com/data_structures/segment_tree.html', type: 'doc', provider: 'CP-Algorithms', durationOrReadTime: 'Comprehensive Guide' },
            ],
          },
          {
            id: 'cs-fenwick',
            title: 'Fenwick (Binary Indexed) Trees',
            colSpan: 1,
            category: 'Advanced Trees',
            difficulty: 'Advanced',
            estimatedHours: 7,
            description: 'Compact bitwise range prefix sums and point updates in O(log N) using two\'s complement lowest set bit operations (i & -i) with zero tree pointers.',
            resources: [
              { title: 'Fenwick Tree (Binary Indexed Tree) Explained Visually', url: 'https://www.youtube.com/watch?v=uSFzHCZ4E-8', type: 'video', provider: 'William Fiset', durationOrReadTime: '15 mins' },
              { title: 'Fenwick Tree on TopCoder', url: 'https://www.topcoder.com/community/competitive-programming/tutorials/binary-indexed-trees/', type: 'doc', provider: 'TopCoder Tutorials', durationOrReadTime: 'Tutorial' },
            ],
          },
        ],
      },
    },
    {
      id: 'cs-m4-graphs',
      milestoneTitle: 'Graph Theory & Networks',
      spineSubtitle: 'Topologies & Traversal',
      category: 'Graphs',
      difficulty: 'Intermediate',
      estimatedHours: 14,
      stepNumber: 4,
      description: 'Graphs represent real-world networks: maps, social connections, internet routing, and dependency workflows. Learn BFS/DFS traversals, topological sorting, Dijkstra\'s shortest paths, and minimum spanning trees.',
      resources: [
        { title: 'Graph Theory Algorithms Course (Full 6-hour Lecture)', url: 'https://www.youtube.com/watch?v=09_LlHjoEiY', type: 'video', provider: 'William Fiset / FreeCodeCamp', durationOrReadTime: '6 hours' },
        { title: 'Visual Algo Graph Visualizer', url: 'https://visualgo.net/en/sssp', type: 'doc', provider: 'VisuAlgo', durationOrReadTime: 'Interactive Tool' },
      ],
      leftContainer: {
        id: 'cs-graph-traversal',
        groupTitle: 'Traversals & Orderings',
        side: 'left',
        topics: [
          {
            id: 'cs-bfs-dfs',
            title: 'BFS & DFS Graph Traversals',
            colSpan: 2,
            category: 'Graphs',
            difficulty: 'Beginner',
            estimatedHours: 7,
            description: 'Breadth-First Search (queue-based, shortest unweighted paths, flood fill) and Depth-First Search (stack/recursion-based, cycle detection, connected components).',
            resources: [
              { title: 'BFS vs DFS in 100 Seconds', url: 'https://www.youtube.com/watch?v=tiA_dKkP1W8', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Graph Traversal Mastery Guide', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/', type: 'doc', provider: 'GeeksforGeeks', durationOrReadTime: 'Handbook' },
            ],
          },
          {
            id: 'cs-topo-kahn',
            title: 'Topological Sort (Kahn’s Algorithm)',
            colSpan: 2,
            category: 'Graphs',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Linear ordering of vertices in Directed Acyclic Graphs (DAGs) using in-degree queue tracking. Used for build systems (Makefile) and curriculum prerequisite ordering.',
            resources: [
              { title: 'Topological Sort Kahn\'s Algorithm Explained', url: 'https://www.youtube.com/watch?v=cIBFEhD77b4', type: 'video', provider: 'NeetCode', durationOrReadTime: '12 mins' },
              { title: 'Topological Sort on LeetCode (Course Schedule)', url: 'https://leetcode.com/problems/course-schedule/', type: 'doc', provider: 'LeetCode', durationOrReadTime: 'Problem' },
            ],
          },
          {
            id: 'cs-bipartite',
            title: 'Bipartite Graphs & Coloring',
            colSpan: 2,
            category: 'Graphs',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: '2-coloring graph vertices via BFS/DFS to verify absence of odd-length cycles, used for matching algorithms and job assignments.',
            resources: [
              { title: 'Bipartite Graph Check Explained', url: 'https://www.youtube.com/watch?v=670DcCNFTAQ', type: 'video', provider: 'Striver A2Z', durationOrReadTime: '15 mins' },
              { title: 'Bipartite Graph Properties on Wolfram MathWorld', url: 'https://mathworld.wolfram.com/BipartiteGraph.html', type: 'doc', provider: 'Wolfram', durationOrReadTime: 'Math Reference' },
            ],
          },
        ],
      },
      rightContainer: {
        id: 'cs-graph-paths',
        groupTitle: 'Shortest Paths & Minimum Spanning Trees',
        side: 'right',
        topics: [
          {
            id: 'cs-dijkstra-alg',
            title: 'Dijkstra’s Shortest Path',
            colSpan: 2,
            category: 'Shortest Paths',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Greedy shortest path algorithm on non-negative weighted graphs using min-heaps in O((V + E) log V) time.',
            resources: [
              { title: 'Dijkstra\'s Algorithm in 3 Minutes', url: 'https://www.youtube.com/watch?v=_lHSawdgXpI', type: 'video', provider: 'Computerphile', durationOrReadTime: '10 mins' },
              { title: 'Dijkstra Algorithm Step-by-Step Guide', url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm', type: 'doc', provider: 'Wikipedia', durationOrReadTime: 'Reference' },
            ],
          },
          {
            id: 'cs-bellman-ford',
            title: 'Bellman-Ford & Negative Cycles',
            colSpan: 2,
            category: 'Shortest Paths',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Dynamic programming edge relaxation algorithm that handles negative edge weights and detects negative-weight cycles in financial arbitrage.',
            resources: [
              { title: 'Bellman-Ford Algorithm Explained Visually', url: 'https://www.youtube.com/watch?v=FtN3BYH2ZQU', type: 'video', provider: 'Abdul Bari', durationOrReadTime: '20 mins' },
              { title: 'Bellman-Ford Implementation on CP-Algorithms', url: 'https://cp-algorithms.com/graph/bellman_ford.html', type: 'doc', provider: 'CP-Algorithms', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'cs-mst-kruskal',
            title: 'Kruskal’s & Prim’s MST',
            colSpan: 1,
            category: 'MST',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Greedy minimum spanning tree construction: Kruskal sorts edges with Disjoint Set Union; Prim grows tree with priority queues.',
            resources: [
              { title: 'Kruskal\'s Algorithm for Minimum Spanning Trees', url: 'https://www.youtube.com/watch?v=4ZlRH0eK-qE', type: 'video', provider: 'Abdul Bari', durationOrReadTime: '18 mins' },
              { title: 'Kruskal vs Prim Comparison', url: 'https://www.geeksforgeeks.org/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/', type: 'doc', provider: 'GeeksforGeeks', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'cs-dsu-union',
            title: 'Disjoint Set Union (DSU)',
            colSpan: 1,
            category: 'MST',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Union-Find with path compression and rank heuristics, executing union and find operations in nearly O(1) inverse Ackermann time.',
            resources: [
              { title: 'Disjoint Set Union (DSU) Visualized', url: 'https://www.youtube.com/watch?v=ayW5B2W9hfo', type: 'video', provider: 'William Fiset', durationOrReadTime: '15 mins' },
              { title: 'DSU CP-Algorithms Handbook', url: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html', type: 'doc', provider: 'CP-Algorithms', durationOrReadTime: 'Handbook' },
            ],
          },
        ],
      },
    },
    {
      id: 'cs-m5-dp',
      milestoneTitle: 'Dynamic Programming & Intractability',
      spineSubtitle: 'Optimal Substructure',
      category: 'Dynamic Programming',
      difficulty: 'Advanced',
      estimatedHours: 16,
      stepNumber: 5,
      description: 'Conquer dynamic programming by identifying overlapping subproblems and optimal substructure. Master memoization, tabulation, knapsack problems, and understand P vs NP computational intractability.',
      resources: [
        { title: 'Dynamic Programming - Learn to Solve Algorithmic Problems', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '5 hours' },
        { title: 'P vs. NP and the Computational Complexity Zoo', url: 'https://www.youtube.com/watch?v=YX40hbAHx3s', type: 'video', provider: 'Veritasium', durationOrReadTime: '15 mins' },
      ],
      rightContainer: {
        id: 'cs-dp-container',
        groupTitle: 'Optimal Substructure',
        side: 'right',
        topics: [
          {
            id: 'cs-dp-1d-memo',
            title: '1D Memoization & Tabulation',
            colSpan: 2,
            category: 'DP',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Top-down recursion with hash table caching vs bottom-up iterative array tabulation. Eliminates exponential O(2^N) calls down to linear O(N).',
            resources: [
              { title: 'Dynamic Programming 1D Memoization Guide', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', type: 'video', provider: 'Alvin Zablan', durationOrReadTime: '25 mins' },
              { title: 'LeetCode 1D DP Study Plan', url: 'https://leetcode.com/studyplan/dynamic-programming/', type: 'doc', provider: 'LeetCode', durationOrReadTime: 'Practice Plan' },
            ],
          },
          {
            id: 'cs-knapsack-01',
            title: '0/1 Knapsack & Subset Sum',
            colSpan: 2,
            category: 'DP',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Choosing items with weights and values under a capacity constraint in pseudo-polynomial O(N * W) time with space optimization.',
            resources: [
              { title: '0/1 Knapsack Problem Dynamic Programming Explained', url: 'https://www.youtube.com/watch?v=nLmhmB6NzcM', type: 'video', provider: 'Abdul Bari', durationOrReadTime: '22 mins' },
              { title: 'Knapsack Algorithm on GeeksforGeeks', url: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/', type: 'doc', provider: 'GeeksforGeeks', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'cs-lcs-align',
            title: 'Longest Common Subsequence (LCS)',
            colSpan: 2,
            category: 'DP',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: '2D grid dynamic programming for sequence alignment, diff tools (like git diff), and DNA genomic sequence comparison.',
            resources: [
              { title: 'Longest Common Subsequence Visualized', url: 'https://www.youtube.com/watch?v=Ua0GhsJSlWM', type: 'video', provider: 'NeetCode', durationOrReadTime: '15 mins' },
              { title: 'LCS Algorithm and Backtracking', url: 'https://en.wikipedia.org/wiki/Longest_common_subsequence_problem', type: 'doc', provider: 'Wikipedia', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'cs-tree-dp',
            title: 'Tree DP & Re-rooting',
            colSpan: 2,
            category: 'DP',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Subtree dynamic programming passes and prefix/suffix re-rooting transitions for calculating maximum independent sets and graph diameters.',
            resources: [
              { title: 'Tree DP and Rerooting Technique Tutorial', url: 'https://www.youtube.com/watch?v=7_A456_pQ7A', type: 'video', provider: 'Errichto', durationOrReadTime: '30 mins' },
              { title: 'Tree DP Guide on Codeforces', url: 'https://codeforces.com/blog/entry/20935', type: 'doc', provider: 'Codeforces Blog', durationOrReadTime: 'Tutorial' },
            ],
          },
          {
            id: 'cs-np-p',
            title: 'P vs NP & Polynomial Reductions',
            colSpan: 2,
            category: 'Complexity',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'The million-dollar Millennium Prize problem. P (problems solvable in polynomial time) vs NP (solutions verifiable in polynomial time), Cook-Levin theorem, and 3-SAT reductions.',
            resources: [
              { title: 'P vs NP in 10 Minutes by Veritasium', url: 'https://www.youtube.com/watch?v=YX40hbAHx3s', type: 'video', provider: 'Veritasium', durationOrReadTime: '10 mins' },
              { title: 'Clay Mathematics Institute: P vs NP Millennium Problem', url: 'https://www.claymath.org/millennium-problems/p-vs-np-problem/', type: 'doc', provider: 'Clay Institute', durationOrReadTime: 'Official Problem' },
            ],
          },
        ],
      },
    },
  ],
};

// =========================================================================
// 3. FRONTEND DEVELOPER ROADMAP
// =========================================================================
export const FRONTEND_ROADMAP_SH: RoadmapShTrack = {
  id: 'frontend',
  title: 'Frontend Developer',
  tagline: 'Modern Web UI: Semantic HTML, Modern CSS, JavaScript, React 19 & Next.js',
  description: 'Complete frontend engineer roadmap designed from scratch. Master foundational browsers, layout grids, modern reactive frameworks, state managers, and runtime web performance.',
  badge: 'Web Architecture',
  relatedRoadmaps: [
    { id: 'fullstack', title: 'Full-Stack Developer' },
    { id: 'backend', title: 'Backend Developer' },
    { id: 'ai-ml', title: 'AI Engineer' },
  ],
  milestones: [
    {
      id: 'fe-m1-internet',
      milestoneTitle: 'Internet & Web Basics',
      category: 'Web Foundations',
      difficulty: 'Beginner',
      estimatedHours: 6,
      stepNumber: 1,
      description: 'Understand how the world wide web actually works behind the scenes. When you type google.com into your address bar, how does your computer find the server, receive HTML/CSS/JS, and paint pixels on your glass screen?',
      resources: [
        { title: 'How Does the Internet Work? (In 5 Minutes)', url: 'https://www.youtube.com/watch?v=7_LPdttKXPc', type: 'video', provider: 'Aaron Jack', durationOrReadTime: '5 mins' },
        { title: 'How Browsers Work: Behind the scenes of modern web browsers', url: 'https://web.dev/howbrowserswork/', type: 'doc', provider: 'Google web.dev', durationOrReadTime: 'Comprehensive Guide' },
      ],
      fanOutRight: [
        {
          id: 'fe-how-browsers',
          title: 'How Browsers Work',
          category: 'Internet',
          difficulty: 'Beginner',
          estimatedHours: 4,
          description: 'Rendering engine parsing, Critical Rendering Path, HTML DOM tree construction, CSSOM tree creation, Layout reflow, Paint, and GPU Composite steps.',
          resources: [
            { title: 'The Critical Rendering Path Explained', url: 'https://www.youtube.com/watch?v=SmE4OwHztCc', type: 'video', provider: 'Google Chrome Developers', durationOrReadTime: '15 mins' },
            { title: 'MDN: How Browsers Work', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work', type: 'doc', provider: 'MDN Web Docs', durationOrReadTime: 'Documentation' },
          ],
        },
        {
          id: 'fe-dns-http',
          title: 'DNS & HTTP Request Cycle',
          category: 'Internet',
          difficulty: 'Beginner',
          estimatedHours: 4,
          description: 'DNS resolution (translating domain names to IP addresses), TCP 3-way handshakes, TLS 1.3 encryption handshakes, and HTTP/1.1 vs HTTP/2 multiplexing vs HTTP/3 QUIC.',
          resources: [
            { title: 'DNS Explained Simply in 3 Minutes', url: 'https://www.youtube.com/watch?v=72snZctFFtA', type: 'video', provider: 'PowerCert', durationOrReadTime: '5 mins' },
            { title: 'HTTP/2 and HTTP/3 Guide', url: 'https://web.dev/performance-http2/', type: 'doc', provider: 'web.dev', durationOrReadTime: 'Guide' },
          ],
        },
        {
          id: 'fe-html-semantic',
          title: 'Semantic HTML5 & Accessibility',
          category: 'HTML',
          difficulty: 'Beginner',
          estimatedHours: 5,
          description: 'Semantic landmarks (<header>, <nav>, <main>, <article>, <aside>, <footer>) over generic <div> tags, accessible form labels, ARIA landmarks, and WCAG AA screen-reader compliance.',
          resources: [
            { title: 'Semantic HTML5 in 100 Seconds', url: 'https://www.youtube.com/watch?v=kGW8Al_cga4', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
            { title: 'MDN HTML Element Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element', type: 'doc', provider: 'MDN Web Docs', durationOrReadTime: 'Reference' },
          ],
        },
        {
          id: 'fe-css-foundations',
          title: 'CSS Box Model & Cascade',
          category: 'CSS',
          difficulty: 'Beginner',
          estimatedHours: 5,
          description: 'The foundational geometry of web styling: Content, Padding, Border, Margin, Box-Sizing: border-box, Specificity calculation scores, and CSS custom properties (variables).',
          resources: [
            { title: 'CSS Box Model Explained Visually', url: 'https://www.youtube.com/watch?v=rIO5326FgPE', type: 'video', provider: 'Kevin Powell', durationOrReadTime: '12 mins' },
            { title: 'MDN CSS Box Model Documentation', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model', type: 'doc', provider: 'MDN', durationOrReadTime: 'Guide' },
          ],
        },
      ],
    },
    {
      id: 'fe-m2-css-layout',
      milestoneTitle: 'CSS Layouts & Responsive Design',
      spineSubtitle: 'Modern Design Systems',
      category: 'CSS Layouts',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 2,
      description: 'Master modern web layout engines: Flexbox for 1D alignments, CSS Grid for 2D macro layouts, fluid responsive typography with clamp(), and utility-first Tailwind CSS design tokens.',
      resources: [
        { title: 'CSS Flexbox and Grid Masterclass', url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc', type: 'video', provider: 'Kevin Powell', durationOrReadTime: '40 mins' },
        { title: 'Tailwind CSS in 100 Seconds', url: 'https://www.youtube.com/watch?v=mr15Xzb1Ook', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
      ],
      leftContainer: {
        id: 'fe-css-container',
        groupTitle: 'Layout Engines',
        side: 'left',
        topics: [
          {
            id: 'fe-flexbox-deep',
            title: 'Flexbox 1D Layout System',
            colSpan: 2,
            category: 'CSS',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Main axis vs Cross axis alignment, flex-grow, flex-shrink, flex-basis, justify-content, align-items, and flex-wrap layouts.',
            resources: [
              { title: 'Flexbox Froggy Game & Tutorial', url: 'https://flexboxfroggy.com/', type: 'doc', provider: 'Interactive Game', durationOrReadTime: 'Interactive' },
              { title: 'Complete Guide to Flexbox on CSS-Tricks', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'doc', provider: 'CSS-Tricks', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'fe-grid-2d',
            title: 'CSS Grid 2D Layouts',
            colSpan: 2,
            category: 'CSS',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'True two-dimensional layouts: grid-template-columns, grid-template-areas, auto-fit vs auto-fill, and minmax() fluid calculations.',
            resources: [
              { title: 'CSS Grid in 100 Seconds', url: 'https://www.youtube.com/watch?v=uuOXPWCh-6o', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Complete Guide to CSS Grid on CSS-Tricks', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'doc', provider: 'CSS-Tricks', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'fe-responsive-media',
            title: 'Responsive Design & Media Queries',
            colSpan: 2,
            category: 'CSS',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Mobile-first methodology, responsive breakpoint queries, fluid clamp() typography, and responsive aspect ratios.',
            resources: [
              { title: 'Mobile First Responsive Design Tutorial', url: 'https://www.youtube.com/watch?v=0ohtVzCSHqs', type: 'video', provider: 'Kevin Powell', durationOrReadTime: '25 mins' },
              { title: 'MDN Media Queries Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries', type: 'doc', provider: 'MDN Web Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'fe-tailwind-tokens',
            title: 'Tailwind CSS & Utility First',
            colSpan: 2,
            category: 'CSS',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Atomic utility classes, JIT compilation, arbitrary values, design token themes, and zero-CSS-file production workflows.',
            resources: [
              { title: 'Tailwind CSS Full Course for Beginners', url: 'https://www.youtube.com/watch?v=ft30zcMlFao', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '2 hours' },
              { title: 'Tailwind CSS Official Documentation', url: 'https://tailwindcss.com/docs', type: 'doc', provider: 'Tailwind Labs', durationOrReadTime: 'Official Docs' },
            ],
          },
        ],
      },
    },
    {
      id: 'fe-m3-javascript',
      milestoneTitle: 'JavaScript & TypeScript',
      spineSubtitle: 'Runtime Language Mastery',
      category: 'JavaScript & TS',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 3,
      description: 'Master the runtime language of the web. Understand the single-threaded asynchronous Event Loop, Promises, async/await, closures, and strict TypeScript types with Zod validation.',
      resources: [
        { title: 'What the heck is the event loop anyway?', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', type: 'video', provider: 'Philip Roberts / JSConf', durationOrReadTime: '26 mins' },
        { title: 'TypeScript in 100 Seconds', url: 'https://www.youtube.com/watch?v=zQnBQ4tB3ZA', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
      ],
      rightContainer: {
        id: 'fe-js-container',
        groupTitle: 'Runtime Language Mastery',
        side: 'right',
        topics: [
          {
            id: 'fe-event-loop',
            title: 'Event Loop & Execution Context',
            colSpan: 2,
            category: 'JavaScript',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Call stack, microtask queue (Promises), macrotask queue (setTimeout), web APIs, and non-blocking asynchronous I/O.',
            resources: [
              { title: 'Visual Guide to JavaScript Event Loop', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', type: 'video', provider: 'JSConf', durationOrReadTime: '25 mins' },
              { title: 'MDN Event Loop Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', type: 'doc', provider: 'MDN', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'fe-async-await',
            title: 'Promises, Async/Await & Fetch',
            colSpan: 2,
            category: 'JavaScript',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Promise chaining, Promise.all, Promise.allSettled, error handling with try/catch, and streaming fetch responses.',
            resources: [
              { title: 'JavaScript Promises in 100 Seconds', url: 'https://www.youtube.com/watch?v=vn3tkFOm4gE', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'JavaScript.info: Promises, async/await', url: 'https://javascript.info/async', type: 'doc', provider: 'javascript.info', durationOrReadTime: 'Handbook' },
            ],
          },
          {
            id: 'fe-ts-core',
            title: 'TypeScript Strict Generics',
            colSpan: 1,
            category: 'TypeScript',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Type narrowing, discriminated unions, generic constraints (<T extends object>), keyof, typeof, and compile-time type safety.',
            resources: [
              { title: 'TypeScript Generics Explained Clearly', url: 'https://www.youtube.com/watch?v=dLPgQRbVquo', type: 'video', provider: 'Matt Pocock', durationOrReadTime: '15 mins' },
              { title: 'Total TypeScript Handbook by Matt Pocock', url: 'https://www.totaltypescript.com/tutorials', type: 'doc', provider: 'Total TypeScript', durationOrReadTime: 'Tutorials' },
            ],
          },
          {
            id: 'fe-ts-zod',
            title: 'Runtime Validation with Zod',
            colSpan: 1,
            category: 'TypeScript',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Parsing untrusted API payloads into runtime-verified TypeScript types with automatic type inference (z.infer<typeof Schema>).',
            resources: [
              { title: 'Zod in 100 Seconds', url: 'https://www.youtube.com/watch?v=L6BE-U3oy80', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Zod Official Documentation', url: 'https://zod.dev/', type: 'doc', provider: 'Zod Team', durationOrReadTime: 'Official Docs' },
            ],
          },
        ],
      },
    },
    {
      id: 'fe-m4-react',
      milestoneTitle: 'React 19 & State Management',
      spineSubtitle: 'Component Architecture',
      category: 'React Framework',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 4,
      description: 'Master React: declarative component rendering, Virtual DOM reconciliation, Hooks (useState, useEffect, useMemo, useCallback), and modern state management with Zustand and TanStack Query.',
      resources: [
        { title: 'React 19 Crash Course (Everything New Explained)', url: 'https://www.youtube.com/watch?v=843nec-IvW0', type: 'video', provider: 'Web Dev Simplified', durationOrReadTime: '30 mins' },
        { title: 'React.dev Official Documentation & Interactive Tutorials', url: 'https://react.dev/', type: 'doc', provider: 'React Team', durationOrReadTime: 'Interactive Tutorial' },
      ],
      leftContainer: {
        id: 'fe-react-container',
        groupTitle: 'Modern React Architecture',
        side: 'left',
        topics: [
          {
            id: 'fe-react-fiber',
            title: 'React Fiber Reconciliation',
            colSpan: 2,
            category: 'React',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Virtual DOM diffing, component life cycle, unique keys, immutable props, and how React batches state re-renders.',
            resources: [
              { title: 'How React Works Behind the Scenes', url: 'https://www.youtube.com/watch?v=7YhdqIR2Yzo', type: 'video', provider: 'Dan Abramov / JSConf', durationOrReadTime: '25 mins' },
              { title: 'React.dev: Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state', type: 'doc', provider: 'React.dev', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'fe-hooks-deep',
            title: 'Hooks: useState, useEffect, useMemo',
            colSpan: 2,
            category: 'React',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Managing reactive state, side effects lifecycles, cleanup functions, dependency arrays, and preventing expensive re-renders.',
            resources: [
              { title: 'All React Hooks in 1 Video', url: 'https://www.youtube.com/watch?v=TNhaISAUyvc', type: 'video', provider: 'Fireship', durationOrReadTime: '15 mins' },
              { title: 'React.dev: Built-in React Hooks Reference', url: 'https://react.dev/reference/react', type: 'doc', provider: 'React.dev', durationOrReadTime: 'Reference' },
            ],
          },
          {
            id: 'fe-zustand',
            title: 'Global State: Zustand & Context',
            colSpan: 1,
            category: 'State',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Minimalist global stores with selector-based re-render subscriptions, avoiding React Context provider hell and unnecessary re-renders.',
            resources: [
              { title: 'Zustand in 100 Seconds', url: 'https://www.youtube.com/watch?v=_ngCLZ5Iz-E', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Zustand Official Documentation & Recipes', url: 'https://docs.pmnd.rs/zustand/getting-started/introduction', type: 'doc', provider: 'Poimandres', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'fe-tanstack',
            title: 'Server State: TanStack Query',
            colSpan: 1,
            category: 'State',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Automated API caching, background refetching, pagination, stale-while-revalidate, and optimistic UI mutations.',
            resources: [
              { title: 'TanStack Query (React Query) Crash Course', url: 'https://www.youtube.com/watch?v=novnyCaa7To', type: 'video', provider: 'Cosden Solutions', durationOrReadTime: '20 mins' },
              { title: 'TanStack Query Documentation', url: 'https://tanstack.com/query/latest', type: 'doc', provider: 'TanStack Team', durationOrReadTime: 'Official Docs' },
            ],
          },
        ],
      },
    },
    {
      id: 'fe-m5-nextjs-perf',
      milestoneTitle: 'Next.js, Security & Performance',
      category: 'Full-Stack UI',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 5,
      description: 'Level up to production: Next.js App Router, React Server Components (RSC), Core Web Vitals optimization (LCP, INP, CLS), and essential web security against XSS and CSRF.',
      resources: [
        { title: 'Next.js 15 Full Course for Beginners', url: 'https://www.youtube.com/watch?v=Zq5fmkH0T78', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '3 hours' },
        { title: 'Web Vitals Overview by Google Chrome Team', url: 'https://web.dev/vitals/', type: 'doc', provider: 'Google web.dev', durationOrReadTime: 'Specification' },
      ],
      rightContainer: {
        id: 'fe-nextjs-container',
        groupTitle: 'Full-Stack & Web Vitals',
        side: 'right',
        topics: [
          {
            id: 'fe-nextjs-app',
            title: 'Next.js App Router & Server Components',
            colSpan: 2,
            category: 'Frameworks',
            difficulty: 'Intermediate',
            estimatedHours: 8,
            description: 'Zero-bundle-size React Server Components, Streaming SSR with Suspense, Server Actions for mutations, and route interceptors.',
            resources: [
              { title: 'Next.js App Router in 100 Seconds', url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Next.js App Router Official Documentation', url: 'https://nextjs.org/docs', type: 'doc', provider: 'Vercel', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'fe-core-vitals',
            title: 'Core Web Vitals (LCP, INP, CLS)',
            colSpan: 2,
            category: 'Performance',
            difficulty: 'Advanced',
            estimatedHours: 6,
            description: 'Largest Contentful Paint (<2.5s), Interaction to Next Paint (<200ms), Cumulative Layout Shift (<0.1), and bundle code-splitting.',
            resources: [
              { title: 'How to Optimize Core Web Vitals for Perfect Lighthouse Scores', url: 'https://www.youtube.com/watch?v=AQqIZ5699_0', type: 'video', provider: 'Google Chrome Devs', durationOrReadTime: '20 mins' },
              { title: 'web.dev Core Web Vitals Guide', url: 'https://web.dev/articles/vitals', type: 'doc', provider: 'Google web.dev', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'fe-web-sec',
            title: 'Frontend Security (CSP, XSS, CORS)',
            colSpan: 2,
            category: 'Security',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Content Security Policy (CSP) headers, escaping sanitized HTML to block Cross-Site Scripting (XSS), and CORS headers.',
            resources: [
              { title: 'Web Security for Frontend Developers in 10 Minutes', url: 'https://www.youtube.com/watch?v=b4O5_7yQ1y4', type: 'video', provider: 'Computerphile', durationOrReadTime: '15 mins' },
              { title: 'MDN Web Security Guidelines', url: 'https://developer.mozilla.org/en-US/docs/Web/Security', type: 'doc', provider: 'MDN Web Docs', durationOrReadTime: 'Handbook' },
            ],
          },
        ],
      },
    },
  ],
};

// =========================================================================
// 4. BACKEND DEVELOPER ROADMAP
// =========================================================================
export const BACKEND_ROADMAP_SH: RoadmapShTrack = {
  id: 'backend',
  title: 'Backend Developer',
  tagline: 'Server Architecture: APIs, Relational SQL, Caching, Messaging & Microservices',
  description: 'Comprehensive backend roadmap designed for beginners starting from scratch. Learn server runtimes, ACID database transactions, Redis caching, event streaming with Kafka, and containerized cloud deployment.',
  badge: 'Server Architecture',
  relatedRoadmaps: [
    { id: 'fullstack', title: 'Full-Stack Developer' },
    { id: 'cs', title: 'Computer Science' },
    { id: 'devops', title: 'DevOps & Cloud' },
  ],
  milestones: [
    {
      id: 'be-m1-runtimes',
      milestoneTitle: 'Server Protocols & Runtimes',
      category: 'Server Runtimes',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 1,
      description: 'Learn how backend servers receive network traffic and coordinate business logic: Node.js and Go runtimes, RESTful API design, and binary gRPC over HTTP/2.',
      resources: [
        { title: 'Backend Web Development Full Course', url: 'https://www.youtube.com/watch?v=oe70UhJC_F4', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '3 hours' },
        { title: 'REST API Best Practices and Design Guidelines', url: 'https://restfulapi.net/', type: 'doc', provider: 'RESTful API Guide', durationOrReadTime: 'Documentation' },
      ],
      fanOutRight: [
        {
          id: 'be-node-go',
          title: 'Node.js & Go Runtimes',
          category: 'Runtime',
          difficulty: 'Beginner',
          estimatedHours: 8,
          description: 'Single-threaded event loop concurrency in Node.js vs Goroutine multiplexing on OS threads in Go. Choosing the right server runtime for your workload.',
          resources: [
            { title: 'Node.js in 100 Seconds', url: 'https://www.youtube.com/watch?v=ENrzD9HAZK4', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
            { title: 'Go in 100 Seconds', url: 'https://www.youtube.com/watch?v=446E-r0rXHI', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
          ],
        },
        {
          id: 'be-http-rest',
          title: 'RESTful API & OpenAPI Spec',
          category: 'Protocols',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'HTTP verbs (GET, POST, PUT, PATCH, DELETE), idempotent endpoints, status codes (200, 201, 400, 401, 403, 404, 500), and OpenAPI Swagger specs.',
          resources: [
            { title: 'HTTP Methods and REST APIs in 5 Minutes', url: 'https://www.youtube.com/watch?v=lsMQRaeKNDk', type: 'video', provider: 'Web Dev Simplified', durationOrReadTime: '10 mins' },
            { title: 'OpenAPI Specification 3.1 Official Documentation', url: 'https://swagger.io/specification/', type: 'doc', provider: 'Swagger.io', durationOrReadTime: 'Spec' },
          ],
        },
        {
          id: 'be-grpc-proto',
          title: 'gRPC & Protocol Buffers',
          category: 'Protocols',
          difficulty: 'Intermediate',
          estimatedHours: 7,
          description: 'Binary serialization over HTTP/2 for ultra-fast, typed inter-service microservice communication with streaming RPCs.',
          resources: [
            { title: 'gRPC in 100 Seconds', url: 'https://www.youtube.com/watch?v=gnchfOoj9Ec', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
            { title: 'Protocol Buffers Official Guide', url: 'https://protobuf.dev/', type: 'doc', provider: 'Google Protobuf', durationOrReadTime: 'Official Docs' },
          ],
        },
      ],
    },
    {
      id: 'be-m2-databases',
      milestoneTitle: 'Relational Databases (PostgreSQL)',
      spineSubtitle: 'Data Persistence',
      category: 'Databases & SQL',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 2,
      description: 'Data is the most valuable asset in any application. Master relational databases, PostgreSQL ACID transactions, B-Tree index optimization with EXPLAIN ANALYZE, and Redis in-memory caching.',
      resources: [
        { title: 'PostgreSQL Tutorial for Beginners (Full Course)', url: 'https://www.youtube.com/watch?v=qw--VYLpxG4', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '4 hours' },
        { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/', type: 'doc', provider: 'PostgreSQL Global Team', durationOrReadTime: 'Manual' },
      ],
      leftContainer: {
        id: 'be-sql-container',
        groupTitle: 'SQL & Transactions',
        side: 'left',
        topics: [
          {
            id: 'be-postgres-acid',
            title: 'PostgreSQL & ACID Properties',
            colSpan: 2,
            category: 'Databases',
            difficulty: 'Beginner',
            estimatedHours: 8,
            description: 'Atomicity (all or nothing), Consistency, Isolation, Durability, relational foreign keys, and third-normal-form schema normalization.',
            resources: [
              { title: 'ACID Transactions in 100 Seconds', url: 'https://www.youtube.com/watch?v=pomxJODecQs', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'PostgreSQL Transactions Documentation', url: 'https://www.postgresql.org/docs/current/tutorial-transactions.html', type: 'doc', provider: 'PostgreSQL Docs', durationOrReadTime: 'Manual' },
            ],
          },
          {
            id: 'be-indexing-explain',
            title: 'B-Tree Indexing & EXPLAIN ANALYZE',
            colSpan: 2,
            category: 'Databases',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Index scans vs sequential scans, composite multi-column indexes, partial indexes, and reading PostgreSQL execution plans with EXPLAIN ANALYZE.',
            resources: [
              { title: 'Database Indexing Explained (Why Your Queries are Slow)', url: 'https://www.youtube.com/watch?v=HubezKbFL7E', type: 'video', provider: 'Hussein Nasser', durationOrReadTime: '20 mins' },
              { title: 'Use The Index, Luke! Complete SQL Indexing Guide', url: 'https://use-the-index-luke.com/', type: 'doc', provider: 'Markus Winand', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'be-locking',
            title: 'Isolation Levels & Row Locking',
            colSpan: 1,
            category: 'Databases',
            difficulty: 'Advanced',
            estimatedHours: 7,
            description: 'Read Committed, Repeatable Read, Serializable isolation levels, and SELECT FOR UPDATE row locking to prevent double-spending in banking and ticket booking.',
            resources: [
              { title: 'Database Isolation Levels and Concurrency Anomalies', url: 'https://www.youtube.com/watch?v=pomxJODecQs', type: 'video', provider: 'Hussein Nasser', durationOrReadTime: '25 mins' },
              { title: 'PostgreSQL Explicit Locking Documentation', url: 'https://www.postgresql.org/docs/current/explicit-locking.html', type: 'doc', provider: 'PostgreSQL Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'be-orm-tooling',
            title: 'Drizzle ORM & Migrations',
            colSpan: 1,
            category: 'Databases',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Type-safe SQL schemas with zero runtime overhead, automatic migration generation, and TypeScript type inference from schema declarations.',
            resources: [
              { title: 'Drizzle ORM in 100 Seconds', url: 'https://www.youtube.com/watch?v=hGbpzC-d00s', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Drizzle ORM Official Documentation', url: 'https://orm.drizzle.team/docs/overview', type: 'doc', provider: 'Drizzle Team', durationOrReadTime: 'Official Docs' },
            ],
          },
        ],
      },
      rightContainer: {
        id: 'be-caching-nosql',
        groupTitle: 'Caching & NoSQL',
        side: 'right',
        topics: [
          {
            id: 'be-redis-core',
            title: 'Redis In-Memory Caching',
            colSpan: 2,
            category: 'Caching',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Cache-Aside and Write-Through caching patterns, TTL expiration, and reducing database load by 90% for hot queries.',
            resources: [
              { title: 'Redis in 100 Seconds', url: 'https://www.youtube.com/watch?v=G1rOthIU-uo', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Redis University Free Courses & Docs', url: 'https://redis.io/university/', type: 'doc', provider: 'Redis Team', durationOrReadTime: 'Courses' },
            ],
          },
          {
            id: 'be-redis-locks',
            title: 'Redis Distributed Locks & Pub/Sub',
            colSpan: 2,
            category: 'Caching',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Redlock algorithm for distributed multi-server mutual exclusion, atomic SET NX EX, and high-speed inter-process pub/sub broadcasting.',
            resources: [
              { title: 'Distributed Locking with Redis (Redlock Explained)', url: 'https://www.youtube.com/watch?v=mGbeI05iG-M', type: 'video', provider: 'Hussein Nasser', durationOrReadTime: '18 mins' },
              { title: 'Distributed Locks with Redis Documentation', url: 'https://redis.io/docs/manual/patterns/distributed-locks/', type: 'doc', provider: 'Redis Docs', durationOrReadTime: 'Manual' },
            ],
          },
          {
            id: 'be-mongo-doc',
            title: 'MongoDB & Document Stores',
            colSpan: 2,
            category: 'NoSQL',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Flexible JSON BSON document schemas, aggregation pipelines, replica sets, and horizontal sharding strategies.',
            resources: [
              { title: 'MongoDB in 100 Seconds', url: 'https://www.youtube.com/watch?v=-0X8mr6Q8Ew', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'MongoDB University Free Developer Path', url: 'https://learn.mongodb.com/', type: 'doc', provider: 'MongoDB', durationOrReadTime: 'Tutorials' },
            ],
          },
        ],
      },
    },
    {
      id: 'be-m3-messaging',
      milestoneTitle: 'Message Queues & Event Streaming',
      category: 'Async Systems',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 3,
      description: 'Decouple heavy tasks from synchronous HTTP requests using RabbitMQ work queues, Apache Kafka distributed event logs, and token-bucket rate limiters.',
      resources: [
        { title: 'Message Queues Explained (RabbitMQ vs Kafka)', url: 'https://www.youtube.com/watch?v=oUJbuFMyBDk', type: 'video', provider: 'ByteByteGo', durationOrReadTime: '15 mins' },
        { title: 'Kafka in 100 Seconds', url: 'https://www.youtube.com/watch?v=R873BlNVUB4', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
      ],
      leftContainer: {
        id: 'be-queue-container',
        groupTitle: 'Asynchronous Processing',
        side: 'left',
        topics: [
          {
            id: 'be-rabbitmq-queues',
            title: 'RabbitMQ & Task Workers',
            colSpan: 2,
            category: 'Queues',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'AMQP exchanges (direct, topic, fanout), worker task pools, message acknowledgements, and dead-letter queue retries for failed background jobs.',
            resources: [
              { title: 'RabbitMQ in 100 Seconds', url: 'https://www.youtube.com/watch?v=deG25y_r6JY', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'RabbitMQ Official Tutorials in All Languages', url: 'https://www.rabbitmq.com/getstarted.html', type: 'doc', provider: 'RabbitMQ Docs', durationOrReadTime: 'Tutorials' },
            ],
          },
          {
            id: 'be-kafka-streams',
            title: 'Apache Kafka Event Streams',
            colSpan: 2,
            category: 'Streaming',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Distributed commit log architecture, partition hashing, consumer groups, log retention, and exactly-once processing semantics.',
            resources: [
              { title: 'Apache Kafka Architecture Explained Visually', url: 'https://www.youtube.com/watch?v=Ch5VhJzaoaI', type: 'video', provider: 'ByteByteGo', durationOrReadTime: '18 mins' },
              { title: 'Apache Kafka Official Documentation', url: 'https://kafka.apache.org/documentation/', type: 'doc', provider: 'Apache Software Foundation', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'be-circuit-breaker',
            title: 'Rate Limiting & Circuit Breakers',
            colSpan: 2,
            category: 'Resilience',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Token bucket algorithms, sliding window log rate limiters, exponential backoff retries, and graceful degradation with circuit breakers.',
            resources: [
              { title: 'How to Implement Rate Limiting with Redis', url: 'https://www.youtube.com/watch?v=CRGPbCbRpHU', type: 'video', provider: 'Hussein Nasser', durationOrReadTime: '15 mins' },
              { title: 'Circuit Breaker Pattern Guide on Martin Fowler', url: 'https://martinfowler.com/bliki/CircuitBreaker.html', type: 'doc', provider: 'Martin Fowler', durationOrReadTime: 'Article' },
            ],
          },
        ],
      },
    },
    {
      id: 'be-m4-containers',
      milestoneTitle: 'Containers & Microservices',
      category: 'Cloud Deployment',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 4,
      description: 'Package backend microservices into lightweight Docker images, orchestrate zero-downtime rolling deployments on Kubernetes, and diagnose distributed latency with OpenTelemetry traces.',
      resources: [
        { title: 'Docker in 100 Seconds', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
        { title: 'Kubernetes in 100 Seconds', url: 'https://www.youtube.com/watch?v=PivpCKEiQOQ', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
      ],
      rightContainer: {
        id: 'be-deploy-container',
        groupTitle: 'Production Systems',
        side: 'right',
        topics: [
          {
            id: 'be-docker-files',
            title: 'Docker Multi-Stage Builds',
            colSpan: 2,
            category: 'DevOps',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Compiling apps inside intermediate build stages and copying only static binaries into minimal 30MB alpine scratch images to eliminate security vulnerabilities.',
            resources: [
              { title: 'Docker Multi-Stage Builds Tutorial', url: 'https://www.youtube.com/watch?v=wXhhRgt_W7Y', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '16 mins' },
              { title: 'Docker Official Multi-Stage Build Docs', url: 'https://docs.docker.com/build/building/multi-stage/', type: 'doc', provider: 'Docker Docs', durationOrReadTime: 'Docs' },
            ],
          },
          {
            id: 'be-k8s-basics',
            title: 'Kubernetes Pods, Services & Ingress',
            colSpan: 2,
            category: 'DevOps',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Declarative YAML manifests, rolling updates, liveness/readiness probes, and ClusterIP, NodePort, and LoadBalancer abstractions.',
            resources: [
              { title: 'Kubernetes Course for Beginners (Full 4-Hour Course)', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '4 hours' },
              { title: 'Kubernetes Official Documentation and Concepts', url: 'https://kubernetes.io/docs/concepts/', type: 'doc', provider: 'Kubernetes.io', durationOrReadTime: 'Official Docs' },
            ],
          },
          {
            id: 'be-opentelemetry',
            title: 'OpenTelemetry & Distributed Tracing',
            colSpan: 2,
            category: 'Observability',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Injecting trace IDs and span IDs into HTTP headers across microservice network boundaries to pinpoint slow database queries.',
            resources: [
              { title: 'OpenTelemetry in 100 Seconds', url: 'https://www.youtube.com/watch?v=r8UvWSX3KA8', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'OpenTelemetry Official Documentation', url: 'https://opentelemetry.io/docs/', type: 'doc', provider: 'OpenTelemetry Project', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
    },
  ],
};

// =========================================================================
// 5. FULL-STACK DEVELOPER ROADMAP
// =========================================================================
export const FULLSTACK_ROADMAP_SH: RoadmapShTrack = {
  id: 'fullstack',
  title: 'Full-Stack Developer',
  tagline: 'End-to-End Web Applications: React, Next.js, Node.js & Cloud Databases',
  description: 'Master the entire software stack from user interfaces down to database persistence, authentication sessions, and automated cloud deployments.',
  badge: 'End-to-End',
  relatedRoadmaps: [
    { id: 'frontend', title: 'Frontend Developer' },
    { id: 'backend', title: 'Backend Developer' },
    { id: 'ai-ml', title: 'AI Engineer' },
  ],
  milestones: [
    {
      id: 'fs-m1-foundations',
      milestoneTitle: 'Client-Server Foundations',
      category: 'Stack Architecture',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 1,
      description: 'Connect frontend user interfaces with backend servers and databases into a unified, responsive web application.',
      resources: [
        { title: 'Full Stack Web Development for Beginners (Full Course)', url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '5 hours' },
        { title: 'The Complete Fullstack Developer Guide', url: 'https://roadmap.sh/full-stack', type: 'doc', provider: 'roadmap.sh', durationOrReadTime: 'Interactive Guide' },
      ],
      fanOutRight: [
        {
          id: 'fs-client-server',
          title: 'Client-Server Communication',
          category: 'Architecture',
          difficulty: 'Beginner',
          estimatedHours: 4,
          description: 'HTTP request/response lifecycles, JSON serialization, stateless sessions, and status code negotiation between browser and API.',
          resources: [
            { title: 'Client-Server Architecture Explained in 5 Minutes', url: 'https://www.youtube.com/watch?v=0_u6eJ1j1uU', type: 'video', provider: 'ByteByteGo', durationOrReadTime: '6 mins' },
            { title: 'MDN: An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'doc', provider: 'MDN Web Docs', durationOrReadTime: 'Guide' },
          ],
        },
        {
          id: 'fs-react-core',
          title: 'React 19 Component Systems',
          category: 'Frontend',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Declarative component trees, custom hooks, reactive state bindings, and Tailwind CSS design tokens.',
          resources: [
            { title: 'React 19 Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=843nec-IvW0', type: 'video', provider: 'Web Dev Simplified', durationOrReadTime: '30 mins' },
            { title: 'React.dev Official Interactive Tutorial', url: 'https://react.dev/learn', type: 'doc', provider: 'React Team', durationOrReadTime: 'Tutorial' },
          ],
        },
        {
          id: 'fs-node-api',
          title: 'Node.js & Express REST APIs',
          category: 'Backend',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Routing controllers, middleware authentication chains, centralized error boundaries, and input validation.',
          resources: [
            { title: 'Node.js & Express API from Scratch', url: 'https://www.youtube.com/watch?v=7_LPdttKXPc', type: 'video', provider: 'Dave Gray', durationOrReadTime: '1 hour' },
            { title: 'Express.js Official Documentation', url: 'https://expressjs.com/', type: 'doc', provider: 'Express Team', durationOrReadTime: 'Documentation' },
          ],
        },
        {
          id: 'fs-postgres-schema',
          title: 'PostgreSQL Database Design',
          category: 'Database',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Relational table modeling, primary & foreign keys, unique constraints, and database normalization.',
          resources: [
            { title: 'SQL & Database Design in 100 Seconds', url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
            { title: 'PostgreSQL Tutorial for Beginners', url: 'https://www.postgresqltutorial.com/', type: 'doc', provider: 'PostgreSQL Tutorial', durationOrReadTime: 'Tutorials' },
          ],
        },
      ],
    },
    {
      id: 'fs-m2-type-safety',
      milestoneTitle: 'End-to-End Type Safety',
      spineSubtitle: 'Universal Types',
      category: 'Type Systems',
      difficulty: 'Intermediate',
      estimatedHours: 8,
      stepNumber: 2,
      description: 'Eliminate silent runtime bugs by sharing strict TypeScript contracts across frontend and backend boundaries.',
      resources: [
        { title: 'End-to-End Type Safety with TypeScript, Zod and Drizzle', url: 'https://www.youtube.com/watch?v=hGbpzC-d00s', type: 'video', provider: 'Theo - t3.gg', durationOrReadTime: '20 mins' },
        { title: 'TypeScript Monorepo Shared Types Guide', url: 'https://turbo.build/repo/docs', type: 'doc', provider: 'Turborepo Docs', durationOrReadTime: 'Guide' },
      ],
      leftContainer: {
        id: 'fs-types-container',
        groupTitle: 'Type Invariants',
        side: 'left',
        topics: [
          {
            id: 'fs-shared-types',
            title: 'Universal TypeScript Types',
            colSpan: 2,
            category: 'TypeScript',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Sharing interface contracts between React frontend and Node backend so API response refactors are caught instantly at compile time.',
            resources: [
              { title: 'Sharing Types Between Frontend and Backend', url: 'https://www.youtube.com/watch?v=dLPgQRbVquo', type: 'video', provider: 'Matt Pocock', durationOrReadTime: '15 mins' },
              { title: 'TypeScript Project References and Monorepos', url: 'https://www.typescriptlang.org/docs/handbook/project-references.html', type: 'doc', provider: 'TypeScript Handbook', durationOrReadTime: 'Handbook' },
            ],
          },
          {
            id: 'fs-drizzle-migrations',
            title: 'Drizzle ORM & Type Invariants',
            colSpan: 2,
            category: 'Database',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Inferring TypeScript types directly from relational database schema declarations, guaranteeing database types match API responses.',
            resources: [
              { title: 'Drizzle ORM Quickstart with Postgres', url: 'https://www.youtube.com/watch?v=hGbpzC-d00s', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Drizzle ORM Schema Declaration Docs', url: 'https://orm.drizzle.team/docs/sql-schema-declaration', type: 'doc', provider: 'Drizzle Docs', durationOrReadTime: 'Docs' },
            ],
          },
          {
            id: 'fs-zod-api-guard',
            title: 'Zod API Schema Validation',
            colSpan: 2,
            category: 'Security',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Guarding API boundaries against malformed payloads with runtime validation that automatically generates compile-time types.',
            resources: [
              { title: 'Zod Schema Validation Masterclass', url: 'https://www.youtube.com/watch?v=L6BE-U3oy80', type: 'video', provider: 'Web Dev Simplified', durationOrReadTime: '15 mins' },
              { title: 'Zod API Reference Guide', url: 'https://zod.dev/', type: 'doc', provider: 'Zod Team', durationOrReadTime: 'API Reference' },
            ],
          },
        ],
      },
    },
    {
      id: 'fs-m3-nextjs-app',
      milestoneTitle: 'Next.js Full-Stack App Router',
      category: 'Unified Full-Stack',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 3,
      description: 'Combine frontend UI and backend server actions into a single framework with Next.js App Router, React Server Components, and session security.',
      resources: [
        { title: 'Next.js 15 Full-Stack Course', url: 'https://www.youtube.com/watch?v=Zq5fmkH0T78', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '3 hours' },
        { title: 'Next.js Official Documentation', url: 'https://nextjs.org/docs', type: 'doc', provider: 'Vercel Docs', durationOrReadTime: 'Documentation' },
      ],
      rightContainer: {
        id: 'fs-nextjs-full-container',
        groupTitle: 'Unified Framework',
        side: 'right',
        topics: [
          {
            id: 'fs-server-components',
            title: 'React Server Components & Streaming',
            colSpan: 2,
            category: 'Next.js',
            difficulty: 'Intermediate',
            estimatedHours: 8,
            description: 'Rendering components directly on the server to query databases with zero client bundle overhead, streaming UI with Suspense.',
            resources: [
              { title: 'React Server Components in 100 Seconds', url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'RSC Concepts on Next.js Docs', url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components', type: 'doc', provider: 'Next.js Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'fs-server-actions',
            title: 'Server Actions & Mutations',
            colSpan: 2,
            category: 'Next.js',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Invoking server-side database writes directly from form elements without needing to write boilerplate REST endpoints.',
            resources: [
              { title: 'Next.js Server Actions Tutorial', url: 'https://www.youtube.com/watch?v=dDpZfOQBMaU', type: 'video', provider: 'Web Dev Simplified', durationOrReadTime: '20 mins' },
              { title: 'Server Actions Documentation', url: 'https://nextjs.org/docs/app/building-your-application/data-mutation/server-actions-and-mutations', type: 'doc', provider: 'Next.js Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'fs-auth-sessions',
            title: 'Session Cookies & OAuth 2.0',
            colSpan: 2,
            category: 'Auth',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'HTTP-only secure cookies, JWT token verification, CSRF protection, and Google Workspace OAuth login flows.',
            resources: [
              { title: 'OAuth 2.0 and OpenID Connect in Plain English', url: 'https://www.youtube.com/watch?v=996OiexHze0', type: 'video', provider: 'Okta Dev', durationOrReadTime: '30 mins' },
              { title: 'Auth.js (NextAuth) Documentation and Guides', url: 'https://authjs.dev/', type: 'doc', provider: 'Auth.js Team', durationOrReadTime: 'Handbook' },
            ],
          },
        ],
      },
    },
    {
      id: 'fs-m4-realtime-deploy',
      milestoneTitle: 'Real-Time Sync & Cloud Deployment',
      category: 'Cloud Production',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 4,
      description: 'Ship your fullstack app to production: WebSockets for live chat, Docker containerization, and automated GitHub Actions CI/CD.',
      resources: [
        { title: 'Docker and Cloud Run Deployment Full Guide', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', type: 'video', provider: 'Google Cloud Tech', durationOrReadTime: '25 mins' },
        { title: 'GitHub Actions CI/CD Pipeline Tutorial', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '40 mins' },
      ],
      leftContainer: {
        id: 'fs-cloud-container',
        groupTitle: 'Production Operations',
        side: 'left',
        topics: [
          {
            id: 'fs-websockets',
            title: 'WebSockets & Live Collaboration',
            colSpan: 2,
            category: 'Real-Time',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Bi-directional persistent connections for instant chat, live cursor synchronization, and collaborative drawing canvases.',
            resources: [
              { title: 'WebSockets in 100 Seconds', url: 'https://www.youtube.com/watch?v=1BfCnjr_Vl3', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'MDN WebSockets API Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', type: 'doc', provider: 'MDN', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'fs-docker-cloud-run',
            title: 'Docker Containers & Cloud Run',
            colSpan: 2,
            category: 'Deployment',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Packaging full-stack applications for automated deployment on serverless containers with scale-to-zero cost savings.',
            resources: [
              { title: 'Deploying Docker Containers to Google Cloud Run', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', type: 'video', provider: 'Google Cloud', durationOrReadTime: '20 mins' },
              { title: 'Cloud Run Official Documentation', url: 'https://cloud.google.com/run/docs', type: 'doc', provider: 'Google Cloud Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'fs-ci-cd',
            title: 'GitHub Actions Automated CI/CD',
            colSpan: 2,
            category: 'DevOps',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Automated typechecking, linting, unit testing, docker build, and deployment pipelines triggered on every git push.',
            resources: [
              { title: 'GitHub Actions in 100 Seconds', url: 'https://www.youtube.com/watch?v=eB0nUzAI7M8', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'GitHub Actions Documentation and Starter Workflows', url: 'https://docs.github.com/en/actions', type: 'doc', provider: 'GitHub Docs', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
    },
  ],
};

// =========================================================================
// 6. DEVOPS & CLOUD INFRASTRUCTURE ROADMAP
// =========================================================================
export const DEVOPS_ROADMAP_SH: RoadmapShTrack = {
  id: 'devops',
  title: 'DevOps & Cloud Engineer',
  tagline: 'Linux, Docker Containers, Kubernetes, Terraform & CI/CD Pipelines',
  description: 'Master the modern DevOps toolchain from scratch: Linux administration, containerization, Kubernetes orchestration, Infrastructure as Code with Terraform, and production observability.',
  badge: 'Cloud Infrastructure',
  relatedRoadmaps: [
    { id: 'backend', title: 'Backend Developer' },
    { id: 'cybersecurity', title: 'Cybersecurity' },
    { id: 'fullstack', title: 'Full-Stack Developer' },
  ],
  milestones: [
    {
      id: 'dev-m1-linux',
      milestoneTitle: 'Linux & Networking Basics',
      category: 'Linux & Shell',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 1,
      description: 'Linux powers over 90% of the world\'s cloud servers. Master the Bash terminal, system administration, and computer networking fundamentals.',
      resources: [
        { title: 'Linux for Beginners Full Course', url: 'https://www.youtube.com/watch?v=sWbGOq-8Nqw', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '3 hours' },
        { title: 'DevOps Roadmap by roadmap.sh', url: 'https://roadmap.sh/devops', type: 'doc', provider: 'roadmap.sh', durationOrReadTime: 'Guide' },
      ],
      fanOutRight: [
        {
          id: 'dev-bash',
          title: 'Bash & Shell Scripting',
          category: 'Linux',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Process management (ps, top, kill), standard streams (stdin, stdout, stderr), pipes (|), and automating system maintenance scripts.',
          resources: [
            { title: 'Bash Scripting Full Course', url: 'https://www.youtube.com/watch?v=tK9Oc6AEnR4', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '2 hours' },
            { title: 'Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/', type: 'doc', provider: 'GNU Foundation', durationOrReadTime: 'Manual' },
          ],
        },
        {
          id: 'dev-networking-protocols',
          title: 'Networking: TCP/IP, DNS & Routing',
          category: 'Networking',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Subnetting, CIDR notation (e.g. 10.0.0.0/16), NAT, iptables firewalls, and load balancing algorithms (Round Robin, Least Connections).',
          resources: [
            { title: 'Computer Networking Full Course', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '4 hours' },
            { title: 'Cloudflare Learning Center: Networking Basics', url: 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/', type: 'doc', provider: 'Cloudflare', durationOrReadTime: 'Handbook' },
          ],
        },
        {
          id: 'dev-ssh-keys',
          title: 'SSH Keys & Server Hardening',
          category: 'Security',
          difficulty: 'Beginner',
          estimatedHours: 4,
          description: 'Public key cryptography, SSH config aliases, UFW firewall rules, and disabling password logins for non-root users.',
          resources: [
            { title: 'SSH Keys Explained Simply', url: 'https://www.youtube.com/watch?v=dPAw4opzNek', type: 'video', provider: 'Fireship', durationOrReadTime: '5 mins' },
            { title: 'Ubuntu Server Security Hardening Guide', url: 'https://ubuntu.com/server/docs/security-hardening', type: 'doc', provider: 'Canonical Ubuntu', durationOrReadTime: 'Guide' },
          ],
        },
      ],
    },
    {
      id: 'dev-m2-containers',
      milestoneTitle: 'Docker & Containerization',
      spineSubtitle: 'Microservice Runtimes',
      category: 'Containers',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 2,
      description: 'Eliminate "it works on my machine" forever by packaging applications, runtimes, and dependencies into portable Docker containers.',
      resources: [
        { title: 'Docker Full Course for Beginners', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '3 hours' },
        { title: 'Docker Official Get Started Tutorial', url: 'https://docs.docker.com/get-started/', type: 'doc', provider: 'Docker Docs', durationOrReadTime: 'Tutorial' },
      ],
      leftContainer: {
        id: 'dev-docker-container',
        groupTitle: 'Container Engines',
        side: 'left',
        topics: [
          {
            id: 'dev-docker-arch',
            title: 'Docker Namespaces & Cgroups',
            colSpan: 2,
            category: 'Docker',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Linux kernel primitives behind containers: PID/Network namespaces for process isolation and Control Groups (cgroups) for CPU/memory limits.',
            resources: [
              { title: 'How Docker Works Under the Hood', url: 'https://www.youtube.com/watch?v=sK5i-N345W8', type: 'video', provider: 'LiveOverflow', durationOrReadTime: '20 mins' },
              { title: 'Docker Architecture Overview', url: 'https://docs.docker.com/get-started/overview/', type: 'doc', provider: 'Docker Docs', durationOrReadTime: 'Docs' },
            ],
          },
          {
            id: 'dev-dockerfile-opt',
            title: 'Optimized Multi-Stage Builds',
            colSpan: 2,
            category: 'Docker',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Layer caching, minimal scratch/distroless bases, non-root USER execution, and automated vulnerability scanning with Trivy.',
            resources: [
              { title: 'Docker Multi-Stage Build Best Practices', url: 'https://www.youtube.com/watch?v=wXhhRgt_W7Y', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '18 mins' },
              { title: 'Dockerfile Best Practices Guide', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', type: 'doc', provider: 'Docker Docs', durationOrReadTime: 'Best Practices' },
            ],
          },
          {
            id: 'dev-compose',
            title: 'Docker Compose Local Stacks',
            colSpan: 2,
            category: 'Docker',
            difficulty: 'Beginner',
            estimatedHours: 4,
            description: 'Multi-container networks, volume persistence, and environment variable injection for spinning up app, database, and Redis in 1 command.',
            resources: [
              { title: 'Docker Compose in 100 Seconds', url: 'https://www.youtube.com/watch?v=DM65_X4ursA', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Docker Compose Documentation and Specification', url: 'https://docs.docker.com/compose/', type: 'doc', provider: 'Docker Docs', durationOrReadTime: 'Documentation' },
            ],
          },
        ],
      },
    },
    {
      id: 'dev-m3-k8s',
      milestoneTitle: 'Kubernetes Orchestration',
      category: 'Orchestration',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 3,
      description: 'Orchestrate hundreds of microservice containers across a cloud cluster with automated rollouts, self-healing pod restarts, and load balancing.',
      resources: [
        { title: 'Kubernetes Tutorial for Beginners (Full 4-Hour Course)', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '4 hours' },
        { title: 'Kubernetes Official Documentation', url: 'https://kubernetes.io/docs/', type: 'doc', provider: 'CNCF', durationOrReadTime: 'Official Docs' },
      ],
      rightContainer: {
        id: 'dev-k8s-container',
        groupTitle: 'Cluster Management',
        side: 'right',
        topics: [
          {
            id: 'dev-k8s-architecture',
            title: 'Control Plane vs Worker Nodes',
            colSpan: 2,
            category: 'Kubernetes',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'kube-apiserver, etcd distributed key-value store, kube-scheduler, kubelet node agents, and container runtime interface (CRI).',
            resources: [
              { title: 'Kubernetes Architecture Explained', url: 'https://www.youtube.com/watch?v=umXEmn3cMWY', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '20 mins' },
              { title: 'Kubernetes Components Documentation', url: 'https://kubernetes.io/docs/concepts/overview/components/', type: 'doc', provider: 'Kubernetes Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'dev-k8s-deployments',
            title: 'Pods, Deployments & Services',
            colSpan: 2,
            category: 'Kubernetes',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Declarative YAML manifests, rolling updates, replica counts, and ClusterIP, NodePort, and LoadBalancer abstractions.',
            resources: [
              { title: 'Kubernetes Deployments and Services in 100 Seconds', url: 'https://www.youtube.com/watch?v=PivpCKEiQOQ', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Deployments Concepts on Kubernetes Docs', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/', type: 'doc', provider: 'Kubernetes Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'dev-helm-charts',
            title: 'Helm Package Management',
            colSpan: 2,
            category: 'Kubernetes',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Parameterized templates, values.yaml overrides, release versioning, and atomic rollbacks for Kubernetes applications.',
            resources: [
              { title: 'Helm Package Manager Explained in 10 Minutes', url: 'https://www.youtube.com/watch?v=-ykwb1d0DXU', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '12 mins' },
              { title: 'Helm Official Documentation and Chart Template Guide', url: 'https://helm.sh/docs/', type: 'doc', provider: 'Helm Project', durationOrReadTime: 'Docs' },
            ],
          },
        ],
      },
    },
    {
      id: 'dev-m4-iac',
      milestoneTitle: 'Infrastructure as Code (Terraform)',
      spineSubtitle: 'Automated Cloud Provisioning',
      category: 'Infrastructure as Code',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 4,
      description: 'Define cloud infrastructure (VPCs, servers, databases, security firewalls) as version-controlled code using HashiCorp Terraform.',
      resources: [
        { title: 'Terraform Full Course for Beginners', url: 'https://www.youtube.com/watch?v=7xngnjfIlK4', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '2 hours' },
        { title: 'Terraform Official Tutorials by HashiCorp', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'doc', provider: 'HashiCorp', durationOrReadTime: 'Tutorials' },
      ],
      leftContainer: {
        id: 'dev-iac-container',
        groupTitle: 'Declarative Cloud',
        side: 'left',
        topics: [
          {
            id: 'dev-terraform-core',
            title: 'Terraform HCL Syntax & State',
            colSpan: 2,
            category: 'Terraform',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'HCL syntax, terraform.tfstate state locking in S3/GCS, plan execution, and reusable cloud provider modules.',
            resources: [
              { title: 'Terraform in 100 Seconds', url: 'https://www.youtube.com/watch?v=tomUWcQ0P3k', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
              { title: 'Terraform State Management Best Practices', url: 'https://developer.hashicorp.com/terraform/language/state', type: 'doc', provider: 'HashiCorp Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'dev-ansible-config',
            title: 'Ansible Playbooks & Configuration',
            colSpan: 2,
            category: 'IaC',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Idempotent server configuration management over SSH without requiring client agents on target machines.',
            resources: [
              { title: 'Ansible 101 for Beginners', url: 'https://www.youtube.com/watch?v=goclfp6a2IQ', type: 'video', provider: 'Jeff Geerling', durationOrReadTime: '30 mins' },
              { title: 'Ansible Official Documentation', url: 'https://docs.ansible.com/', type: 'doc', provider: 'Red Hat Ansible', durationOrReadTime: 'Official Manual' },
            ],
          },
        ],
      },
    },
    {
      id: 'dev-m5-cicd',
      milestoneTitle: 'CI/CD & GitOps Deployment',
      category: 'Continuous Delivery',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 5,
      description: 'Automate testing, container building, and deployment pipelines using GitHub Actions, ArgoCD GitOps, and Prometheus monitoring.',
      resources: [
        { title: 'CI/CD Pipelines Explained', url: 'https://www.youtube.com/watch?v=scEDHsr3APg', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '20 mins' },
        { title: 'ArgoCD GitOps in 100 Seconds', url: 'https://www.youtube.com/watch?v=MeU5_k9bhrU', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
      ],
      rightContainer: {
        id: 'dev-cicd-container',
        groupTitle: 'Continuous Delivery',
        side: 'right',
        topics: [
          {
            id: 'dev-github-actions',
            title: 'GitHub Actions Workflows',
            colSpan: 2,
            category: 'CI/CD',
            difficulty: 'Beginner',
            estimatedHours: 6,
            description: 'Automated test runners, matrix parallel builds, encrypted secret masking, and semantic release publishing on git push.',
            resources: [
              { title: 'GitHub Actions Crash Course', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '25 mins' },
              { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'doc', provider: 'GitHub Docs', durationOrReadTime: 'Documentation' },
            ],
          },
          {
            id: 'dev-argocd-gitops',
            title: 'ArgoCD & GitOps Reconcilers',
            colSpan: 2,
            category: 'GitOps',
            difficulty: 'Advanced',
            estimatedHours: 7,
            description: 'Continuous reconciliation of Git repository configuration manifests directly into live Kubernetes production clusters.',
            resources: [
              { title: 'ArgoCD Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=MeU5_k9bhrU', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '22 mins' },
              { title: 'ArgoCD Official Documentation', url: 'https://argo-cd.readthedocs.io/', type: 'doc', provider: 'Argo Project', durationOrReadTime: 'Docs' },
            ],
          },
          {
            id: 'dev-prometheus-grafana',
            title: 'Prometheus & Grafana Dashboards',
            colSpan: 2,
            category: 'Monitoring',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Metrics scraping, PromQL queries, Alertmanager notification rules, and visual system health dashboards for production clusters.',
            resources: [
              { title: 'Prometheus & Grafana Setup in 15 Minutes', url: 'https://www.youtube.com/watch?v=h4Sl21AKD28', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '25 mins' },
              { title: 'Prometheus Documentation & Architecture', url: 'https://prometheus.io/docs/introduction/overview/', type: 'doc', provider: 'Prometheus.io', durationOrReadTime: 'Docs' },
            ],
          },
        ],
      },
    },
  ],
};

// =========================================================================
// 7. CYBERSECURITY ROADMAP
// =========================================================================
export const CYBERSECURITY_ROADMAP_SH: RoadmapShTrack = {
  id: 'cybersecurity',
  title: 'Cybersecurity Specialist',
  tagline: 'Defensive Blue Team, Threat Hunting, Offensive Red Team & Security Architecture',
  description: 'Master practical security engineering from scratch: network packet analysis, SIEM log monitoring, OWASP Top 10 web vulnerabilities, IAM access control, and incident response.',
  badge: 'Defensive & Offensive',
  relatedRoadmaps: [
    { id: 'devops', title: 'DevOps & Cloud' },
    { id: 'backend', title: 'Backend Developer' },
    { id: 'cs', title: 'Computer Science' },
  ],
  milestones: [
    {
      id: 'sec-m1-foundations',
      milestoneTitle: 'Security Foundations & Networks',
      category: 'Security Foundations',
      difficulty: 'Beginner',
      estimatedHours: 8,
      stepNumber: 1,
      description: 'Understand how attackers think and how computer networks defend themselves: OSI model layers, packet sniffing with Wireshark, and applied cryptography.',
      resources: [
        { title: 'Cybersecurity for Beginners (Full Course)', url: 'https://www.youtube.com/watch?v=inWWhr5tnEA', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '2 hours' },
        { title: 'Cybersecurity Roadmap by roadmap.sh', url: 'https://roadmap.sh/cyber-security', type: 'doc', provider: 'roadmap.sh', durationOrReadTime: 'Interactive Guide' },
      ],
      fanOutRight: [
        {
          id: 'sec-osi-model',
          title: 'OSI Model & Packet Analysis',
          category: 'Networking',
          difficulty: 'Beginner',
          estimatedHours: 6,
          description: 'Wireshark packet sniffing, TCP flags (SYN, ACK, FIN, RST), ARP spoofing attacks, and DNS poisoning.',
          resources: [
            { title: 'The OSI Model in 300 Seconds', url: 'https://www.youtube.com/watch?v=vv4y_uOneC8', type: 'video', provider: 'NetworkChuck', durationOrReadTime: '15 mins' },
            { title: 'Wireshark Packet Analysis Guide', url: 'https://www.wireshark.org/docs/', type: 'doc', provider: 'Wireshark User Guide', durationOrReadTime: 'User Guide' },
          ],
        },
        {
          id: 'sec-crypto',
          title: 'Applied Cryptography (AES, RSA)',
          category: 'Crypto',
          difficulty: 'Beginner',
          estimatedHours: 7,
          description: 'Symmetric encryption (AES-256) vs asymmetric public-key cryptography (RSA, ECC), cryptographic hashing (SHA-256), salting, and TLS certificates.',
          resources: [
            { title: 'Cryptography in 100 Seconds', url: 'https://www.youtube.com/watch?v=jhXCTbFnK8o', type: 'video', provider: 'Fireship', durationOrReadTime: '2 mins' },
            { title: 'Practical Cryptography for Developers', url: 'https://cryptobook.nakov.com/', type: 'doc', provider: 'Svetlin Nakov', durationOrReadTime: 'Book' },
          ],
        },
        {
          id: 'sec-firewalls',
          title: 'Firewalls, DMZ & VPN Networks',
          category: 'Networking',
          difficulty: 'Beginner',
          estimatedHours: 5,
          description: 'Stateful packet inspection, zero-trust network boundaries, DMZ subnets, and WireGuard VPN tunnels.',
          resources: [
            { title: 'Firewalls Explained in 5 Minutes', url: 'https://www.youtube.com/watch?v=kDEX1HXybrU', type: 'video', provider: 'PowerCert', durationOrReadTime: '8 mins' },
            { title: 'Zero Trust Architecture Guide by NIST', url: 'https://csrc.nist.gov/publications/detail/sp/800-207/final', type: 'doc', provider: 'NIST Standards', durationOrReadTime: 'Standard' },
          ],
        },
      ],
    },
    {
      id: 'sec-m2-blue-team',
      milestoneTitle: 'Defensive Security & SIEM Operations',
      spineSubtitle: 'Threat Detection',
      category: 'Defensive Security',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 2,
      description: 'Act as the Blue Team: monitor authentication, firewall, and endpoint logs to detect lateral movement, hunt threats using the MITRE ATT&CK framework, and execute incident response.',
      resources: [
        { title: 'Blue Team Fundamentals Course', url: 'https://www.youtube.com/watch?v=8b5TjJ6G1y4', type: 'video', provider: 'Cybrary', durationOrReadTime: '1 hour' },
        { title: 'MITRE ATT&CK Framework Official Portal', url: 'https://attack.mitre.org/', type: 'doc', provider: 'MITRE ATT&CK', durationOrReadTime: 'Framework' },
      ],
      leftContainer: {
        id: 'sec-blue-container',
        groupTitle: 'Blue Team Operations',
        side: 'left',
        topics: [
          {
            id: 'sec-siem-splunk',
            title: 'SIEM Log Correlation & Splunk',
            colSpan: 2,
            category: 'Defense',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Aggregating authentication, firewall, and endpoint logs into Splunk or ELK stack to detect brute force attempts and lateral movement.',
            resources: [
              { title: 'What is a SIEM? (Security Information and Event Management)', url: 'https://www.youtube.com/watch?v=0_u6eJ1j1uU', type: 'video', provider: 'IBM Technology', durationOrReadTime: '10 mins' },
              { title: 'Splunk Free Training and Documentation', url: 'https://www.splunk.com/en_us/training.html', type: 'doc', provider: 'Splunk', durationOrReadTime: 'Training' },
            ],
          },
          {
            id: 'sec-threat-hunting',
            title: 'Threat Intelligence & MITRE ATT&CK',
            colSpan: 2,
            category: 'Defense',
            difficulty: 'Intermediate',
            estimatedHours: 7,
            description: 'Mapping threat actor tactics, techniques, and procedures (TTPs) across stages from initial access to execution and data exfiltration.',
            resources: [
              { title: 'MITRE ATT&CK Framework Explained', url: 'https://www.youtube.com/watch?v=8b5TjJ6G1y4', type: 'video', provider: 'NetworkChuck', durationOrReadTime: '18 mins' },
              { title: 'MITRE ATT&CK Enterprise Matrix Navigator', url: 'https://mitre-attack.github.io/attack-navigator/', type: 'doc', provider: 'MITRE', durationOrReadTime: 'Interactive Tool' },
            ],
          },
          {
            id: 'sec-edr-response',
            title: 'Incident Response & EDR Forensics',
            colSpan: 2,
            category: 'Defense',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Endpoint Detection and Response (CrowdStrike/Defender), memory dump analysis, isolation containment strategies, and evidence chain of custody.',
            resources: [
              { title: 'Incident Response SANS Process Explained', url: 'https://www.youtube.com/watch?v=8b5TjJ6G1y4', type: 'video', provider: 'SANS Institute', durationOrReadTime: '20 mins' },
              { title: 'NIST Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final', type: 'doc', provider: 'NIST SP 800-61', durationOrReadTime: 'Standard' },
            ],
          },
        ],
      },
    },
    {
      id: 'sec-m3-red-team',
      milestoneTitle: 'Application Security & Penetration Testing',
      category: 'Offensive Security',
      difficulty: 'Intermediate',
      estimatedHours: 12,
      stepNumber: 3,
      description: 'Think like an ethical hacker: uncover OWASP Top 10 web vulnerabilities, intercept and manipulate HTTP traffic with Burp Suite, and escalate privileges.',
      resources: [
        { title: 'Web Security Academy & Ethical Hacking Course', url: 'https://portswigger.net/web-security', type: 'doc', provider: 'PortSwigger / Burp Suite', durationOrReadTime: 'Free Interactive Labs' },
        { title: 'OWASP Top 10 Vulnerabilities Explained in 100 Seconds', url: 'https://www.youtube.com/watch?v=b4O5_7yQ1y4', type: 'video', provider: 'Fireship', durationOrReadTime: '3 mins' },
      ],
      rightContainer: {
        id: 'sec-red-container',
        groupTitle: 'Offensive Security',
        side: 'right',
        topics: [
          {
            id: 'sec-owasp-top-10',
            title: 'OWASP Top 10 Web Vulnerabilities',
            colSpan: 2,
            category: 'AppSec',
            difficulty: 'Intermediate',
            estimatedHours: 8,
            description: 'SQL Injection, Cross-Site Scripting (XSS), Broken Object Level Authorization (BOLA), Security Misconfiguration, and Insecure Deserialization.',
            resources: [
              { title: 'OWASP Top 10 in 15 Minutes (All Attacks Demonstrated)', url: 'https://www.youtube.com/watch?v=b4O5_7yQ1y4', type: 'video', provider: 'LiveOverflow', durationOrReadTime: '20 mins' },
              { title: 'OWASP Top 10 Official Documentation', url: 'https://owasp.org/www-project-top-ten/', type: 'doc', provider: 'OWASP Foundation', durationOrReadTime: 'Standard' },
            ],
          },
          {
            id: 'sec-burp-suite',
            title: 'Burp Suite & Request Interception',
            colSpan: 2,
            category: 'Pentest',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            description: 'Setting up local proxy interception, manipulating HTTP headers, parameter fuzzing with Intruder, and finding hidden API endpoints.',
            resources: [
              { title: 'Burp Suite Tutorial for Beginners (Live Walkthrough)', url: 'https://www.youtube.com/watch?v=G3hpAykmsyU', type: 'video', provider: 'John Hammond', durationOrReadTime: '25 mins' },
              { title: 'PortSwigger Web Security Academy Labs', url: 'https://portswigger.net/web-security/all-labs', type: 'doc', provider: 'PortSwigger', durationOrReadTime: 'Interactive Labs' },
            ],
          },
          {
            id: 'sec-priv-esc',
            title: 'Privilege Escalation & Exploitation',
            colSpan: 2,
            category: 'Pentest',
            difficulty: 'Advanced',
            estimatedHours: 8,
            description: 'Linux SUID permission abuse, sudo misconfigurations, Windows token impersonation, and unquoted service binary paths.',
            resources: [
              { title: 'Linux Privilege Escalation for Beginners', url: 'https://www.youtube.com/watch?v=7WDz1o5Z8lY', type: 'video', provider: 'The Cyber Mentor', durationOrReadTime: '30 mins' },
              { title: 'GTFOBins: Linux SUID and Privilege Escalation Vault', url: 'https://gtfobins.github.io/', type: 'doc', provider: 'GTFOBins', durationOrReadTime: 'Reference' },
            ],
          },
        ],
      },
    },
    {
      id: 'sec-m4-cloud-iam',
      milestoneTitle: 'Cloud Security & Zero Trust',
      category: 'Cloud Security & IAM',
      difficulty: 'Intermediate',
      estimatedHours: 10,
      stepNumber: 4,
      description: 'Implement modern enterprise security: least privilege IAM, FIDO2 multi-factor authentication, Kubernetes security profiles, and SOC 2 compliance audits.',
      resources: [
        { title: 'Cloud Security Architecture Full Course', url: 'https://www.youtube.com/watch?v=8b5TjJ6G1y4', type: 'video', provider: 'FreeCodeCamp', durationOrReadTime: '2 hours' },
        { title: 'CIS Benchmarks for Cloud Hardening', url: 'https://www.cisecurity.org/cis-benchmarks', type: 'doc', provider: 'Center for Internet Security', durationOrReadTime: 'Benchmarks' },
      ],
      leftContainer: {
        id: 'sec-cloud-container',
        groupTitle: 'Identity & Cloud Hardening',
        side: 'left',
        topics: [
          {
            id: 'sec-iam-rbac',
            title: 'IAM Least Privilege & Multi-Factor Auth',
            colSpan: 2,
            category: 'Identity',
            difficulty: 'Beginner',
            estimatedHours: 5,
            description: 'Role-Based Access Control (RBAC), FIDO2 WebAuthn hardware keys, eliminating permanent root API keys, and temporary STS session tokens.',
            resources: [
              { title: 'IAM and Least Privilege Security in 10 Minutes', url: 'https://www.youtube.com/watch?v=0_u6eJ1j1uU', type: 'video', provider: 'AWS Online Tech Talks', durationOrReadTime: '15 mins' },
              { title: 'Google Cloud IAM Best Practices Guide', url: 'https://cloud.google.com/iam/docs/best-practices', type: 'doc', provider: 'Google Cloud Docs', durationOrReadTime: 'Guide' },
            ],
          },
          {
            id: 'sec-k8s-sec',
            title: 'Kubernetes Cluster Hardening',
            colSpan: 2,
            category: 'Cloud Security',
            difficulty: 'Advanced',
            estimatedHours: 7,
            description: 'Kubernetes NetworkPolicies to block pod-to-pod lateral infection, Pod Security Standards (restricted profile), and image signing with Cosign.',
            resources: [
              { title: 'Kubernetes Security Best Practices (CKS Prep)', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', type: 'video', provider: 'TechWorld with Nana', durationOrReadTime: '25 mins' },
              { title: 'Kubernetes Hardening Guide by NSA/CISA', url: 'https://www.cisa.gov/resources-tools/resources/kubernetes-hardening-guidance', type: 'doc', provider: 'CISA Government Standard', durationOrReadTime: 'Government Standard' },
            ],
          },
          {
            id: 'sec-compliance',
            title: 'ISO 27001 & SOC 2 Compliance',
            colSpan: 2,
            category: 'Governance',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            description: 'Auditing security access controls, encrypted data retention policies, penetration test audits, and disaster recovery tabletop drills.',
            resources: [
              { title: 'SOC 2 Compliance Explained for Engineers', url: 'https://www.youtube.com/watch?v=8b5TjJ6G1y4', type: 'video', provider: 'Vanta Team', durationOrReadTime: '15 mins' },
              { title: 'AICPA SOC 2 Trust Services Criteria', url: 'https://www.aicpa-cima.com/', type: 'doc', provider: 'AICPA', durationOrReadTime: 'Standard' },
            ],
          },
        ],
      },
    },
  ],
};

// Map of canonical roadmaps
export const CANONICAL_ROADMAPS_SH: Record<string, RoadmapShTrack> = {
  'ai-ml': AI_ENGINEER_ROADMAP_SH,
  cs: CS_ROADMAP_SH,
  frontend: FRONTEND_ROADMAP_SH,
  backend: BACKEND_ROADMAP_SH,
  fullstack: FULLSTACK_ROADMAP_SH,
  devops: DEVOPS_ROADMAP_SH,
  cybersecurity: CYBERSECURITY_ROADMAP_SH,
};

// Automatic converter for any DetailedRoadmap (including AI-generated ones!)
export function getRoadmapShData(roadmap: DetailedRoadmap): RoadmapShTrack {
  if (CANONICAL_ROADMAPS_SH[roadmap.id]) {
    return CANONICAL_ROADMAPS_SH[roadmap.id];
  }

  // 1. If the roadmap has rawPhases (generated by AI or curriculum engine), map directly from them!
  if (roadmap.rawPhases && Array.isArray(roadmap.rawPhases) && roadmap.rawPhases.length > 0) {
    const milestones: RoadmapShMilestone[] = roadmap.rawPhases.map((phase: any, pIdx: number) => {
      const cleanPhaseTitle = (phase.title || `Phase ${pIdx + 1}`)
        .replace(/^Phase\s*\d+\s*[:\-]\s*/i, '')
        .trim();

      const phaseTopics: any[] = Array.isArray(phase.topics) ? phase.topics : [];

      const mapToTopicItem = (t: any, idx: number): RoadmapShTopicItem => ({
        id: t.id || `custom-topic-${pIdx + 1}-${idx + 1}`,
        title: t.title,
        description: t.description && t.description.length > 30
          ? t.description
          : `Comprehensive, beginner-friendly guide to ${t.title}. Understand the intuition, core mechanisms, common mistakes, and real-world implementations in ${roadmap.title}.`,
        category: t.category || (idx % 2 === 0 ? 'Core Foundations' : 'Applied Techniques'),
        difficulty: t.difficulty || (pIdx === 0 ? 'Beginner' : pIdx <= 2 ? 'Intermediate' : 'Advanced'),
        estimatedHours: t.estimatedHours || 4,
        colSpan: idx % 3 === 0 ? 2 : 1,
        resources: Array.isArray(t.resources) && t.resources.length > 0
          ? t.resources
          : [
              {
                title: `${t.title} Video Lecture & Walkthrough`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.title + ' tutorial')}`,
                type: 'video',
                provider: 'Video Masterclass',
                durationOrReadTime: '15 mins',
              },
              {
                title: `${t.title} Official Documentation & Handbook`,
                url: `https://www.google.com/search?q=${encodeURIComponent(t.title + ' documentation')}`,
                type: 'doc',
                provider: 'Official Spec',
                durationOrReadTime: '12 min read',
              },
            ],
      });

      // For Phase 1 (Orientation/Introduction), if there are 3+ topics, show first 3-4 in fanOutRight,
      // and remainder (if any) in left/right containers.
      // If Phase 1 has <= 2 topics or for all other phases, distribute all topics into left & right containers!
      let fanOutTopics: RoadmapShTopicItem[] | undefined = undefined;
      let containerTopics: any[] = phaseTopics;

      if (pIdx === 0 && phaseTopics.length >= 3) {
        const fanCount = Math.min(4, Math.max(3, Math.floor(phaseTopics.length / 2)));
        fanOutTopics = phaseTopics.slice(0, fanCount).map(mapToTopicItem);
        containerTopics = phaseTopics.slice(fanCount);
      }

      const leftTopics = containerTopics.filter((_, idx) => idx % 2 === 0).map(mapToTopicItem);
      const rightTopics = containerTopics.filter((_, idx) => idx % 2 === 1).map(mapToTopicItem);

      return {
        id: `sh-m-${pIdx + 1}`,
        milestoneTitle: cleanPhaseTitle || `Phase ${pIdx + 1}`,
        description: phase.description || `Milestone ${pIdx + 1}: Master the fundamental principles and architectural components of ${cleanPhaseTitle}. This milestone provides comprehensive foundations, video guides, and practice drills.`,
        category: `Phase ${pIdx + 1}`,
        difficulty: (pIdx === 0 ? 'Beginner' : pIdx <= 2 ? 'Intermediate' : 'Advanced') as any,
        estimatedHours: Math.max(6, phaseTopics.length * 4),
        spineSubtitle: pIdx > 0 ? cleanPhaseTitle : undefined,
        stepNumber: pIdx + 1,
        resources: [
          {
            title: `${cleanPhaseTitle} Milestone Masterclass Video`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanPhaseTitle + ' tutorial lecture')}`,
            type: 'video',
            provider: 'Video Masterclass',
            durationOrReadTime: '25 mins',
          },
          {
            title: `${cleanPhaseTitle} Official Reference Guide`,
            url: `https://www.google.com/search?q=${encodeURIComponent(cleanPhaseTitle + ' guide')}`,
            type: 'doc',
            provider: 'Official Documentation',
            durationOrReadTime: '20 min read',
          },
        ],
        fanOutRight: fanOutTopics,
        leftContainer: leftTopics.length > 0
          ? {
              id: `left-${pIdx + 1}`,
              groupTitle: `${cleanPhaseTitle.split(' ')[0] || 'Core'} Architecture`,
              side: 'left',
              topics: leftTopics,
            }
          : undefined,
        rightContainer: rightTopics.length > 0
          ? {
              id: `right-${pIdx + 1}`,
              groupTitle: 'Key Concepts & Techniques',
              side: 'right',
              topics: rightTopics,
            }
          : undefined,
      };
    });

    return {
      id: roadmap.id,
      title: roadmap.title,
      tagline: roadmap.tagline || 'Interactive Skill Progression Highway',
      description: roadmap.description,
      badge: roadmap.badge || 'AI Custom Track',
      relatedRoadmaps: [
        { id: 'ai-ml', title: 'AI Engineer' },
        { id: 'cs', title: 'Computer Science' },
        { id: 'fullstack', title: 'Full-Stack Developer' },
        { id: 'frontend', title: 'Frontend Developer' },
        { id: 'backend', title: 'Backend Developer' },
      ],
      milestones,
    };
  }

  // 2. Convert generic or AI-generated roadmap from phases & nodes
  const phases = roadmap.phases || [];
  const nodes = roadmap.nodes || [];

  const milestones: RoadmapShMilestone[] = phases.map((phase, pIdx) => {
    // Find nodes belonging to this phase
    const phaseNodes = nodes.filter((n) => {
      return (
        n.stepNumber === pIdx + 1 ||
        (n.y >= phase.y - 50 && (pIdx === phases.length - 1 || n.y < (phases[pIdx + 1]?.y || 99999)))
      );
    });

    const cleanPhaseTitle = (phase.title || `Phase ${pIdx + 1}`)
      .replace(/^Phase\s*\d+\s*[:\-]\s*/i, '')
      .trim();

    const mapToShTopic = (n: any, idx: number): RoadmapShTopicItem => ({
      id: n.id,
      title: n.title,
      description: n.description && n.description.length > 30
        ? n.description
        : `Comprehensive, step-by-step beginner guide to ${n.title}. Understand the core intuition, real-world analogies, and how this fits into the broader architecture of ${roadmap.title}.`,
      category: n.category || 'Core Curriculum',
      difficulty: n.difficulty || 'Intermediate',
      estimatedHours: n.estimatedHours || 5,
      colSpan: idx % 3 === 0 ? 2 : 1,
      resources: n.resources && n.resources.length > 0
        ? n.resources
        : [
            {
              title: `${n.title} Video Lecture & Walkthrough`,
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(n.title + ' tutorial guide')}`,
              type: 'video',
              provider: 'Video Lecture',
              durationOrReadTime: '20 mins',
            },
            {
              title: `${n.title} Official Documentation & Handbook`,
              url: `https://www.google.com/search?q=${encodeURIComponent(n.title + ' official documentation')}`,
              type: 'doc',
              provider: 'Official Spec',
              durationOrReadTime: '15 min read',
            },
          ],
    });

    let fanOutTopics: RoadmapShTopicItem[] | undefined = undefined;
    let containerNodes = phaseNodes;

    if (pIdx === 0 && phaseNodes.length >= 3) {
      const fanCount = Math.min(4, Math.max(3, Math.floor(phaseNodes.length / 2)));
      fanOutTopics = phaseNodes.slice(0, fanCount).map(mapToShTopic);
      containerNodes = phaseNodes.slice(fanCount);
    }

    const leftNodes = containerNodes.filter((_, idx) => idx % 2 === 0);
    const rightNodes = containerNodes.filter((_, idx) => idx % 2 === 1);

    return {
      id: `sh-m-${pIdx + 1}`,
      milestoneTitle: cleanPhaseTitle || `Phase ${pIdx + 1}`,
      description: phase.description || `Milestone ${pIdx + 1}: Master the fundamental principles and architectural components of ${cleanPhaseTitle}. This milestone provides comprehensive foundations, video guides, and practice drills.`,
      category: `Phase ${pIdx + 1}`,
      difficulty: (pIdx === 0 ? 'Beginner' : pIdx < 3 ? 'Intermediate' : 'Advanced') as any,
      estimatedHours: 8,
      spineSubtitle: pIdx > 0 ? cleanPhaseTitle : undefined,
      stepNumber: pIdx + 1,
      resources: [
        {
          title: `${cleanPhaseTitle} Milestone Masterclass Video`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanPhaseTitle + ' tutorial lecture')}`,
          type: 'video',
          provider: 'Video Masterclass',
          durationOrReadTime: '25 mins',
        },
        {
          title: `${cleanPhaseTitle} Official Reference Guide`,
          url: `https://www.google.com/search?q=${encodeURIComponent(cleanPhaseTitle + ' tutorial guide')}`,
          type: 'doc',
          provider: 'Official Documentation',
          durationOrReadTime: '20 min read',
        },
      ],
      fanOutRight: fanOutTopics,
      leftContainer:
        leftNodes.length > 0
          ? {
              id: `left-${pIdx + 1}`,
              groupTitle: `${cleanPhaseTitle.split(' ')[0] || 'Core'} Architecture`,
              side: 'left',
              topics: leftNodes.map(mapToShTopic),
            }
          : undefined,
      rightContainer:
        rightNodes.length > 0
          ? {
              id: `right-${pIdx + 1}`,
              groupTitle: 'Key Concepts & Techniques',
              side: 'right',
              topics: rightNodes.map(mapToShTopic),
            }
          : undefined,
    };
  });

  return {
    id: roadmap.id,
    title: roadmap.title,
    tagline: roadmap.tagline || 'Interactive Skill Progression Highway',
    description: roadmap.description,
    badge: roadmap.badge || 'Curated Track',
    relatedRoadmaps: [
      { id: 'ai-ml', title: 'AI Engineer' },
      { id: 'cs', title: 'Computer Science' },
      { id: 'fullstack', title: 'Full-Stack Developer' },
      { id: 'frontend', title: 'Frontend Developer' },
      { id: 'backend', title: 'Backend Developer' },
    ],
    milestones: milestones.length > 0 ? milestones : [
      {
        id: 'default-m1',
        milestoneTitle: roadmap.title,
        description: `Complete introduction to ${roadmap.title}. Understand the core mental models and foundations.`,
        category: 'Orientation',
        difficulty: 'Beginner',
        estimatedHours: 6,
        stepNumber: 1,
        resources: [
          {
            title: `${roadmap.title} Overview Lecture`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(roadmap.title + ' overview')}`,
            type: 'video',
            provider: 'Video Lecture',
            durationOrReadTime: '15 mins',
          },
        ],
        fanOutRight: nodes.slice(0, 4).map((n) => ({
          id: n.id,
          title: n.title,
          description: n.description || `Comprehensive, easy-to-understand breakdown of ${n.title}.`,
          category: n.category,
          difficulty: n.difficulty || 'Beginner',
          estimatedHours: n.estimatedHours || 4,
          resources: n.resources && n.resources.length > 0
            ? n.resources
            : [
                {
                  title: `${n.title} Video Guide`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(n.title + ' tutorial')}`,
                  type: 'video',
                  provider: 'Video Tutorial',
                  durationOrReadTime: '15 mins',
                },
              ],
        })),
      },
    ],
  };
}
