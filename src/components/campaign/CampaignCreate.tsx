import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { validateCampaignTitle, validateCampaignSystem, validateCampaignTheme, validateCampaignTone } from '../../utils/validation';
import { generateCampaignSuggestion } from '../../services/ai/campaign-generator';
import { t } from '../../services/i18n/use-i18n';
import type { NewCampaign } from '../../types/models';

interface CampaignCreateProps {
  onCreateCampaign: (campaign: NewCampaign) => Promise<void>;
  onCancel: () => void;
}

export function CampaignCreate({ onCreateCampaign, onCancel }: CampaignCreateProps) {
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('');
  const [theme, setTheme] = useState('');
  const [tone, setTone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    if (!system) {
      setErrors({ system: 'Please select a system first' });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    try {
      const suggestion = await generateCampaignSuggestion(system);
      setTitle(suggestion.title);
      setTheme(suggestion.theme);
      setTone(suggestion.tone);
    } catch (error) {
      setErrors({ submit: 'Failed to generate campaign: ' + (error as Error).message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    const titleError = validateCampaignTitle(title);
    const systemError = validateCampaignSystem(system);
    const themeError = validateCampaignTheme(theme);
    const toneError = validateCampaignTone(tone);

    if (titleError) newErrors.title = titleError;
    if (systemError) newErrors.system = systemError;
    if (themeError) newErrors.theme = themeError;
    if (toneError) newErrors.tone = toneError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateCampaign({ title, system, theme, tone });
    } catch (error) {
      setErrors({ submit: (error as Error).message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="retro-container">
      <Card title={t('campaignCreation.title')}>
        <form onSubmit={handleSubmit}>
          <Input
            label={t('campaignCreation.campaignTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('campaignCreation.campaignTitlePlaceholder')}
            required
          />
          {errors.title && (
            <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
              {errors.title}
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>{t('campaignCreation.system')}</label>
              <button
                type="button"
                className="retro-button"
                onClick={handleGenerateWithAI}
                disabled={!system || isGenerating}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  minWidth: 'auto',
                }}
              >
                {isGenerating ? '⏳ ' + t('campaignCreation.creating') : '✨ Generate with AI'}
              </button>
            </div>
            <select
              className="form-select"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              required
            >
              <option value="">Select a system...</option>
              <option value="D&D 5e">D&D 5e</option>
              <option value="Pathfinder 2e">Pathfinder 2e</option>
              <option value="Call of Cthulhu">Call of Cthulhu</option>
              <option value="Cyberpunk RED">Cyberpunk RED</option>
              <option value="Vampire: The Masquerade">Vampire: The Masquerade</option>
              <option value="Fate Core">Fate Core</option>
              <option value="Powered by the Apocalypse">Powered by the Apocalypse</option>
              <option value="OSR (Old School Renaissance)">OSR (Old School Renaissance)</option>
              <option value="Generic/Freeform">Generic/Freeform</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {errors.system && (
            <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
              {errors.system}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{t('campaignCreation.theme')}</label>
            <textarea
              className="form-textarea"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder={t('campaignCreation.themePlaceholder')}
              rows={3}
              required
            />
          </div>
          {errors.theme && (
            <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
              {errors.theme}
            </div>
          )}

          <Input
            label={t('campaignCreation.tone')}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="e.g., Serious, whimsical, dark, heroic"
            required
          />
          {errors.tone && (
            <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
              {errors.tone}
            </div>
          )}

          {errors.submit && (
            <div className="error-container mb-md">
              {errors.submit}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('campaignCreation.creating') : t('campaignCreation.startCampaign')}
            </Button>
            <Button type="button" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
