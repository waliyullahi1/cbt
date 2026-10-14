// utils/subjectMeta.js

/**
 * Central subject metadata
 * ---------------------------------------
 * One place for:
 * - icon
 * - background color
 * - text color
 *
 * Use this utility everywhere in the app.
 */

const DEFAULT_SUBJECT_META = {
  icon: "lucide:book-open",
  bg: "bg-slate-100",
  text: "text-slate-600",
};

/**
 * All supported subjects
 */
export const SUBJECT_META = {
  accounting: {
    icon: "lucide:calculator",
    bg: "bg-blue-100",
    text: "text-blue-600",
  },

  agriculture: {
    icon: "lucide:wheat",
    bg: "bg-green-100",
    text: "text-green-600",
  },

  arabic: {
    icon: "lucide:languages",
    bg: "bg-orange-100",
    text: "text-orange-600",
  },

  biology: {
    icon: "lucide:dna",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },

  chemistry: {
    icon: "lucide:flask-conical",
    bg: "bg-purple-100",
    text: "text-purple-600",
  },

  "christian-religious-studies": {
    icon: "lucide:church",
    bg: "bg-red-100",
    text: "text-red-600",
  },

  "civic-education": {
    icon: "lucide:landmark",
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },

  commerce: {
    icon: "lucide:shopping-cart",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
  },

  "computer-studies": {
    icon: "lucide:monitor",
    bg: "bg-cyan-100",
    text: "text-cyan-600",
  },

  economics: {
    icon: "lucide:chart-no-axes-combined",
    bg: "bg-teal-100",
    text: "text-teal-600",
  },

  "english-language": {
    icon: "lucide:book-open",
    bg: "bg-blue-100",
    text: "text-blue-600",
  },

  "fine-art": {
    icon: "lucide:palette",
    bg: "bg-pink-100",
    text: "text-pink-600",
  },

  french: {
    icon: "lucide:languages",
    bg: "bg-violet-100",
    text: "text-violet-600",
  },

  geography: {
    icon: "lucide:globe-2",
    bg: "bg-lime-100",
    text: "text-lime-600",
  },

  government: {
    icon: "lucide:building-2",
    bg: "bg-slate-100",
    text: "text-slate-600",
  },

  hausa: {
    icon: "lucide:languages",
    bg: "bg-amber-100",
    text: "text-amber-600",
  },

  history: {
    icon: "lucide:scroll-text",
    bg: "bg-stone-100",
    text: "text-stone-600",
  },

  "home-economics": {
    icon: "lucide:house",
    bg: "bg-rose-100",
    text: "text-rose-600",
  },

  igbo: {
    icon: "lucide:languages",
    bg: "bg-green-100",
    text: "text-green-600",
  },

  insurance: {
    icon: "lucide:shield-check",
    bg: "bg-sky-100",
    text: "text-sky-600",
  },

  "literature-in-english": {
    icon: "lucide:book-text",
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-600",
  },

  mathematics: {
    icon: "lucide:sigma",
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },

  marketing: {
    icon: "lucide:megaphone",
    bg: "bg-pink-100",
    text: "text-pink-600",
  },

  physics: {
    icon: "lucide:atom",
    bg: "bg-cyan-100",
    text: "text-cyan-600",
  },
};


/**
 * Normalize a subject ID/name.
 *
 * Accepts:
 *   "English"
 *   "english"
 *   "Home Economics"
 *   { id: "home-economics" }
 *   { name: "Home Economics" }
 */
export function normalizeSubjectId(subject) {
  if (!subject) {
    return "";
  }

  let value = subject;

  if (typeof subject === "object") {
    value = subject.id || subject.name || "";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized === "english"
    ? "english-language"
    : normalized;
}


/**
 * Get complete subject metadata
 */
export function getSubjectMeta(subject) {
  const id = normalizeSubjectId(subject);

  return SUBJECT_META[id] || DEFAULT_SUBJECT_META;
}


/**
 * Get subject icon
 */
export function getSubjectIcon(subject) {
  return getSubjectMeta(subject).icon;
}


/**
 * Get subject colors
 */
export function getSubjectColor(subject) {
  const meta = getSubjectMeta(subject);

  return {
    bg: meta.bg,
    text: meta.text,
  };
}


/**
 * Check whether a subject exists
 */
export function hasSubjectMeta(subject) {
  const id = normalizeSubjectId(subject);

  return Object.prototype.hasOwnProperty.call(SUBJECT_META, id);
}


/**
 * Get all subject metadata
 */
export function getAllSubjectMeta() {
  return SUBJECT_META;
}


/**
 * Default export
 */
export default SUBJECT_META;