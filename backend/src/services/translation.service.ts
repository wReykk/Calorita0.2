import * as deepl from 'deepl-node';

const authKey = process.env.DEEPL_AUTH_KEY || '';
const translator = new deepl.Translator(authKey);

export const translateText = async (
    text: string | string[],
    targetLang: deepl.TargetLanguageCode
): Promise<string | string[]> => {
    try {
        if (!authKey) return text; // Если ключа нет, возвращаем как есть, чтобы не ломать приложение

        // null означает, что DeepL сам автоопределит язык оригинала
        const result = await translator.translateText(text, null, targetLang);

        if (Array.isArray(result)) {
            return result.map(res => res.text);
        }

        return result.text;
    } catch (error) {
        console.error('DeepL Translation Error:', error);
        return text;
    }
};