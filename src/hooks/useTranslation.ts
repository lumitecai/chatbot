// Re-export useTranslation from react-i18next with proper typing
import { useTranslation as useTranslationOriginal } from 'react-i18next';

export const useTranslation = useTranslationOriginal;

// Export i18n for direct access if needed
export { default as i18n } from '../i18n/config';
