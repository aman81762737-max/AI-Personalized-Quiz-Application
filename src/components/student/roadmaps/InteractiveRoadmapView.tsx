import React, { useState, useEffect } from 'react';
import { DETAILED_ROADMAPS, DetailedRoadmap, GraphNode, RoadmapPhase } from '../../../data/detailedRoadmapsData';
import { RoadmapCatalogView } from './RoadmapCatalogView';
import { ShaderGraphCanvas } from './ShaderGraphCanvas';
import { GenerateRoadmapModal } from './GenerateRoadmapModal';
import { RoadmapTrack } from '../../../types/roadmap';
import { useToast } from '../../common/Toast';
import { subscribeCustomRoadmaps, saveCustomRoadmapToCloud } from '../../../services/cloudSyncService';

interface InteractiveRoadmapViewProps {
  onNavigatePractice?: (topicTitle: string) => void;
}

const STORAGE_KEY_PROGRESS = 'roadmap_progress_v1';
const STORAGE_KEY_CUSTOM_DETAILED = 'custom_detailed_roadmaps_v1';

export const InteractiveRoadmapView: React.FC<InteractiveRoadmapViewProps> = ({
  onNavigatePractice,
}) => {
  const [roadmaps, setRoadmaps] = useState<DetailedRoadmap[]>(DETAILED_ROADMAPS);
  const [selectedRoadmap, setSelectedRoadmap] = useState<DetailedRoadmap | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [topicStatuses, setTopicStatuses] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  // Load progress and custom detailed roadmaps from localStorage and Cloud Firestore
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (savedProgress) {
        setTopicStatuses(JSON.parse(savedProgress));
      }

      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_DETAILED);
      let allRoadmaps = DETAILED_ROADMAPS;
      if (savedCustom) {
        const parsedCustom: DetailedRoadmap[] = JSON.parse(savedCustom);
        allRoadmaps = [...DETAILED_ROADMAPS, ...parsedCustom];
        setRoadmaps(allRoadmaps);
      }

      // Check if a roadmap was just generated from Atom AI (1-click action)
      const savedSelectedId = localStorage.getItem('roadmap_selected_id_v1');
      if (savedSelectedId) {
        const found = allRoadmaps.find((r) => r.id === savedSelectedId);
        if (found) {
          setSelectedRoadmap(found);
        }
        localStorage.removeItem('roadmap_selected_id_v1');
      }
    } catch (e) {
      console.warn('Failed to load roadmap data from localStorage:', e);
    }

    const unsub = subscribeCustomRoadmaps((remoteRoadmaps) => {
      if (Array.isArray(remoteRoadmaps) && remoteRoadmaps.length > 0) {
        setRoadmaps((prev) => {
          const map = new Map<string, DetailedRoadmap>();
          DETAILED_ROADMAPS.forEach((r) => map.set(r.id, r));
          remoteRoadmaps.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    });

    return () => unsub();
  }, []);

  // Handle AI generated roadmap
  const handleRoadmapGenerated = (generated: RoadmapTrack) => {
    // Convert RoadmapTrack to DetailedRoadmap with top-to-bottom layout
    const nodes: GraphNode[] = [];
    const phases: RoadmapPhase[] = [];
    let currentY = 130;
    let stepCount = 1;

    generated.phases.forEach((phase, phaseIdx) => {
      phases.push({
        id: `ai-phase-${phaseIdx + 1}`,
        title: phase.title,
        stepRange: `Phase ${phaseIdx + 1}`,
        description: phase.description || '',
        y: Math.max(50, currentY - 70),
      });

      phase.topics.forEach((topic, topicIdx) => {
        const isMain = topicIdx === 0;
        const nodeX = isMain ? 550 : topicIdx % 2 === 1 ? 210 : 920;
        const nodeY = currentY;

        nodes.push({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          category: topic.category,
          x: nodeX,
          y: nodeY,
          difficulty: topic.difficulty,
          estimatedHours: topic.estimatedHours,
          prerequisites: topic.prerequisites,
          stepNumber: isMain ? stepCount++ : undefined,
          isMainStep: isMain,
          resources: topic.resources.map((r) => ({
            title: r.title,
            url: r.url,
            type: r.type,
            provider: r.provider,
            durationOrReadTime: r.durationOrReadTime,
          })),
        });

        currentY += 210;
      });
      currentY += 80;
    });

    const detailedCustom: DetailedRoadmap = {
      id: generated.id,
      title: generated.title,
      slug: generated.id,
      tagline: generated.shortTitle,
      description: generated.description,
      iconName: 'Sparkles',
      badge: 'AI Custom',
      difficulty: 'Intermediate',
      estimatedHours: generated.phases.length * 20,
      estimatedWeeks: generated.estimatedWeeks,
      phases,
      nodes,
      isCustom: true,
      rawPhases: generated.phases,
    };

    setRoadmaps((prev) => {
      const updated = [...prev, detailedCustom];
      try {
        const customOnly = updated.filter((r) => r.isCustom);
        localStorage.setItem(STORAGE_KEY_CUSTOM_DETAILED, JSON.stringify(customOnly));
        saveCustomRoadmapToCloud(detailedCustom).catch(() => {});
      } catch (e) {
        console.warn('Failed to save custom roadmaps:', e);
      }
      return updated;
    });

    // Automatically open the new roadmap in Shader Graph!
    setSelectedRoadmap(detailedCustom);
  };

  const handleDeleteCustomRoadmap = (roadmapId: string) => {
    setRoadmaps((prev) => {
      const filtered = prev.filter((r) => r.id !== roadmapId);
      try {
        const customOnly = filtered.filter((r) => r.isCustom);
        localStorage.setItem(STORAGE_KEY_CUSTOM_DETAILED, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to update custom roadmaps:', e);
      }
      return filtered;
    });
    if (selectedRoadmap?.id === roadmapId) {
      setSelectedRoadmap(null);
    }
    showToast('Custom roadmap removed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* If no roadmap is selected, show the default Catalog Gallery first! */}
      {!selectedRoadmap ? (
        <RoadmapCatalogView
          roadmaps={roadmaps}
          onSelectRoadmap={(rm) => setSelectedRoadmap(rm)}
          onOpenAiGenerator={() => setIsGenerateModalOpen(true)}
          onDeleteCustomRoadmap={handleDeleteCustomRoadmap}
          topicStatuses={topicStatuses}
        />
      ) : (
        /* If a roadmap is selected, launch the exact Unity Shader Graph movable canvas! */
        <ShaderGraphCanvas
          roadmap={selectedRoadmap}
          allRoadmaps={roadmaps}
          onBackToCatalog={() => setSelectedRoadmap(null)}
          onSelectRoadmapId={(id) => {
            const found = roadmaps.find((r) => r.id === id);
            if (found) {
              setSelectedRoadmap(found);
            }
          }}
          onLaunchDrill={onNavigatePractice}
          onOpenAiGenerator={() => setIsGenerateModalOpen(true)}
        />
      )}

      {/* AI Custom Roadmap Generation Modal */}
      <GenerateRoadmapModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onRoadmapGenerated={handleRoadmapGenerated}
      />
    </div>
  );
};
