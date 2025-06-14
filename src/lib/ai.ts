import { HfInference } from '@huggingface/inference';

// Initialize HF client only when needed
let hf: HfInference | null = null;

function getHfClient(): HfInference {
  if (!hf) {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('Missing HUGGINGFACE_API_KEY environment variable');
    }
    hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }
  return hf;
}

export async function generateNarrative(personalEvent: string, historicalEvent: string): Promise<string> {
  try {
    // Try multiple models for better results
    const models = [
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill',
      'microsoft/DialoGPT-small'
    ];

    for (const model of models) {
      try {
        const prompt = `Create a meaningful connection between these events in 2-3 sentences:

Personal: ${personalEvent}
Historical: ${historicalEvent}

Connection:`;

        const response = await getHfClient().textGeneration({
          model,
          inputs: prompt,
          parameters: {
            max_new_tokens: 120,
            temperature: 0.8,
            do_sample: true,
            return_full_text: false,
            repetition_penalty: 1.1,
          },
        });

        let narrative = response.generated_text?.trim() || '';

        // Advanced cleaning and formatting
        narrative = narrative
          .replace(/^(Connection:|Narrative:|Response:)\s*/i, '')
          .replace(/^\s*[-•]\s*/, '')
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Ensure it's a proper narrative (not just repetition)
        if (narrative.length > 20 && !narrative.toLowerCase().includes('unable to') &&
            !narrative.toLowerCase().includes('cannot generate')) {
          return narrative;
        }
      } catch (modelError) {
        console.warn(`Model ${model} failed:`, modelError);
        continue;
      }
    }

    // Fallback to template-based narrative
    return generateFallbackNarrative(personalEvent, historicalEvent);
  } catch (error) {
    console.error('Error generating narrative:', error);
    return generateFallbackNarrative(personalEvent, historicalEvent);
  }
}

