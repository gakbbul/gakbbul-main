import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle, Sparkles, FileSpreadsheet } from 'lucide-react';
import { Site } from './types';
import { 
  DEFAULT_SHEET_URL,
  getSavedSheetUrl, 
  getCachedSites, 
  fetchSitesFromGoogleSheet 
} from './services/sheetService';
import { SiteCard } from './components/SiteCard';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 스프레드시트 데이터 불러오기 함수
  const loadSites = useCallback(async (customUrl?: string) => {
    const sheetUrl = (customUrl !== undefined ? customUrl : getSavedSheetUrl()).trim();
    
    if (!sheetUrl) {
      const cached = getCachedSites();
      setSites(cached);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const fetchedSites = await fetchSitesFromGoogleSheet(sheetUrl);
      setSites(fetchedSites);
      setLastUpdated(new Date());
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to load sheet:', err);
      setErrorMessage(err?.message || '스프레드시트 데이터를 불러오지 못했습니다.');
      const cached = getCachedSites();
      if (cached.length > 0 && sites.length === 0) {
        setSites(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [sites.length]);

  // Initial Load
  useEffect(() => {
    const cached = getCachedSites();
    if (cached.length > 0) {
      setSites(cached);
    }
    loadSites();
  }, []);

  const filteredSites = sites.filter(site => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      (site.title && site.title.toLowerCase().includes(query)) ||
      (site.subtitle && site.subtitle.toLowerCase().includes(query)) ||
      (site.category && site.category.toLowerCase().includes(query)) ||
      (site.description && site.description.toLowerCase().includes(query)) ||
      (site.name && site.name.toLowerCase().includes(query)) ||
      (site.url && site.url.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
              GAKBBUL
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 부제목, 분류, 설명, 사이트 검색..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-slate-900 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadSites()}
              disabled={loading}
              title="데이터 새로고침"
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-700 transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-blue-400' : ''} />
            </button>

            <a
              href={DEFAULT_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="구글 스프레드시트 열기"
              className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-700 transition-all flex items-center justify-center"
            >
              <FileSpreadsheet size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Error / Guide Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-200">스프레드시트 연동 알림</div>
              <div className="text-xs text-red-300/90 mt-1">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Empty state when no sheet registered and no sites */}
        {sites.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
              <Sparkles size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">등록된 웹사이트가 없습니다</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              구글 스프레드시트 링크가 기본 연동되었습니다.<br />
              스프레드시트에 사이트를 추가하시면 이곳에 실시간으로 표시됩니다.
            </p>
            <a
              href={DEFAULT_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-sm"
            >
              <FileSpreadsheet size={18} />
              구글 스프레드시트 열기
            </a>
          </div>
        )}

        {/* Search empty state */}
        {sites.length > 0 && filteredSites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-lg text-slate-400">'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-blue-400 hover:underline"
            >
              검색어 초기화
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {filteredSites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© GAKBBUL Dashboard</span>
          {lastUpdated && (
            <span className="text-slate-600 text-[11px]">
              마지막 동기화: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
