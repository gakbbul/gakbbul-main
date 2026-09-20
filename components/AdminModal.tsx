import React, { useState, useEffect } from 'react';
import { X, ExternalLink, RefreshCw, Table, Info, Check, Link2, FileSpreadsheet } from 'lucide-react';
import { Site } from '../types';
import { getSavedSheetUrl, saveSheetUrl } from '../services/sheetService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onRefresh: (sheetUrl?: string) => Promise<void>;
  isLoading: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  sites, 
  onRefresh, 
  isLoading 
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Load saved sheet URL on modal open
  useEffect(() => {
    if (isOpen) {
      setSheetUrlInput(getSavedSheetUrl());
      setSavedSuccess(false);
      setSaveError('');
    }
  }, [isOpen]);

  const handleSaveAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSavedSuccess(false);

    const trimmed = sheetUrlInput.trim();
    saveSheetUrl(trimmed);

    try {
      await onRefresh(trimmed);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || '스프레드시트 동기화에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">사이트 목록 관리</h2>
              <p className="text-xs text-slate-400 mt-0.5">구글 스프레드시트로 웹사이트 목록을 관리합니다</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sheet URL Configuration Form */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <form onSubmit={handleSaveAndSync} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Link2 size={16} className="text-blue-400" />
                    구글 스프레드시트 링크 (뷰어 권한)
                  </span>
                  {sheetUrlInput.trim() && (
                    <a
                      href={sheetUrlInput.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-normal"
                    >
                      스프레드시트 열기 <ExternalLink size={12} />
                    </a>
                  )}
                </label>
                <input
                  type="text"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                />
              </div>

              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                  {saveError}
                </div>
              )}

              {savedSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                  <Check size={16} /> 스프레드시트가 성공적으로 저장되고 동기화되었습니다!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-sm"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  {isLoading ? '동기화 중...' : '스프레드시트 저장 및 동기화'}
                </button>
              </div>
            </form>
          </div>

          {/* Guide Box */}
          <div className="bg-blue-950/20 border border-blue-800/40 p-5 rounded-xl space-y-3">
            <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
              <Info size={16} className="text-blue-400" />
              구글 스프레드시트 열(Column) 구성 가이드
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              구글 스프레드시트의 <strong>1행(헤더)</strong> 또는 각 열을 다음 순서대로 작성해 주세요:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60">
                <div className="text-slate-500 font-mono text-[10px] mb-1">A열 (1열)</div>
                <div className="font-bold text-blue-400">제목</div>
                <div className="text-[10px] text-slate-400 mt-1">예: 네이버</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60">
                <div className="text-slate-500 font-mono text-[10px] mb-1">B열 (2열)</div>
                <div className="font-bold text-purple-400">부제목</div>
                <div className="text-[10px] text-slate-400 mt-1">예: 검색 포털</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60">
                <div className="text-slate-500 font-mono text-[10px] mb-1">C열 (3열)</div>
                <div className="font-bold text-emerald-400">설명</div>
                <div className="text-[10px] text-slate-400 mt-1">예: 국내 최대 포털...</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60">
                <div className="text-slate-500 font-mono text-[10px] mb-1">D열 (4열)</div>
                <div className="font-bold text-amber-400">사이트주소</div>
                <div className="text-[10px] text-slate-400 mt-1">예: naver.com</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg space-y-1">
              <div className="font-medium text-slate-300">💡 스프레드시트 공유 설정 방법:</div>
              <div>1. 구글 스프레드시트 우측 상단 <strong>[공유]</strong> 클릭</div>
              <div>2. 일반 액세스를 <strong>[링크가 있는 모든 사용자]</strong> 및 <strong>[뷰어]</strong>로 설정</div>
              <div>3. <strong>[링크 복사]</strong> 후 위의 입력란에 붙여넣고 저장하세요.</div>
            </div>
          </div>

          {/* Current Loaded Sites Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Table size={16} className="text-slate-400" />
                현재 불러온 사이트 ({sites.length}개)
              </h4>
            </div>

            {sites.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/30 rounded-xl border border-slate-800 text-slate-500 text-xs">
                불러온 사이트 데이터가 없습니다. 상단에 구글 스프레드시트 링크를 등록해주세요.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {sites.map((site, index) => (
                  <div 
                    key={site.id || index} 
                    className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 font-medium text-slate-200 truncate">
                        <span>{site.title}</span>
                        {site.subtitle && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                            {site.subtitle}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 truncate mt-0.5">{site.description}</div>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] truncate max-w-[140px]">
                      {site.url}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
