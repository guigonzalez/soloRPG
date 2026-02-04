import type { Entity } from '../../types/models';

interface EntitiesPanelProps {
  entities: Entity[];
}

export function EntitiesPanel({ entities }: EntitiesPanelProps) {
  if (entities.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '14px',
        border: '2px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)'
      }}>
        Characters, places, and items you encounter will appear here...
        <div style={{
          marginTop: '12px',
          fontSize: '12px'
        }}>
          Click "Update" in the Recap tab to extract entities from your adventure!
        </div>
      </div>
    );
  }

  return (
    <div className="entity-list">
      {entities.map((entity) => (
        <div key={entity.id} className="entity-item">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
            gap: '8px'
          }}>
            <div className="entity-name" style={{ flex: 1 }}>{entity.name}</div>
            <div className="entity-type" style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              whiteSpace: 'nowrap'
            }}>
              {entity.type}
            </div>
          </div>
          {entity.blurb && (
            <div className="entity-blurb" style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--color-text-primary)'
            }}>
              {entity.blurb}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
