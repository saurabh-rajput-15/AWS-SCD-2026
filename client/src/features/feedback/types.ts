export interface SessionFeedbackItem {
  sessionId: string;
  sessionTitle: string;
  speakerName?: string;
  sessionType?: string;
  timeSlot?: string;
  tagsPool: string[];
  attended: boolean;
  rating: number; // 0 to 5
  tags: string[];
  comment?: string;
}

export interface MealFeedbackItem {
  mealType: 'breakfast' | 'lunch' | 'snacks';
  mealTitle: string;
  mealTiming?: string;
  menuDescription: string;
  attended: boolean;
  tasteRating: number;      // 1 to 5
  freshnessRating: number;  // 1 to 5
  serviceRating: number;    // 1 to 5
  tags: string[];
  comment?: string;
  suggestedTags: string[];
}

export interface FoodFeedbackData {
  breakfast: MealFeedbackItem;
  lunch: MealFeedbackItem;
  snacks: MealFeedbackItem;
  overallCanteenRating: number;
  canteenSuggestion: string;
}

export interface FeedbackFormData {
  // Step 1: Attendee & General
  attendeeName: string;
  email: string;
  isAnonymous: boolean;
  overallRating: number;
  venueRating: number;
  organizationRating: number;
  generalImpressions?: string[];

  // Step 2 & 3: Sessions
  morningSessions: SessionFeedbackItem[];
  afternoonSessions: SessionFeedbackItem[];

  // Step 4: Food & Canteen
  foodFeedback: FoodFeedbackData;

  // Step 5: Final Thoughts
  npsScore: number;
  favoriteHighlight: string;
  suggestionsNextYear: string;
}
