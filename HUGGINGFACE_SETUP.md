# 🤖 Hugging Face Setup Guide for LifeWeeks

## **Required Setup for Optimal Experience**

### 1. **Account Creation & API Key**
```bash
# Step 1: Create Account
1. Go to https://huggingface.co/
2. Sign up with email and verify account
3. Complete profile setup

# Step 2: Generate API Token
1. Go to Settings > Access Tokens
2. Click "New token"
3. Name: "LifeWeeks-API"
4. Type: "Read" (sufficient for inference)
5. Copy the token (starts with hf_)
```

### 2. **Environment Configuration**
```env
# Add to your .env.local file
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Custom model endpoints
HUGGINGFACE_SENTIMENT_MODEL=cardiffnlp/twitter-roberta-base-sentiment-latest
HUGGINGFACE_NARRATIVE_MODEL=microsoft/DialoGPT-medium
HUGGINGFACE_ART_MODEL=runwayml/stable-diffusion-v1-5
```

### 3. **Recommended Models for LifeWeeks**

#### **Sentiment Analysis** (Primary Feature)
```typescript
// Current: cardiffnlp/twitter-roberta-base-sentiment-latest
// Alternatives:
- "nlptown/bert-base-multilingual-uncased-sentiment" // Multi-language
- "j-hartmann/emotion-english-distilroberta-base"    // Detailed emotions
- "SamLowe/roberta-base-go_emotions"                 // 28 emotions
```

#### **Text Generation** (Narrative Creation)
```typescript
// Current: microsoft/DialoGPT-medium
// Alternatives:
- "gpt2"                           // Fast, reliable
- "microsoft/DialoGPT-large"       // Better quality
- "facebook/blenderbot-400M-distill" // Conversational
- "google/flan-t5-base"            // Instruction-following
```

#### **Image Generation** (Art Creation)
```typescript
// Current: runwayml/stable-diffusion-v1-5
// Alternatives:
- "stabilityai/stable-diffusion-2-1"     // Latest version
- "CompVis/stable-diffusion-v1-4"        // Faster
- "dreamlike-art/dreamlike-diffusion-1.0" // Artistic style
```

## **Rate Limits & Performance**

### **Free Tier Limits**
```
- 1,000 requests/month per model
- Rate limit: 10 requests/minute
- Max request size: 1MB
- Response timeout: 60 seconds
```

### **Recommended Upgrade Path**
```
1. Start with Free Tier (sufficient for development)
2. Upgrade to Pro ($9/month) for production:
   - 10,000 requests/month
   - Higher rate limits
   - Priority processing
   - Better model access
```

## **Optimized AI Service Configuration**

### **Enhanced AI Service with Multiple Models**
```typescript
// src/lib/ai-enhanced.ts
export class EnhancedAIService {
  private sentimentModels = [
    'cardiffnlp/twitter-roberta-base-sentiment-latest',
    'j-hartmann/emotion-english-distilroberta-base',
    'nlptown/bert-base-multilingual-uncased-sentiment'
  ];
  
  private narrativeModels = [
    'microsoft/DialoGPT-medium',
    'gpt2',
    'google/flan-t5-base'
  ];
  
  async analyzeSentimentWithFallback(text: string) {
    for (const model of this.sentimentModels) {
      try {
        return await this.callHuggingFace(model, text);
      } catch (error) {
        console.warn(`Model ${model} failed, trying next...`);
        continue;
      }
    }
    return this.keywordFallback(text); // Local fallback
  }
}
```

## **Performance Optimization Tips**

### 1. **Caching Strategy**
```typescript
// Cache responses to avoid repeated API calls
const cache = new Map();

async function cachedSentimentAnalysis(text: string) {
  const cacheKey = `sentiment_${text.slice(0, 50)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await analyzeSentiment(text);
  cache.set(cacheKey, result);
  return result;
}
```

### 2. **Batch Processing**
```typescript
// Process multiple events at once
async function batchAnalyzeSentiments(events: string[]) {
  const promises = events.map(event => 
    analyzeSentiment(event).catch(err => ({ error: err, text: event }))
  );
  return await Promise.allSettled(promises);
}
```

### 3. **Request Optimization**
```typescript
// Optimize request payload
const optimizedRequest = {
  inputs: text.slice(0, 512), // Limit text length
  parameters: {
    max_length: 100,
    temperature: 0.7,
    do_sample: true
  },
  options: {
    wait_for_model: true,
    use_cache: true
  }
};
```

## **Error Handling & Fallbacks**

### **Robust Error Handling**
```typescript
export async function robustAICall(text: string, feature: string) {
  try {
    // Try Hugging Face API
    return await callHuggingFaceAPI(text);
  } catch (error) {
    if (error.status === 429) {
      // Rate limit hit - wait and retry
      await new Promise(resolve => setTimeout(resolve, 60000));
      return await callHuggingFaceAPI(text);
    } else if (error.status === 503) {
      // Model loading - wait and retry
      await new Promise(resolve => setTimeout(resolve, 20000));
      return await callHuggingFaceAPI(text);
    } else {
      // Use local fallback
      return localFallback(text, feature);
    }
  }
}
```

## **Testing Your Setup**

### **API Test Script**
```bash
# Test your Hugging Face setup
curl -X POST \
  "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest" \
  -H "Authorization: Bearer YOUR_HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "I love this amazing day!"}'
```

### **Expected Response**
```json
[
  {
    "label": "LABEL_2",
    "score": 0.8945
  },
  {
    "label": "LABEL_1", 
    "score": 0.0789
  },
  {
    "label": "LABEL_0",
    "score": 0.0266
  }
]
```

## **Production Recommendations**

### **For Development**
- ✅ Free tier is sufficient
- ✅ Use fallback mechanisms
- ✅ Implement caching
- ✅ Test with sample data

### **For Production**
- 🚀 Upgrade to Pro ($9/month)
- 🚀 Implement request queuing
- 🚀 Monitor usage metrics
- 🚀 Set up error alerting

### **Cost Estimation**
```
Free Tier: $0/month
- 1,000 requests/month
- Good for development & testing

Pro Tier: $9/month  
- 10,000 requests/month
- Sufficient for 100-500 active users

Enterprise: Custom pricing
- Unlimited requests
- Dedicated infrastructure
- SLA guarantees
```

## **Monitoring & Analytics**

### **Usage Tracking**
```typescript
// Track API usage
export const apiUsageTracker = {
  requests: 0,
  errors: 0,
  cacheHits: 0,
  
  logRequest(model: string, success: boolean) {
    this.requests++;
    if (!success) this.errors++;
    
    // Log to analytics service
    analytics.track('ai_api_call', {
      model,
      success,
      timestamp: new Date()
    });
  }
};
```

## **Quick Start Checklist**

- [ ] Create Hugging Face account
- [ ] Generate API token with "Read" permissions  
- [ ] Add `HUGGINGFACE_API_KEY` to `.env.local`
- [ ] Test API connection with curl command
- [ ] Run LifeWeeks application
- [ ] Test sentiment analysis on sample events
- [ ] Monitor usage in Hugging Face dashboard
- [ ] Set up error monitoring
- [ ] Consider Pro upgrade for production

**Your LifeWeeks AI features will work smoothly with this setup! 🚀**
