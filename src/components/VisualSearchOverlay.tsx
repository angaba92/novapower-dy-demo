import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useVisualSearch } from '../hooks/useVisualSearch';
import { fileToBase64, urlToBase64 } from '../utils/imageToBase64';
import { useConfig } from '../context/ConfigContext';
import ScoreInfoIcon from './ScoreInfoIcon';

// [DY INTEGRATION] Visual Search side panel. NovaPower uses this to let
// visitors upload a picture of a router, EV charger, smart device, etc. and
// surface visually similar plans/devices from the feed.

interface VisualSearchOverlayProps {
  productImageUrl?: string;
  onClose: () => void;
}

export default function VisualSearchOverlay({ productImageUrl, onClose }: VisualSearchOverlayProps) {
  const { config } = useConfig();
  const visualSearch = useVisualSearch();
  const [mode, setMode] = useState<'product' | 'upload'>(productImageUrl ? 'product' : 'upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(productImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(productImageUrl ? 'product' : 'upload');
    setPreview(productImageUrl ?? null);
    setFile(null);
    setError(null);
  }, [productImageUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onPickFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const runSearch = async () => {
    setError(null);
    try {
      if (mode === 'product' && productImageUrl) {
        // Convert remote URL to base64 in the browser to avoid CORS surprises.
        const b64 = await urlToBase64(productImageUrl);
        await visualSearch.mutateAsync({ imageBase64: b64 });
      } else if (file) {
        const b64 = await fileToBase64(file);
        await visualSearch.mutateAsync({ imageBase64: b64 });
      } else {
        setError('Choose an image first.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const results = visualSearch.data?.results ?? [];

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200"
    >
      <header className="flex items-center justify-between p-4 border-b border-gray-200 gradient-hero text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <h2 className="font-semibold">Visual Search</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 border-b border-gray-200 bg-[#f5faff]">
        <div className="flex gap-2 mb-3 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={
              'flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider transition ' +
              (mode === 'upload' ? 'bg-[#0a4ea8] text-white' : 'bg-white border border-gray-200 text-gray-700')
            }
          >
            Upload image
          </button>
          {productImageUrl && (
            <button
              type="button"
              onClick={() => setMode('product')}
              className={
                'flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider transition ' +
                (mode === 'product' ? 'bg-[#0a4ea8] text-white' : 'bg-white border border-gray-200 text-gray-700')
              }
            >
              From product
            </button>
          )}
        </div>

        {mode === 'upload' && (
          <label
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:bg-white transition"
            onDrop={(e) => {
              e.preventDefault();
              onPickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Drop an image or click to choose · max 10 MB</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}

        {preview && (
          <div className="mt-3 relative">
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/90 border border-gray-200"
              aria-label="Clear image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <button
          type="button"
          onClick={runSearch}
          className="btn-primary w-full mt-3"
          disabled={visualSearch.isPending || (!file && !productImageUrl)}
        >
          {visualSearch.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              Find similar
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Recommended similar plans
          {visualSearch.data?.totalResults !== undefined && (
            <span className="ml-2 text-gray-400">({visualSearch.data.totalResults} matches)</span>
          )}
        </h3>
        {results.length === 0 && !visualSearch.isPending && (
          <p className="text-sm text-gray-500">Run a search to see similar plans here.</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {results.slice(0, 20).map((r, i) => {
            const data: any = r.productData ?? r;
            const img = data.image_url || data.image_url_small || data.imageUrl || '';
            const name = data.name || data.productName || data.sku || 'Plan';
            const price =
              typeof data.price === 'number' ? data.price.toFixed(2).replace('.', ',') : data.price;
            return (
              <a
                key={i}
                href={data.url || `/plan/${data.sku ?? r.sku}`}
                className="rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-[#0a4ea8]/40 relative"
              >
                {img && <img src={img} alt={name} className="w-full h-28 object-cover" loading="lazy" />}
                <div className="p-2">
                  <div className="text-[12px] font-semibold leading-tight line-clamp-2">{name}</div>
                  {price && (
                    <div className="text-[12px] font-bold text-[#062f66] mt-1">
                      {price} {config.currency}/mo
                    </div>
                  )}
                </div>
                <div className="absolute top-1.5 right-1.5">
                  <ScoreInfoIcon item={r} />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
