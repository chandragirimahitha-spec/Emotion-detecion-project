export interface EmotionBreakdown {
  emotion: 'Bored' | 'Confident' | 'Confused' | 'Curious' | 'Frustrated';
  percentage: number;
}

export interface ModelPrediction {
  modelName: 'BiLSTM' | 'BERT' | 'Ensemble';
  primaryEmotion: 'Bored' | 'Confident' | 'Confused' | 'Curious' | 'Frustrated';
  confidence: number; // 0.0 to 1.0
  features: string[]; // BiLSTM: key sequence tokens, BERT: attention highlights, Ensemble: fusion details
}

export interface PersonalizedSupport {
  encouragement: string;
  tips: string[];
  checkpoints: string[];
  enhancedKeywords: string[];
}

export interface AnalysisResponse {
  id: string;
  text: string;
  timestamp: string;
  breakdown: EmotionBreakdown[];
  bilstm: ModelPrediction;
  bert: ModelPrediction;
  ensemble: ModelPrediction;
  support: PersonalizedSupport;
  isMocked: boolean;
}

export interface InteractionLog {
  id: string;
  timestamp: string;
  text: string;
  primaryEmotion: string;
  bilstmEmotion: string;
  bilstmConfidence: number;
  bertEmotion: string;
  bertConfidence: number;
  ensembleEmotion: string;
  ensembleConfidence: number;
  feedbackScore?: number; // 1-5 stars
  feedbackNotes?: string;
  tipsProvided: string[];
}
