import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNarrative(personalEvent: string, historicalEvent: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a narrative generator that creates meaningful connections between personal events and historical events. Keep the narrative concise (2-3 sentences) and engaging.',
        },
        {
          role: 'user',
          content: `Generate a narrative connecting these events:\nPersonal Event: ${personalEvent}\nHistorical Event: ${historicalEvent}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Unable to generate narrative.';
  } catch (error) {
    console.error('Error generating narrative:', error);
    return 'Unable to generate narrative at this time.';
  }
}

export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analyzer. Respond with exactly one word: "positive", "negative", or "neutral".',
        },
        {
          role: 'user',
          content: `Analyze the sentiment of this text: ${text}`,
        },
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim();
    
    if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
      return sentiment;
    }
    
    return 'neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
}

export async function generateArtPrompt(events: string[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an art prompt generator. Create a detailed prompt for generating abstract art that represents the themes and emotions of the given events.',
        },
        {
          role: 'user',
          content: `Generate an art prompt based on these events:\n${events.join('\n')}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || 'Unable to generate art prompt.';
  } catch (error) {
    console.error('Error generating art prompt:', error);
    return 'Unable to generate art prompt at this time.';
  }
} 