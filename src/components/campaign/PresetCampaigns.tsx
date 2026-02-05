import { useState, useMemo } from 'react';
import { useCampaignStore } from '../../store/campaign-store';
import { PRESET_CAMPAIGNS, presetToNewCampaign, type PresetCampaignMeta } from '../../services/presets/preset-campaigns';
import { t, useTranslations } from '../../services/i18n/use-i18n';
import type { Campaign } from '../../types/models';

interface PresetCampaignsProps {
  onSelectCampaign: (campaign: Campaign) => void;
  onBack: () => void;
}

export function PresetCampaigns({ onSelectCampaign, onBack }: PresetCampaignsProps) {
  const { createCampaign } = useCampaignStore();
  const translations = useTranslations();
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const tagLabels = translations.presetCampaigns.tags;
  const campaigns = translations.presetCampaigns.campaigns;

  const filtered = useMemo(() => {
    let list = PRESET_CAMPAIGNS;
    if (filterTag) {
      list = list.filter((p) => p.tag === filterTag);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const c = campaigns[p.id];
        if (!c) return false;
        return (
          c.title.toLowerCase().includes(q) ||
          c.theme.toLowerCase().includes(q) ||
          c.tone.toLowerCase().includes(q) ||
          (p.tag && p.tag.toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [filterTag, search, campaigns]);

  const tags = useMemo(() => {
    const set = new Set(PRESET_CAMPAIGNS.map((p) => p.tag).filter(Boolean));
    return Array.from(set) as string[];
  }, []);

  const handlePlay = async (preset: PresetCampaignMeta) => {
    setCreatingId(preset.id);
    try {
      const c = campaigns[preset.id];
      if (!c) return;
      const resolved = { ...preset, title: c.title, theme: c.theme, tone: c.tone };
      const campaign = await createCampaign(presetToNewCampaign(resolved));
      onSelectCampaign(campaign);
    } catch (err) {
      console.error('Failed to create campaign:', err);
      alert(t('errors.failedToCreateCharacter') + ': ' + (err as Error).message);
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="campaign-list-page">
      <div className="retro-container preset-campaigns-header" style={{ flexShrink: 0 }}>
        <div className="preset-campaigns-nav">
          <button className="retro-button" onClick={onBack}>
            ← {t('common.back')}
          </button>
        </div>
        <div className="preset-campaigns-intro">
          <h1 className="preset-campaigns-title">{t('presetCampaigns.title')}</h1>
          <p className="preset-campaigns-subtitle">{t('presetCampaigns.subtitle')}</p>
        </div>

        {/* Search & Filters */}
        <div className="preset-campaigns-filters">
        <input
          type="text"
          className="preset-search-input"
          placeholder={t('presetCampaigns.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`retro-button ${!filterTag ? 'active' : ''}`}
            onClick={() => setFilterTag(null)}
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            {t('presetCampaigns.all')}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`retro-button ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              style={{ fontSize: '11px', padding: '6px 10px' }}
            >
              {tagLabels[tag] ?? tag}
            </button>
          ))}
        </div>
        </div>
      </div>

      <div className="campaign-list-scroll">
        <div className="retro-container">
          {/* Grid */}
          <div
            className="preset-campaign-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
        {filtered.map((preset) => {
          const c = campaigns[preset.id];
          if (!c) return null;
          return (
          <div key={preset.id} className="preset-campaign-card">
            {preset.tag && (
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--color-accent)',
                  alignSelf: 'flex-start',
                }}
              >
                {tagLabels[preset.tag] ?? preset.tag}
              </span>
            )}
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-accent)' }}>
              {c.title}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.4,
                flex: 1,
                overflow: 'hidden',
                maxHeight: '4.2em',
              }}
            >
              {c.theme}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
              {c.tone}
            </div>
            <button
              className="retro-button preset-play-btn"
              onClick={() => handlePlay(preset)}
              disabled={creatingId !== null}
            >
              {creatingId === preset.id ? '...' : `▶ ${t('presetCampaigns.play')}`}
            </button>
          </div>
          );
        })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-secondary)' }}>
              {t('presetCampaigns.noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
