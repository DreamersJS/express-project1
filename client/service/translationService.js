

/**
 * Translates a given message into the target language using DeepL
 *
 * @param {string} text - The text to be translated.
 * @param {string} targetLang - The target language code ('en-US' or 'en-GB').
 * @returns {Promise<string>} - The translated text.
 */
export async function translateMessage(text, targetLang = 'en') {
  try {

    const response = await fetch('/api/messages/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
        }),
      });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}
