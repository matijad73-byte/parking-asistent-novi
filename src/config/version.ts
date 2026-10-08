/**
 * Centralized Application Configuration & Versioning
 * Updates here are dynamically reflected in the header, metadata, share modal, and export manifests.
 */
export const APP_CONFIG = {
  name: 'Parking asistent',
  version: '2.0',
  versionFull: '2.0.0',
  buildCode: 7,
  releaseDate: '2026-09-21',
  description: 'Brz i pouzdan asistent za automatski izbor zone i plaćanje parkinga SMS-om u Srbiji i regionu.',
  publicShareUrl: 'https://ais-dev-dzhicdehqyudtciynjqa5x-560142873097.europe-west1.run.app',
} as const;

export const APP_VERSION = APP_CONFIG.version;
export const APP_NAME = APP_CONFIG.name;
