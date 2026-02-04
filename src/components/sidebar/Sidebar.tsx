import { RecapPanel } from './RecapPanel';
import { EntitiesPanel } from './EntitiesPanel';
import { CharacterPanel } from './CharacterPanel';
import { useUIStore } from '../../store/ui-store';
import { t } from '../../services/i18n/use-i18n';
import type { Recap, Entity, Character } from '../../types/models';

interface SidebarProps {
  recap: Recap | null;
  entities: Entity[];
  character: Character | null;
  campaignSystem: string;
  onEndSession: () => void;
  onUpdateRecap: () => void;
  isUpdatingRecap: boolean;
}

export function Sidebar({ recap, entities, character, campaignSystem, onEndSession, onUpdateRecap, isUpdatingRecap }: SidebarProps) {
  const { activePanel, setActivePanel } = useUIStore();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {t('sidebar.gameInfo')}
          </div>
          <button
            className="retro-button"
            onClick={onEndSession}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              minWidth: 'auto'
            }}
          >
            {t('sidebar.endSession')}
          </button>
        </div>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activePanel === 'character' ? 'active' : ''}`}
          onClick={() => setActivePanel('character')}
        >
          {t('sidebar.character')}
        </button>
        <button
          className={`sidebar-tab ${activePanel === 'recap' ? 'active' : ''}`}
          onClick={() => setActivePanel('recap')}
        >
          {t('sidebar.recap')}
        </button>
        <button
          className={`sidebar-tab ${activePanel === 'entities' ? 'active' : ''}`}
          onClick={() => setActivePanel('entities')}
        >
          {t('sidebar.entities')}
        </button>
      </div>

      <div className="sidebar-content">
        {activePanel === 'character' && character && (
          <CharacterPanel character={character} campaignSystem={campaignSystem} />
        )}
        {activePanel === 'recap' && (
          <RecapPanel
            recap={recap}
            onUpdateRecap={onUpdateRecap}
            isUpdating={isUpdatingRecap}
          />
        )}
        {activePanel === 'entities' && <EntitiesPanel entities={entities} />}
      </div>
    </div>
  );
}
