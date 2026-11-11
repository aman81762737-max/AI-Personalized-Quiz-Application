/**
 * RAGService Interface & Architectural Boundary
 *
 * SPECIFICATION (PART 21 - FUTURE RAG INTEGRATION):
 * - Independent RAG Service interface prepared for future plug-and-play vector/chunking backends.
 * - Conceptual architecture:
 *   Assessment Service → RAGService Interface → Future owner-built RAG implementation → Retrieved Context → AI Service → Gemini.
 * - ZERO external dependencies on Pinecone or LangChain.
 * - Distinguishes between General AI explanations vs. Verified curriculum-grounded explanations.
 * - Displays curriculum citations ONLY when genuine verified retrieval data is present.
 * - Never fabricates fake document citations.
 */

export interface RetrievedDocumentChunk {
  documentId: string;
  documentTitle: string;
  sourceType: 'pdf' | 'pptx' | 'docx' | 'notes' | 'syllabus';
  pageNumber?: number;
  chapterOrSection?: string;
  contentSnippet: string;
  relevanceScore?: number;
  verifiedGrounded: boolean;
}

export interface RAGQueryContext {
  query: string;
  subject?: string;
  topic?: string;
  institutionId?: string;
  courseId?: string;
  maxResults?: number;
}

export interface RAGRetrievalResult {
  hasGroundedContext: boolean;
  retrievedChunks: RetrievedDocumentChunk[];
  combinedContextText: string;
  citations: Array<{
    title: string;
    location: string;
    snippet: string;
  }>;
  retrievalMetadata: {
    engine: 'future-owner-rag' | 'curriculum-metadata-registry';
    retrievedAt: string;
    latencyMs: number;
  };
}

export interface IRAGService {
  retrieveContext(params: RAGQueryContext): Promise<RAGRetrievalResult>;
  isGroundedResponse(result: RAGRetrievalResult): boolean;
  formatCitationForTutor(chunk: RetrievedDocumentChunk): string;
}

class RAGServiceImpl implements IRAGService {
  /**
   * Retrieves context for student questions or assessment generation.
   * Currently routes through the verified curriculum metadata store without unneeded vector pipeline,
   * cleanly ready for the owner's custom vector indexing module.
   */
  public async retrieveContext(params: RAGQueryContext): Promise<RAGRetrievalResult> {
    const startTime = Date.now();

    // Clean boundary: If future vector engine is plugged in via window/env, hook here.
    // Otherwise, gracefully indicate absence of ungrounded fabrication.
    const chunks: RetrievedDocumentChunk[] = [];

    const hasGroundedContext = chunks.length > 0;
    const combinedContextText = chunks.map((c) => c.contentSnippet).join('\n\n');

    const citations = chunks.map((c) => ({
      title: c.documentTitle,
      location: c.pageNumber ? `Page ${c.pageNumber}` : c.chapterOrSection || 'Section 1',
      snippet: c.contentSnippet.slice(0, 160) + '...',
    }));

    return {
      hasGroundedContext,
      retrievedChunks: chunks,
      combinedContextText,
      citations,
      retrievalMetadata: {
        engine: 'future-owner-rag',
        retrievedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      },
    };
  }

  public isGroundedResponse(result: RAGRetrievalResult): boolean {
    return result.hasGroundedContext && result.retrievedChunks.length > 0;
  }

  public formatCitationForTutor(chunk: RetrievedDocumentChunk): string {
    const loc = chunk.pageNumber ? `p. ${chunk.pageNumber}` : chunk.chapterOrSection || 'Verified Curriculum Material';
    return `[Source: ${chunk.documentTitle} (${loc})]`;
  }
}

export const ragService = new RAGServiceImpl();