function generateFallbackNarrative(personalEvent: string, historicalEvent: string): string {
  const templates = [
    `While ${historicalEvent.toLowerCase()}, your personal journey included ${personalEvent.toLowerCase()}. This intersection of global events and personal milestones shows how individual stories unfold within the broader tapestry of history.`,
    `The timing of ${personalEvent.toLowerCase()} coinciding with ${historicalEvent.toLowerCase()} creates a unique chapter in your life story. Personal growth often happens against the backdrop of significant world events.`,
    `As ${historicalEvent.toLowerCase()} shaped the world around you, ${personalEvent.toLowerCase()} was shaping your personal narrative. These parallel timelines remind us how individual experiences are woven into the fabric of history.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    // Try multiple sentiment models for better accuracy
    const models = [
      'cardiffnlp/twitter-roberta-base-sentiment-latest',
      'nlptown/bert-base-multilingual-uncased-sentiment',
      'cardiffnlp/twitter-roberta-base-sentiment'
    ];

    for (const model of models) {
      try {
        const response = await getHfClient().textClassification({
          model,
          inputs: text,
        });

        if (Array.isArray(response) && response.length > 0) {
          const results = response.sort((a, b) => b.score - a.score);
          const topResult = results[0];
          const label = topResult.label.toLowerCase();

          // Handle different label formats
          if (label.includes('positive') || label.includes('pos') || label === 'label_2' ||
              (model.includes('nlptown') && ['4', '5'].includes(label))) {
            return 'positive';
          }
          if (label.includes('negative') || label.includes('neg') || label === 'label_0' ||
              (model.includes('nlptown') && ['1', '2'].includes(label))) {
            return 'negative';
          }
          if (label.includes('neutral') || label === 'label_1' ||
              (model.includes('nlptown') && label === '3')) {
            return 'neutral';
          }
        }
      } catch (modelError) {
        console.warn(`Sentiment model ${model} failed:`, modelError);
        continue;
      }
    }

    // Enhanced fallback with more sophisticated analysis
    return analyzeSentimentFallback(text);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return analyzeSentimentFallback(text);
  }
}

function analyzeSentimentFallback(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();

  // Enhanced keyword lists
  const positiveWords = [
    'happy', 'joy', 'love', 'success', 'achievement', 'celebration', 'wonderful', 'amazing',
    'great', 'excellent', 'fantastic', 'awesome', 'brilliant', 'perfect', 'beautiful',
    'excited', 'thrilled', 'delighted', 'proud', 'grateful', 'blessed', 'accomplished',
    'victory', 'win', 'triumph', 'breakthrough', 'milestone', 'promotion', 'graduation',
    'wedding', 'birth', 'anniversary', 'vacation', 'adventure', 'dream', 'hope'
  ];

  const negativeWords = [
    'sad', 'angry', 'loss', 'failure', 'death', 'divorce', 'illness', 'accident',
    'terrible', 'awful', 'horrible', 'devastating', 'tragic', 'painful', 'difficult',
    'struggle', 'problem', 'crisis', 'disaster', 'emergency', 'surgery', 'hospital',
    'fired', 'rejected', 'disappointed', 'frustrated', 'stressed', 'worried', 'anxious',
    'depressed', 'heartbroken', 'betrayed', 'abandoned', 'lonely', 'scared', 'afraid'
  ];

  const neutralWords = [
    'meeting', 'work', 'school', 'routine', 'normal', 'regular', 'typical', 'usual',
    'moved', 'changed', 'started', 'finished', 'completed', 'attended', 'visited'
  ];

  // Count sentiment indicators
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  const neutralCount = neutralWords.filter(word => lowerText.includes(word)).length;

  // Weighted decision
  if (positiveCount > negativeCount && positiveCount > 0) return 'positive';
  if (negativeCount > positiveCount && negativeCount > 0) return 'negative';
  if (neutralCount > 0 || (positiveCount === negativeCount)) return 'neutral';

  // Default based on common patterns
  if (lowerText.includes('!') && !lowerText.includes('not') && !lowerText.includes("don't")) {
    return 'positive';
  }

  return 'neutral';
}

export async function generateArtPrompt(events: string[]): Promise<string> {
  try {
    // Analyze events to extract themes and emotions
    const eventAnalysis = analyzeEventsForArt(events);

    const prompt = `Create a detailed art prompt for abstract artwork representing a life chapter.

Events and themes:
${events.slice(0, 5).join('\n')}

Emotional tone: ${eventAnalysis.dominantSentiment}
Key themes: ${eventAnalysis.themes.join(', ')}
Life stage: ${eventAnalysis.lifeStage}

Generate a detailed art prompt:`;

    const models = [
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill'
    ];

    for (const model of models) {
      try {
        const response = await getHfClient().textGeneration({
          model,
          inputs: prompt,
          parameters: {
            max_new_tokens: 180,
            temperature: 0.9,
            do_sample: true,
            return_full_text: false,
            repetition_penalty: 1.2,
          },
        });

        let artPrompt = response.generated_text?.trim() || '';

        // Clean and enhance the prompt
        artPrompt = artPrompt
          .replace(/^(Art prompt:|Generate:|Create:)\s*/i, '')
          .replace(/^\s*[-•]\s*/, '')
          .replace(/\n+/g, ' ')
          .trim();

        if (artPrompt.length > 30 && !artPrompt.toLowerCase().includes('unable to')) {
          return enhanceArtPrompt(artPrompt, eventAnalysis);
        }
      } catch (modelError) {
        console.warn(`Art generation model ${model} failed:`, modelError);
        continue;
      }
    }

    // Fallback to sophisticated template-based generation
    return generateAdvancedArtPrompt(eventAnalysis);
  } catch (error) {
    console.error('Error generating art prompt:', error);
    return generateAdvancedArtPrompt(analyzeEventsForArt(events));
  }
}

function analyzeEventsForArt(events: string[]) {
  const sentiments = { positive: 0, negative: 0, neutral: 0 };
  const themes = new Set<string>();

  events.forEach(event => {
    const lower = event.toLowerCase();

    // Sentiment analysis
    if (lower.includes('positive') || lower.includes('happy') || lower.includes('success')) {
      sentiments.positive++;
    } else if (lower.includes('negative') || lower.includes('sad') || lower.includes('difficult')) {
      sentiments.negative++;
    } else {
      sentiments.neutral++;
    }

    // Theme extraction
    if (lower.includes('career') || lower.includes('work') || lower.includes('job')) themes.add('professional growth');
    if (lower.includes('education') || lower.includes('school') || lower.includes('learning')) themes.add('knowledge');
    if (lower.includes('travel') || lower.includes('adventure')) themes.add('exploration');
    if (lower.includes('family') || lower.includes('relationship') || lower.includes('love')) themes.add('connection');
    if (lower.includes('health') || lower.includes('fitness')) themes.add('wellness');
    if (lower.includes('creative') || lower.includes('art') || lower.includes('music')) themes.add('creativity');
  });

  const dominantSentiment = Object.entries(sentiments).reduce((a, b) =>
    sentiments[a[0] as keyof typeof sentiments] > sentiments[b[0] as keyof typeof sentiments] ? a : b
  )[0];

  return {
    dominantSentiment,
    themes: Array.from(themes),
    lifeStage: events.length > 10 ? 'mature' : events.length > 5 ? 'developing' : 'emerging',
    eventCount: events.length
  };
}

function enhanceArtPrompt(basePrompt: string, analysis: any): string {
  const styleEnhancements = {
    positive: 'with vibrant, uplifting colors and dynamic, flowing forms',
    negative: 'with deeper, contemplative tones and complex, layered textures',
    neutral: 'with balanced, harmonious colors and structured, geometric elements'
  };

  const themeEnhancements = {
    'professional growth': 'incorporating ascending lines and architectural elements',
    'knowledge': 'featuring interconnected patterns and luminous details',
    'exploration': 'with expansive compositions and horizon-like elements',
    'connection': 'including intertwining forms and warm, embracing shapes',
    'wellness': 'with organic, natural forms and healing color palettes',
    'creativity': 'featuring expressive brushstrokes and imaginative compositions'
  };

  let enhanced = basePrompt;

  // Add style based on sentiment
  if (!enhanced.includes('color')) {
    enhanced += ` ${styleEnhancements[analysis.dominantSentiment as keyof typeof styleEnhancements]}`;
  }

  // Add theme-specific elements
  analysis.themes.forEach((theme: string) => {
    if (themeEnhancements[theme as keyof typeof themeEnhancements] && !enhanced.includes(theme)) {
      enhanced += `, ${themeEnhancements[theme as keyof typeof themeEnhancements]}`;
    }
  });

  return enhanced;
}

function generateAdvancedArtPrompt(analysis: any): string {
  const baseStyles = {
    positive: 'Abstract expressionist artwork with vibrant golden yellows, warm oranges, and energetic brushstrokes',
    negative: 'Contemplative abstract piece with deep blues, muted purples, and layered, textural elements',
    neutral: 'Balanced abstract composition with earth tones, geometric forms, and harmonious color transitions'
  };

  const themeAdditions = {
    'professional growth': 'featuring ascending diagonal lines and architectural elements suggesting progress and achievement',
    'knowledge': 'with interconnected neural-like patterns and luminous points representing learning and discovery',
    'exploration': 'incorporating expansive horizons, flowing paths, and elements suggesting movement and adventure',
    'connection': 'with intertwining organic forms and warm, embracing color gradients representing relationships',
    'wellness': 'featuring natural, flowing forms and healing color palettes with organic textures',
    'creativity': 'with expressive, spontaneous brushstrokes and imaginative, dreamlike compositions'
  };

  let prompt = baseStyles[analysis.dominantSentiment as keyof typeof baseStyles];

  if (analysis.themes.length > 0) {
    const primaryTheme = analysis.themes[0];
    if (themeAdditions[primaryTheme as keyof typeof themeAdditions]) {
      prompt += `, ${themeAdditions[primaryTheme as keyof typeof themeAdditions]}`;
    }
  }

  prompt += '. The artwork should evoke personal growth, life experiences, and the passage of time through abstract visual metaphors.';

  return prompt;
}