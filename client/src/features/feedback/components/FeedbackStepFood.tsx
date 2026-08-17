import React from 'react';
import { StarRating } from './StarRating';
import { TagSelector } from './TagSelector';
import { FoodFeedbackData, MealFeedbackItem } from '../types';
import { Utensils, Coffee, AlertCircle, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';

interface FeedbackStepFoodProps {
  foodData: FoodFeedbackData;
  onChange: (updatedFoodData: FoodFeedbackData) => void;
}

export const FeedbackStepFood: React.FC<FeedbackStepFoodProps> = ({
  foodData,
  onChange
}) => {
  const updateMeal = (mealKey: 'breakfast' | 'lunch' | 'snacks', updates: Partial<MealFeedbackItem>) => {
    onChange({
      ...foodData,
      [mealKey]: {
        ...foodData[mealKey],
        ...updates
      }
    });
  };

  const meals: Array<{
    key: 'breakfast' | 'lunch' | 'snacks';
    title: string;
    icon: any;
    desc: string;
    data: MealFeedbackItem;
  }> = [
    {
      key: 'breakfast',
      title: 'Breakfast & Morning Refreshments',
      icon: Coffee,
      desc: 'Morning check-in breakfast (Poha, Upma, Tea, Coffee & Refreshments)',
      data: foodData.breakfast
    },
    {
      key: 'lunch',
      title: 'Grand Lunch Buffet',
      icon: Utensils,
      desc: 'Full Course Lunch Meal (Paneer sabji, Dal, Hot Rotis, Jeera Rice, Salad, Sweet & Accompaniments)',
      data: foodData.lunch
    },
    {
      key: 'snacks',
      title: 'Evening Snacks & High-Tea',
      icon: Sparkles,
      desc: 'Evening high-tea & energy break (Crispy Snacks/Cookies & Hot Masala Chai/Coffee)',
      data: foodData.snacks
    }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Prominent Canteen Notice Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-black/40 border-2 border-amber-500/40 rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                Direct Canteen & Catering Review
              </span>
            </div>
            <h3 className="font-sans font-black italic text-lg sm:text-xl uppercase text-white tracking-tight">
              Please Share 100% Honest Feedback For The Canteen
            </h3>
            <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed mt-0.5">
              This specific section will be compiled into an official quality report and handed directly to our campus canteen and catering vendor. Whether the food was fantastic or needs serious improvement, please tell us exactly how you felt so we can hold the vendors accountable!
            </p>
          </div>
        </div>
      </div>

      {/* Meal Cards */}
      <div className="flex flex-col gap-6">
        {meals.map((meal) => {
          const Icon = meal.icon;
          const isAttended = meal.data.attended;

          return (
            <div
              key={meal.key}
              className={`border rounded-xl transition-all duration-300 p-4 sm:p-6 ${
                isAttended
                  ? 'bg-[#0b0b0b] border-white/10 hover:border-amber-500/40 shadow-xl'
                  : 'bg-[#070707]/60 border-white/5 opacity-60'
              }`}
            >
              {/* Meal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-aws-orange">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-black italic text-base sm:text-lg uppercase text-white tracking-wide">
                      {meal.title}
                    </h4>
                  </div>
                </div>

                {/* Had this meal toggle */}
                <button
                  type="button"
                  onClick={() => updateMeal(meal.key, { attended: !isAttended })}
                  className={`px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isAttended
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  <CheckCircle2 size={13} className={isAttended ? 'text-emerald-400' : 'text-white/40'} />
                  <span>{isAttended ? 'Had This Meal' : 'Did Not Have'}</span>
                </button>
              </div>

              <p className="text-xs text-white/50 font-sans mb-5">
                {meal.desc}
              </p>

              {isAttended ? (
                <div className="flex flex-col gap-6">
                  {/* Rating Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#060606] border border-white/5 rounded-xl p-4 sm:p-5">
                    {/* Taste & Flavor */}
                    <div className="flex flex-col justify-between gap-2.5 min-w-0">
                      <div>
                        <span className="font-sans font-bold text-xs sm:text-sm text-white block">
                          Taste & Flavor
                        </span>
                        <span className="text-[11px] text-white/40 font-sans">
                          Spicing, cook quality & taste
                        </span>
                      </div>
                      <StarRating
                        value={meal.data.tasteRating}
                        onChange={(rating) => updateMeal(meal.key, { tasteRating: rating })}
                        size="md"
                      />
                    </div>

                    {/* Freshness & Temperature */}
                    <div className="flex flex-col justify-between gap-2.5 min-w-0">
                      <div>
                        <span className="font-sans font-bold text-xs sm:text-sm text-white block">
                          Freshness & Temperature
                        </span>
                        <span className="text-[11px] text-white/40 font-sans">
                          Hot/warm food & fresh items
                        </span>
                      </div>
                      <StarRating
                        value={meal.data.freshnessRating}
                        onChange={(rating) => updateMeal(meal.key, { freshnessRating: rating })}
                        size="md"
                      />
                    </div>

                    {/* Service & Hygiene */}
                    <div className="flex flex-col justify-between gap-2.5 min-w-0">
                      <div>
                        <span className="font-sans font-bold text-xs sm:text-sm text-white block">
                          Service & Hygiene
                        </span>
                        <span className="text-[11px] text-white/40 font-sans">
                          Cleanliness, queue & refills
                        </span>
                      </div>
                      <StarRating
                        value={meal.data.serviceRating}
                        onChange={(rating) => updateMeal(meal.key, { serviceRating: rating })}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Quick Tags Selector */}
                  {meal.data.suggestedTags && (
                    <TagSelector
                      label={`Quick Tags for ${meal.title}`}
                      options={meal.data.suggestedTags}
                      selected={meal.data.tags}
                      onChange={(tags) => updateMeal(meal.key, { tags })}
                      maxSelection={4}
                    />
                  )}

                  {/* Canteen Specific Note */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={12} className="text-aws-orange" />
                      Specific comments / feedback for the canteen on {meal.title}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The rotis were soft and curry was flavorful, but queue was slow."
                      value={meal.data.comment || ''}
                      onChange={(e) => updateMeal(meal.key, { comment: e.target.value })}
                      className="bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/60 transition-colors text-xs sm:text-sm font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-white/40 text-xs font-mono flex justify-between items-center">
                  <span>Marked as skipped or not consumed</span>
                  <button
                    type="button"
                    onClick={() => updateMeal(meal.key, { attended: true })}
                    className="text-aws-orange hover:underline cursor-pointer"
                  >
                    Click to rate this meal
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Canteen Summary Card */}
      <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-6 flex flex-col gap-5">
        <h4 className="font-sans font-black italic text-base uppercase text-white tracking-wide flex items-center gap-2 border-b border-white/5 pb-3">
          <Utensils size={18} className="text-amber-400" />
          Overall Canteen & Hospitality Verdict
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#050505] border border-white/5 rounded-lg p-4">
          <div>
            <span className="font-sans font-bold text-sm text-white block mb-0.5">
              Overall Canteen & Food Rating
            </span>
            <span className="text-xs text-white/50 font-sans">
              Combines taste, hygiene, staff courtesy, and dining atmosphere
            </span>
          </div>
          <StarRating
            value={foodData.overallCanteenRating}
            onChange={(rating) => onChange({ ...foodData, overallCanteenRating: rating })}
            size="lg"
          />
        </div>

        {/* Suggestion for canteen */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-white/70 uppercase tracking-wider">
            One Key Advice or Improvement for the Canteen Vendor
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Set up two separate counters during lunch to prevent long queues, and ensure drinking water stations are restocked faster."
            value={foodData.canteenSuggestion}
            onChange={(e) => onChange({ ...foodData, canteenSuggestion: e.target.value })}
            className="bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/60 transition-colors text-xs sm:text-sm font-sans resize-none"
          />
        </div>
      </div>
    </div>
  );
};
