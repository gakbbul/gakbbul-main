import { Site } from '../types';

const SHEET_STORAGE_KEY = 'gakbbul_sheet_url';
const CACHE_STORAGE_KEY = 'gakbbul_cached_sites';

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1LMLclxIx5JJwlGwh1hyFYtvRUG_m5A-2HvjnwvQsjbY/edit?usp=sharing';

/**
 * 로컬스토리지에서 저장된 스프레드시트 URL을 가져옵니다. (없으면 기본 스프레드시트 반환)
 */
export const getSavedSheetUrl = (): string => {
  const saved = localStorage.getItem(SHEET_STORAGE_KEY);
  return saved && saved.trim() ? saved.trim() : DEFAULT_SHEET_URL;
};


/**
 * 스프레드시트 URL을 로컬스토리지에 저장합니다.
 */
export const saveSheetUrl = (url: string): void => {
  localStorage.setItem(SHEET_STORAGE_KEY, url.trim());
};

/**
 * 캐시된 사이트 목록을 가져옵니다.
 */
export const getCachedSites = (): Site[] => {
  try {
    const cached = localStorage.getItem(CACHE_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error('Failed to parse cached sites', e);
    return [];
  }
};

/**
 * 사이트 목록을 캐시에 저장합니다.
 */
export const cacheSites = (sites: Site[]): void => {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(sites));
  } catch (e) {
    console.error('Failed to cache sites', e);
  }
};

/**
 * 구글 스프레드시트 URL을 CSV 다운로드/페치 가능한 URL로 변환합니다.
 */
export const convertToCsvUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. 이미 CSV export URL인 경우
  if (trimmed.includes('format=csv') || trimmed.includes('output=csv')) {
    return trimmed;
  }

  // 2. '웹에 게시' (pubhtml) 형태인 경우
  if (trimmed.includes('/pubhtml')) {
    return trimmed.replace('/pubhtml', '/pub?output=csv');
  }

  // 3. 일반 구글 스프레드시트 공유 링크 형태 (/d/SPREADSHEET_ID/...)
  const docIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (docIdMatch && docIdMatch[1]) {
    const docId = docIdMatch[1];
    
    // gid (시트 ID) 추출
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    return `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv${gidParam}`;
  }

  return trimmed;
};

/**
 * RFC 4180 준수 CSV 파서 (줄바꿈, 쉼표, 따옴표 지원)
 */
export const parseCsv = (csvText: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++; // CRLF
        currentRow.push(currentField.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

/**
 * 도메인/호스트네임 추출 헬퍼
 */
const extractHostname = (url: string): string => {
  try {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    const parsed = new URL(formattedUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/**
 * CSV 2차원 배열을 Site 객체 목록으로 변환합니다.
 * 스프레드시트 컬럼 형태: [A: 제목] [B: 부제목] [C: 설명] [D: 사이트주소] [E: 분류]
 */
export const parseRowsToSites = (rows: string[][]): Site[] => {
  if (rows.length === 0) return [];

  let startIndex = 0;
  let titleCol = 0;
  let subtitleCol = 1;
  let descCol = 2;
  let urlCol = 3;
  let categoryCol = 4;

  // 첫 번째 행이 헤더인지 감지
  const firstRow = rows[0].map(c => c.toLowerCase().trim());
  const hasHeaderKeywords = firstRow.some(c => 
    c.includes('제목') || c.includes('title') || 
    c.includes('설명') || c.includes('desc') || 
    c.includes('주소') || c.includes('url') || c.includes('link') || c.includes('부제목') || c.includes('sub') ||
    c.includes('분류') || c.includes('category') || c.includes('카테고리') || c.includes('그룹')
  );

  if (hasHeaderKeywords) {
    startIndex = 1; // 헤더 행 건너뜀

    // 동적 헤더 인덱스 매칭 시도
    firstRow.forEach((col, idx) => {
      if (col.includes('분류') || col.includes('category') || col.includes('카테고리') || col.includes('그룹')) {
        categoryCol = idx;
      } else if (col.includes('부제목') || col.includes('subtitle') || col.includes('소제목') || col.includes('태그')) {
        subtitleCol = idx;
      } else if (col.includes('제목') || col.includes('title') || col.includes('이름')) {
        titleCol = idx;
      } else if (col.includes('설명') || col.includes('desc') || col.includes('info') || col.includes('내용')) {
        descCol = idx;
      } else if (col.includes('주소') || col.includes('url') || col.includes('link') || col.includes('링크') || col.includes('사이트')) {
        urlCol = idx;
      }
    });
  }

  const sites: Site[] = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const title = (row[titleCol] || '').trim();
    const subtitle = (row[subtitleCol] || '').trim();
    const description = (row[descCol] || '').trim();
    const rawUrl = (row[urlCol] || '').trim();
    const category = categoryCol < row.length ? (row[categoryCol] || '').trim() : '';

    // 제목과 URL이 둘 다 없으면 무시
    if (!title && !rawUrl) continue;

    const hostname = extractHostname(rawUrl || title);

    sites.push({
      id: `site-${i}-${Date.now()}`,
      title: title || hostname,
      subtitle: subtitle || undefined,
      category: category || undefined,
      description: description || '등록된 설명이 없습니다.',
      url: rawUrl,
      name: hostname,
      createdAt: Date.now() - i * 1000,
    });
  }

  return sites;
};

/**
 * 구글 스프레드시트로부터 데이터를 페치하여 Site 목록으로 반환합니다.
 */
export const fetchSitesFromGoogleSheet = async (sheetUrl: string): Promise<Site[]> => {
  const csvUrl = convertToCsvUrl(sheetUrl);
  if (!csvUrl) {
    throw new Error('유효한 구글 스프레드시트 URL이 아닙니다.');
  }

  const response = await fetch(csvUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`스프레드시트를 불러오지 못했습니다 (상태 코드: ${response.status}). 스프레드시트 공유 권한(링크가 있는 모든 사용자 - 뷰어)을 확인해주세요.`);
  }

  const csvText = await response.text();
  
  // HTML 에러 페이지가 반환되었는지 체크 (권한 부족 등으로 구글 로그인 페이지 반환 시)
  if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
    throw new Error('스프레드시트에 접근할 수 없습니다. 스프레드시트의 공유 설정을 "링크가 있는 모든 사용자 - 뷰어"로 변경해주세요.');
  }

  const rows = parseCsv(csvText);
  const sites = parseRowsToSites(rows);

  if (sites.length > 0) {
    cacheSites(sites);
  }

  return sites;
};
