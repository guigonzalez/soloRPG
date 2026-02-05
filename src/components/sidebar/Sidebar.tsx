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
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ recap, entities, character, campaignSystem, onEndSession, onUpdateRecap, isUpdatingRecap, isOpen = false, onClose }: SidebarProps) {
  const { activePanel, setActivePanel } = useUIStore();

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onClose && (
              <button
                className="retro-button sidebar-close"
                onClick={onClose}
                aria-label={t('common.close')}
                style={{ fontSize: '18px', padding: '4px 8px', minWidth: 'auto' }}
              >
                ✕
              </button>
            )}
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
