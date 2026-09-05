export interface LanguageBadgeInfo {
  label: string;
  emoji: string;
  badge: string;
  colorClass: string;
  bgClass: string;
}

export interface IndustryBadgeInfo {
  name: string;
  label: string;
  region: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const INDUSTRIES = [
  'All',
  'Bollywood',
  'Tollywood',
  'Kollywood',
  'Mollywood',
  'Sandalwood',
  'Hollywood',
] as const;

export const LANGUAGES = [
  'All',
  'Hindi',
  'Telugu',
  'Tamil',
  'Malayalam',
  'Kannada',
  'English',
] as const;

export const POPULAR_SEARCH_ACTORS = [
  'Shah Rukh Khan',
  'Rajinikanth',
  'Prabhas',
  'Allu Arjun',
  'Yash',
  'Mohanlal',
  'Kamal Haasan',
  'Vijay',
  'Jr. NTR',
  'Ram Charan',
  'Aamir Khan',
  'Ranbir Kapoor',
  'Rishab Shetty',
  'Fahadh Faasil',
  'Dulquer Salmaan',
];

export const POPULAR_DIRECTORS = [
  'S.S. Rajamouli',
  'Prashanth Neel',
  'Lokesh Kanagaraj',
  'Christopher Nolan',
  'Sandeep Reddy Vanga',
  'Rajkumar Hirani',
  'Sukumar',
  'Mani Ratnam',
  'Rishab Shetty',
  'Jeethu Joseph',
];

export function getLanguageBadge(language: string): LanguageBadgeInfo {
  const normalized = language.toLowerCase().trim();
  switch (normalized) {
    case 'hindi':
      return {
        label: 'Hindi',
        emoji: '🇮🇳',
        badge: 'Hindi 🇮🇳',
        colorClass: 'text-orange-400',
        bgClass: 'bg-orange-950/40 border-orange-500/30 text-orange-200',
      };
    case 'telugu':
      return {
        label: 'Telugu',
        emoji: '🎬',
        badge: 'Telugu 🎬',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
      };
    case 'tamil':
      return {
        label: 'Tamil',
        emoji: '🎥',
        badge: 'Tamil 🎥',
        colorClass: 'text-red-400',
        bgClass: 'bg-red-950/40 border-red-500/30 text-red-200',
      };
    case 'malayalam':
      return {
        label: 'Malayalam',
        emoji: '🍿',
        badge: 'Malayalam 🍿',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
      };
    case 'kannada':
      return {
        label: 'Kannada',
        emoji: '⭐',
        badge: 'Kannada ⭐',
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-950/40 border-yellow-500/30 text-yellow-200',
      };
    case 'english':
    default:
      return {
        label: language || 'English',
        emoji: '🌍',
        badge: `${language || 'English'} 🌍`,
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-950/40 border-sky-500/30 text-sky-200',
      };
  }
}

export function getIndustryBadge(industry: string): IndustryBadgeInfo {
  const norm = (industry || '').toLowerCase().trim();
  switch (norm) {
    case 'bollywood':
      return {
        name: 'Bollywood',
        label: 'Bollywood',
        region: 'Hindi Cinema',
        colorClass: 'text-orange-400',
        bgClass: 'bg-orange-500/15',
        borderClass: 'border-orange-500/30',
      };
    case 'tollywood':
      return {
        name: 'Tollywood',
        label: 'Tollywood',
        region: 'Telugu Cinema',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/15',
        borderClass: 'border-amber-500/30',
      };
    case 'kollywood':
      return {
        name: 'Kollywood',
        label: 'Kollywood',
        region: 'Tamil Cinema',
        colorClass: 'text-red-400',
        bgClass: 'bg-red-500/15',
        borderClass: 'border-red-500/30',
      };
    case 'mollywood':
      return {
        name: 'Mollywood',
        label: 'Mollywood',
        region: 'Malayalam Cinema',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/15',
        borderClass: 'border-emerald-500/30',
      };
    case 'sandalwood':
      return {
        name: 'Sandalwood',
        label: 'Sandalwood',
        region: 'Kannada Cinema',
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-500/15',
        borderClass: 'border-yellow-500/30',
      };
    case 'hollywood':
    default:
      return {
        name: 'Hollywood',
        label: 'Hollywood',
        region: 'Global Cinema',
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-500/15',
        borderClass: 'border-sky-500/30',
      };
  }
}
