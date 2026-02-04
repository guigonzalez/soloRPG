import { RecapPanel } from './RecapPanel';
import { EntitiesPanel } from './EntitiesPanel';
import { useUIStore } from '../../store/ui-store';
import type { Recap, Entity } from '../../types/models';

interface SidebarProps {
  recap: Recap | null;
  entities: Entity[];
  onEndSession: () => void;
  onUpdateRecap: () => void;
  isUpdatingRecap: boolean;
}

export function Sidebar({ recap, entities, onEndSession, onUpdateRecap, isUpdatingRecap }: SidebarProps) {
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
            Game Info
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
            End Session
          </button>
        </div>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activePanel === 'recap' ? 'active' : ''}`}
          onClick={() => setActivePanel('recap')}
        >
          Recap
        </button>
        <button
          className={`sidebar-tab ${activePanel === 'entities' ? 'active' : ''}`}
          onClick={() => setActivePanel('entities')}
        >
          Entities
        </button>
      </div>

      <div className="sidebar-content">
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
