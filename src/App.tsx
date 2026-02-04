import { useState, useEffect, useRef } from 'react';
import { CampaignList } from './components/campaign/CampaignList';
import { ChatContainer } from './components/chat/ChatContainer';
import { Sidebar } from './components/sidebar/Sidebar';
import { ApiKeySetup } from './components/common/ApiKeySetup';
import { SettingsModal } from './components/common/SettingsModal';
import { CharacterCreation } from './components/character/CharacterCreation';
import { LevelUpModal } from './components/character/LevelUpModal';
import { useCampaignStore } from './store/campaign-store';
import { useChatStore } from './store/chat-store';
import { useCharacterStore } from './store/character-store';
import { useMessages } from './hooks/useMessages';
import { useRolls } from './hooks/useRolls';
import { useAI } from './hooks/useAI';
import { useCharacter } from './hooks/useCharacter';
import { hasApiKey } from './services/storage/api-key-storage';
import { extractMemory } from './services/ai/memory-extractor';
import * as recapRepo from './services/storage/recap-repo';
import * as entityRepo from './services/storage/entity-repo';
import * as factRepo from './services/storage/fact-repo';
import type { Campaign, Recap, Entity, SuggestedAction } from './types/models';
import './styles/main.css';

function App() {
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isUpdatingRecap, setIsUpdatingRecap] = useState(false);

  // Track if we've initialized the current campaign to prevent duplicate starts
  const campaignInitializedRef = useRef<string | null>(null);

  // All hooks must be called unconditionally at the top
  const { activeCampaignId, setActiveCampaign, getActiveCampaign } = useCampaignStore();
  const { isAIResponding, streamedContent, suggestedActions, messagesLoaded, loadedMessageCount, loadGeneration } = useChatStore();
  const { levelUpPending, attributePointsAvailable, confirmLevelUp } = useCharacterStore();
  const activeCampaign = getActiveCampaign();

  // Load messages and rolls for active campaign
  const { messages } = useMessages(activeCampaignId);
  const { rolls } = useRolls(activeCampaignId);

  // Load character for active campaign (will be used in Phase 5 for character panel)
  const { character: _character, needsCharacterCreation, handleCreateCharacter } = useCharacter(
    activeCampaignId,
    activeCampaign?.system || 'Generic'
  );

  // Use real AI
  const { sendMessage, sendActionWithRoll, startCampaign } = useAI(activeCampaignId);

  // Check if API key is configured on mount
  useEffect(() => {
    setShowApiKeySetup(!hasApiKey());
  }, []);

  // Load recap and entities for active campaign
  useEffect(() => {
    const loadMemory = async () => {
      if (!activeCampaignId) {
        setRecap(null);
        setEntities([]);
        return;
      }

      try {
        const loadedRecap = await recapRepo.getRecapByCampaign(activeCampaignId);
        const loadedEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);

        setRecap(loadedRecap || null);
        setEntities(loadedEntities);
      } catch (err) {
        console.error('Failed to load memory:', err);
      }
    };

    loadMemory();
  }, [activeCampaignId]);

  // Reset initialization tracking when campaign changes
  useEffect(() => {
    campaignInitializedRef.current = null;
  }, [activeCampaignId]);

  // Start campaign with initial AI message if no messages exist
  useEffect(() => {
    // Only execute once when messages finish loading
    if (!activeCampaignId || !messagesLoaded) {
      return;
    }

    // Check if we've already initialized this campaign
    if (campaignInitializedRef.current === activeCampaignId) {
      return;
    }

    const initCampaign = async () => {
      // Mark this campaign as initialized BEFORE doing anything
      campaignInitializedRef.current = activeCampaignId;

      // Use loadedMessageCount which was set atomically with messagesLoaded
      if (loadedMessageCount === 0 && !isAIResponding) {
        try {
          await startCampaign();
        } catch (err) {
          console.error('Failed to start campaign:', err);
        }
      }
    };

    initCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadGeneration]); // ONLY loadGeneration - it increments when messages finish loading

  // Handle API key setup completion
  const handleApiKeySetupComplete = () => {
    setShowApiKeySetup(false);
    // Force a re-render to pick up the new key
    window.location.reload();
  };

  // Show API key setup screen if not configured
  if (showApiKeySetup) {
    return <ApiKeySetup onComplete={handleApiKeySetupComplete} />;
  }

  const handleSelectCampaign = (campaign: Campaign) => {
    setActiveCampaign(campaign.id);
  };

  const handleBackToCampaigns = () => {
    campaignInitializedRef.current = null; // Reset initialization tracking
    setActiveCampaign(null);
  };

  const handleUpdateRecap = async () => {
    if (!activeCampaignId || messages.length === 0) {
      console.log('Cannot update recap: no campaign or no messages');
      return;
    }

    setIsUpdatingRecap(true);

    try {
      console.log('Extracting memory from', messages.length, 'messages...');

      // Extract memory from recent messages
      const extracted = await extractMemory(messages);

      console.log('Extracted memory:', {
        recap: extracted.recap,
        entitiesCount: extracted.entities.length,
        factsCount: extracted.facts.length,
        entities: extracted.entities,
      });

      // Save recap
      if (extracted.recap) {
        const updatedRecap: Recap = {
          campaignId: activeCampaignId,
          summaryShort: extracted.recap,
          updatedAt: Date.now(),
        };
        await recapRepo.upsertRecap(updatedRecap);
        setRecap(updatedRecap);
        console.log('Recap saved:', updatedRecap);
      } else {
        console.warn('No recap extracted');
      }

      // Save entities
      for (const entity of extracted.entities) {
        console.log('Creating entity:', entity);
        await entityRepo.createEntity({
          campaignId: activeCampaignId,
          name: entity.name,
          type: entity.type,
          blurb: entity.blurb,
        });
      }

      // Save facts
      for (const fact of extracted.facts) {
        // Find entity by name
        const allEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);
        const subjectEntity = allEntities.find(e => e.name === fact.subjectEntityId);

        if (subjectEntity) {
          console.log('Creating fact for entity:', subjectEntity.name);
          await factRepo.createFact({
            campaignId: activeCampaignId,
            subjectEntityId: subjectEntity.id,
            predicate: fact.predicate,
            object: fact.object,
            sourceMessageId: fact.sourceMessageId,
          });
        } else {
          console.warn('Entity not found for fact:', fact.subjectEntityId);
        }
      }

      // Reload entities to show newly extracted ones
      const loadedEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);
      console.log('Loaded entities after extraction:', loadedEntities);
      setEntities(loadedEntities);

      alert(`Memory updated! Extracted:\n- Recap: ${extracted.recap ? 'Yes' : 'No'}\n- Entities: ${extracted.entities.length}\n- Facts: ${extracted.facts.length}`);
    } catch (err) {
      console.error('Failed to update recap:', err);
      alert('Failed to update recap: ' + (err as Error).message);
    } finally {
      setIsUpdatingRecap(false);
    }
  };

  const handleSelectAction = async (action: SuggestedAction) => {
    // Clear suggested actions when one is selected
    useChatStore.getState().setSuggestedActions([]);

    // If action has a roll notation, send action + roll together
    if (action.rollNotation) {
      await sendActionWithRoll(action.action, action.rollNotation, action.dc);
    } else {
      // Otherwise, just send the action as a regular message
      await sendMessage(action.action);
    }
  };

  const handleCharacterCreation = async (name: string, attributes: Record<string, number>) => {
    try {
      await handleCreateCharacter(name, attributes);
      // Character is now created, component will re-render
    } catch (err) {
      console.error('Failed to create character:', err);
      alert('Failed to create character: ' + (err as Error).message);
    }
  };

  const handleLevelUpConfirm = async (attributeAllocations: Record<string, number>) => {
    try {
      // Apply attribute allocations
      for (const [attrName, points] of Object.entries(attributeAllocations)) {
        for (let i = 0; i < points; i++) {
          await useCharacterStore.getState().incrementAttribute(attrName);
        }
      }

      // Confirm level-up (clears levelUpPending flag)
      await confirmLevelUp();
    } catch (err) {
      console.error('Failed to confirm level-up:', err);
      alert('Failed to confirm level-up: ' + (err as Error).message);
    }
  };

  const handleEndSession = async () => {
    if (!activeCampaignId || !activeCampaign) return;

    const confirmed = confirm(
      'End this session? This will save your progress and extract important memories from your adventure.'
    );

    if (!confirmed) return;

    try {
      // Extract memory from recent messages
      const extracted = await extractMemory(messages);

      // Save recap
      if (extracted.recap) {
        await recapRepo.upsertRecap({
          campaignId: activeCampaignId,
          summaryShort: extracted.recap,
          updatedAt: Date.now(),
        });
      }

      // Save entities
      for (const entity of extracted.entities) {
        await entityRepo.createEntity({
          campaignId: activeCampaignId,
          name: entity.name,
          type: entity.type,
          blurb: entity.blurb,
        });
      }

      // Save facts
      for (const fact of extracted.facts) {
        // Find entity by name
        const allEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);
        const subjectEntity = allEntities.find(e => e.name === fact.subjectEntityId);

        if (subjectEntity) {
          await factRepo.createFact({
            campaignId: activeCampaignId,
            subjectEntityId: subjectEntity.id,
            predicate: fact.predicate,
            object: fact.object,
            sourceMessageId: fact.sourceMessageId,
          });
        }
      }

      alert('Session ended! Your progress has been saved.');
      handleBackToCampaigns();
    } catch (err) {
      console.error('Failed to end session:', err);
      alert('Failed to save session: ' + (err as Error).message);
    }
  };

  if (!activeCampaignId || !activeCampaign) {
    return <CampaignList onSelectCampaign={handleSelectCampaign} />;
  }

  // Show character creation modal if character doesn't exist
  if (needsCharacterCreation) {
    return (
      <CharacterCreation
        campaignSystem={activeCampaign.system}
        campaignTheme={activeCampaign.theme}
        onConfirm={handleCharacterCreation}
        onCancel={handleBackToCampaigns}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="app-header">
          <div>
            <button className="retro-button" onClick={handleBackToCampaigns}>
              ← Back
            </button>
          </div>
          <h1 className="app-title">{activeCampaign.title}</h1>
          <div>
            <button className="retro-button" onClick={() => setShowSettings(true)}>
              ⚙ Settings
            </button>
          </div>
        </div>

        <ChatContainer
          messages={messages}
          rolls={rolls}
          onSendMessage={sendMessage}
          isAIResponding={isAIResponding}
          streamedContent={streamedContent}
          suggestedActions={suggestedActions}
          onSelectAction={handleSelectAction}
        />
      </div>

      <Sidebar
        recap={recap}
        entities={entities}
        character={_character}
        campaignSystem={activeCampaign.system}
        onEndSession={handleEndSession}
        onUpdateRecap={handleUpdateRecap}
        isUpdatingRecap={isUpdatingRecap}
      />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {levelUpPending && _character && (
        <LevelUpModal
          character={_character}
          campaignSystem={activeCampaign.system}
          attributePoints={attributePointsAvailable}
          onConfirm={handleLevelUpConfirm}
        />
      )}
    </div>
  );
}

export default App;
