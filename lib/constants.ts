// lib/constants.ts
export const APP_NAME = "ThunderCrawler"
export const APP_DESCRIPTION = "Smart job application automation platform"

export const JOB_SOURCES = {
  YC: 'yc',                                     // this value is actually looks like -> readonly YC: "yc";    because of 'as const'
  WELLFOUND: 'wellfound',                       // this value is actually looks like -> readonly WELLFOUND: "wellfound";     because of 'as const'
  INTERNSHALA: 'internshala',
  LINKEDIN: 'linkedin',
  INDEED: 'indeed',
} as const      // as const : Make this object fully read-only and preserve exact literal values.  Remember it : as const = freeze values + lock types
// What happens WITHOUT as const
// export const ROUTES = {
//   HOME: '/',                  //  without as const, these values would be inferred as type string by typeScript like -> HOME: string;
//   SIGNIN: '/signin',         //  without as const, these values would be inferred as type string by typeScript like -> SIGNIN: string;
// }

export const APPLICATION_STATUS = {
  SAVED: 'saved',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
} as const

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  APPLICATIONS: '/applications',
  RESUME: '/resume',
  SETTINGS: '/settings',
} as const

