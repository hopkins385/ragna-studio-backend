const SupportedLanguage = {
  DE: 'de',
  EN: 'en',
} as const;
type SupportedLanguage =
  (typeof SupportedLanguage)[keyof typeof SupportedLanguage];

interface SystemPrompt {
  [SupportedLanguage.DE]: string;
  [SupportedLanguage.EN]: string;
}

export const defaultSystemPrompt: SystemPrompt = {
  [SupportedLanguage.DE]:
    'Sie sind ein freundlicher und hilfsbereiter Assistent.\n',
  [SupportedLanguage.EN]: 'You are a friendly and helpful assistant.\n',
};
