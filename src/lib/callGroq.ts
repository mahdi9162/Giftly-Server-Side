import Groq from 'groq-sdk';
import config from '../config';

export const callGroq = async (prompt: string): Promise<string> => {
  if (!config.groq_api_key) {
    throw new Error('GROQ_API_KEY is not set in environment');
  }

  const groq = new Groq({
    apiKey: config.groq_api_key,
  });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    return completion.choices?.[0]?.message?.content?.trim() || '';
  } catch (error: unknown) {
    console.error('Groq Error:', error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('Failed to get response from Groq');
  }
};
