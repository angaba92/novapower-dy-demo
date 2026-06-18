import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RotateCcw, Save, X } from 'lucide-react';
import { useState } from 'react';
import { defaultConfig, useConfig } from '../context/ConfigContext';
import type { BoostMatchType, DYConfig, DynamicBoostingFactor } from '../context/ConfigContext';

// [DY INTEGRATION] Live debug panel — same purpose as the panel in
// sinsay_v2: tweak any DY parameter (sectionId, strategy, KNN, boosting,
// affinities) without rebuilding. Slide-in from the right, opens with
// CTRL + SHIFT + K.

interface ConfigPanelProps {
  onClose: () => void;
}

export default function ConfigPanel({ onClose }: ConfigPanelProps) {
  const { config, setConfig, lastRequestPayload } = useConfig();
  const [local, setLocal] = useState<DYConfig>(config);
  const [tab, setTab] = useState<'config' | 'inspector'>('config');

  const update = <K extends keyof DYConfig>(k: K, v: DYConfig[K]) => setLocal((p) => ({ ...p, [k]: v }));

  const save = () => {
    setConfig(local);
    onClose();
  };

  const reset = () => {
    if (!confirm('Factory-reset DY config?')) return;
    localStorage.removeItem('dy_novapower_config');
    setConfig(defaultConfig);
    setLocal(defaultConfig);
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md frosted-glass-dark text-white flex flex-col shadow-2xl"
    >
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="font-semibold tracking-tight">Dynamic Yield · Config</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 rounded hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex border-b border-white/10 text-xs">
        {(['config', 'inspector'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              'flex-1 py-2.5 font-semibold uppercase tracking-wider transition ' +
              (tab === id ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white')
            }
          >
            {id === 'config' ? 'Configuration' : 'Request inspector'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 text-sm">
        {tab === 'config' ? (
          <ConfigTab local={local} update={update} />
        ) : (
          <Inspector lastRequestPayload={lastRequestPayload} />
        )}
      </div>

      {tab === 'config' && (
        <footer className="p-4 border-t border-white/10 flex gap-2">
          <button type="button" onClick={save} className="btn-primary flex-1">
            <Save className="w-4 h-4" /> Update API Session
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-3 py-2 rounded-lg border border-white/20 text-xs uppercase tracking-wide flex items-center gap-1 hover:bg-white/10"
            title="Factory reset"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </footer>
      )}
    </motion.aside>
  );
}

function ConfigTab({
  local,
  update,
}: {
  local: DYConfig;
  update: <K extends keyof DYConfig>(k: K, v: DYConfig[K]) => void;
}) {
  return (
    <>
      <Section title="API Keys">
        <Field label="Visual Search API Key">
          <input
            type="password"
            className="input"
            value={local.visualSearchApiKey}
            onChange={(e) => update('visualSearchApiKey', e.target.value)}
            placeholder="Leave empty to use .env.local"
            autoComplete="off"
          />
        </Field>
      </Section>

      <Section title="Core API resolution">
        <Field label="Section ID (hardcoded)">
          <input className="input opacity-60" value="8795021" readOnly />
        </Field>
        <Field label="Feed ID">
          <input className="input" value={local.feedId} onChange={(e) => update('feedId', e.target.value)} />
        </Field>
        <Field label="Widget ID">
          <input className="input" value={local.widgetId} onChange={(e) => update('widgetId', e.target.value)} />
        </Field>
        <Field label="Region">
          <select className="input" value={local.region} onChange={(e) => update('region', e.target.value as 'US' | 'EU')}>
            <option value="US">US</option>
            <option value="EU">EU</option>
          </select>
        </Field>
      </Section>

      <Section title="Search & strategy">
        <Field label="Strategy">
          <input className="input" value={local.strategy} onChange={(e) => update('strategy', e.target.value)} />
        </Field>
        <Field label="Items per page">
          <input type="number" className="input" value={local.itemsPerPage} onChange={(e) => update('itemsPerPage', Number(e.target.value))} />
        </Field>
        <Field label="Max products">
          <input type="number" className="input" value={local.maxProducts} onChange={(e) => update('maxProducts', Number(e.target.value))} />
        </Field>
        <Field label="Bucket size">
          <input type="number" className="input" value={local.bucketSize} onChange={(e) => update('bucketSize', Number(e.target.value))} />
        </Field>
        <Field label="Search formula">
          <input className="input" value={local.searchFormula} onChange={(e) => update('searchFormula', e.target.value)} placeholder="(optional)" />
        </Field>
        <Toggle label="Suggest mode" value={local.suggestMode} onChange={(v) => update('suggestMode', v)} />
        <Toggle label="Explain mode" value={local.explainMode} onChange={(v) => update('explainMode', v)} />
        <Toggle label="Translation enabled" value={local.translationEnabled} onChange={(v) => update('translationEnabled', v)} />
        <Toggle label="PLP search mode" value={local.plpSearchMode} onChange={(v) => update('plpSearchMode', v)} />
        <Toggle label="Sort by enabled" value={local.sortByEnabled} onChange={(v) => update('sortByEnabled', v)} />
        <Toggle label="Use search formula" value={local.useSearchFormula} onChange={(v) => update('useSearchFormula', v)} />
        <Toggle label="Use bucket size" value={local.useBucketSize} onChange={(v) => update('useBucketSize', v)} />
        <Toggle label="Use locale" value={local.useLocale} onChange={(v) => update('useLocale', v)} />
      </Section>

      <Section title="Semantic & KNN parameters">
        <Field label="K">
          <input type="number" className="input" value={local.k} onChange={(e) => update('k', Number(e.target.value))} />
        </Field>
        <Field label="Num candidates">
          <input type="number" className="input" value={local.numCandidates} onChange={(e) => update('numCandidates', Number(e.target.value))} />
        </Field>
        <Field label="Text KNN threshold">
          <input type="number" step="0.01" className="input" value={local.textKnnThreshold} onChange={(e) => update('textKnnThreshold', Number(e.target.value))} />
        </Field>
        <Field label="Image KNN threshold">
          <input type="number" step="0.01" className="input" value={local.imageKnnThreshold} onChange={(e) => update('imageKnnThreshold', Number(e.target.value))} />
        </Field>
        <Field label="Image boost">
          <input type="number" step="0.05" className="input" value={local.imageBoost} onChange={(e) => update('imageBoost', Number(e.target.value))} />
        </Field>
      </Section>

      <Section title="Localization & environment">
        <Field label="Page type">
          <input className="input" value={local.ctxType} onChange={(e) => update('ctxType', e.target.value)} />
        </Field>
        <Field label="Language / locale">
          <select className="input" value={local.language} onChange={(e) => update('language', e.target.value)}>
            <option value="en_US">en_US</option>
            <option value="es_ES">es_ES</option>
          </select>
        </Field>
        <Field label="Currency">
          <input className="input" value={local.currency} onChange={(e) => update('currency', e.target.value)} />
        </Field>
        <Field label="Geo code">
          <input className="input" value={local.geoCode} onChange={(e) => update('geoCode', e.target.value)} />
        </Field>
        <Field label="Geo region code">
          <input className="input" value={local.geoRegionCode} onChange={(e) => update('geoRegionCode', e.target.value)} />
        </Field>
        <Field label="UID">
          <input className="input" value={local.uid} onChange={(e) => update('uid', e.target.value)} />
        </Field>
        <Field label="Category path">
          <input className="input" value={local.categoryPath} onChange={(e) => update('categoryPath', e.target.value)} />
        </Field>
        <Field label="Logo URL">
          <input className="input" value={local.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} />
        </Field>
      </Section>

      <Section title="Field priority mapping" defaultOpen={false}>
        <Field label="Title fields">
          <input
            className="input"
            value={local.mapping.title.join(', ')}
            onChange={(e) => update('mapping', { ...local.mapping, title: e.target.value.split(',').map((s) => s.trim()) })}
          />
        </Field>
        <Field label="Image fields">
          <input
            className="input"
            value={local.mapping.image.join(', ')}
            onChange={(e) => update('mapping', { ...local.mapping, image: e.target.value.split(',').map((s) => s.trim()) })}
          />
        </Field>
        <Field label="Price fields">
          <input
            className="input"
            value={local.mapping.price.join(', ')}
            onChange={(e) => update('mapping', { ...local.mapping, price: e.target.value.split(',').map((s) => s.trim()) })}
          />
        </Field>
      </Section>

      <Section title="Priority boosting" defaultOpen={false}>
        <Toggle label="Use dynamic boosting" value={local.useDynamicBoosting} onChange={(v) => update('useDynamicBoosting', v)} />
        {local.useDynamicBoosting &&
          local.dynamicBoostingFactors.map((f, idx) => (
            <DynamicFactorEditor
              key={f.id}
              factor={f}
              onChange={(next) =>
                update(
                  'dynamicBoostingFactors',
                  local.dynamicBoostingFactors.map((x, i) => (i === idx ? next : x)),
                )
              }
              onRemove={() =>
                update(
                  'dynamicBoostingFactors',
                  local.dynamicBoostingFactors.filter((_, i) => i !== idx),
                )
              }
            />
          ))}
        {local.useDynamicBoosting && (
          <button
            type="button"
            className="text-xs underline text-white/70 mt-1"
            onClick={() =>
              update('dynamicBoostingFactors', [
                ...local.dynamicBoostingFactors,
                { id: Math.random().toString(36).slice(2), field: 'categories', value: '', matchType: 'IS', weight: 50 },
              ])
            }
          >
            + Add factor
          </button>
        )}
        <div className="mt-3" />
        <Toggle label="Use affinity boosting" value={local.useAffinityBoosting} onChange={(v) => update('useAffinityBoosting', v)} />
        {local.useAffinityBoosting && (
          <>
            <Field label="Affinity weight (-100..100)">
              <input
                type="number"
                className="input"
                value={local.affinityBoostWeight}
                onChange={(e) => update('affinityBoostWeight', Number(e.target.value))}
              />
            </Field>
            <Field label="Affinity profile JSON">
              <textarea
                className="input min-h-24 font-mono text-xs"
                value={local.affinityProfileJson}
                onChange={(e) => update('affinityProfileJson', e.target.value)}
              />
            </Field>
          </>
        )}
      </Section>

      <style>{`
        .input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 6px 10px; border-radius: 6px; color: #fff; font-size: 12px; }
        .input:focus { outline: 2px solid rgba(0,180,216,0.5); }
      `}</style>
    </>
  );
}

function DynamicFactorEditor({
  factor,
  onChange,
  onRemove,
}: {
  factor: DynamicBoostingFactor;
  onChange: (next: DynamicBoostingFactor) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-white/10 p-2 mb-2 space-y-1">
      <div className="grid grid-cols-2 gap-1.5">
        <input
          className="input"
          placeholder="field"
          value={factor.field}
          onChange={(e) => onChange({ ...factor, field: e.target.value })}
        />
        <select
          className="input"
          value={factor.matchType}
          onChange={(e) => onChange({ ...factor, matchType: e.target.value as BoostMatchType })}
        >
          <option value="IS">IS</option>
          <option value="CONTAINS">CONTAINS</option>
          <option value="IS_NOT">IS_NOT</option>
        </select>
      </div>
      <input
        className="input"
        placeholder="value"
        value={factor.value}
        onChange={(e) => onChange({ ...factor, value: e.target.value })}
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="input"
          value={factor.weight}
          onChange={(e) => onChange({ ...factor, weight: Number(e.target.value) })}
        />
        <button type="button" className="text-xs text-white/60 underline" onClick={onRemove}>
          remove
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-white/80"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-white/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-xs">
      <span className="text-white/80">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={
          'relative h-5 w-9 rounded-full transition ' +
          (value ? 'bg-[#2dbe60]' : 'bg-white/20')
        }
        aria-pressed={value}
      >
        <span
          className={
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ' +
            (value ? 'translate-x-4' : 'translate-x-0')
          }
        />
      </button>
    </label>
  );
}

function Inspector({ lastRequestPayload }: { lastRequestPayload: unknown }) {
  return (
    <div>
      <p className="text-xs text-white/60 mb-2">
        Last request payload (POSTed to <code>/api/dy-search</code>):
      </p>
      <pre className="text-[11px] bg-black/40 p-3 rounded-md overflow-x-auto custom-scrollbar leading-relaxed">
        {lastRequestPayload ? JSON.stringify(lastRequestPayload, null, 2) : '(no request fired yet)'}
      </pre>
    </div>
  );
}
