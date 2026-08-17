import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { FeedbackFormData, SessionFeedbackItem, FoodFeedbackData } from '../types';
import { FeedbackStepGeneral } from '../components/FeedbackStepGeneral';
import { FeedbackStepSessions } from '../components/FeedbackStepSessions';
import { FeedbackStepFood } from '../components/FeedbackStepFood';
import { FeedbackStepFinal } from '../components/FeedbackStepFinal';
import { FeedbackSuccess } from '../components/FeedbackSuccess';
import { ArrowLeft, ArrowRight, Check, Sparkles, Utensils, MessageSquare, Mic, User, AlertTriangle } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'aws_scd_feedback_draft_v5';

const INITIAL_MORNING_SESSIONS: SessionFeedbackItem[] = [
  {
    sessionId: 'session_opening',
    sessionTitle: 'Opening Ceremony & Welcome Note',
    speakerName: 'AWS Student Builder Group Dhule',
    sessionType: 'Inauguration',
    tagsPool: ['🎉 Great Energy', '🤝 Warm Welcome', '⚡ Well Coordinated', '📌 Informative'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_comm_keynote',
    sessionTitle: 'Community Keynote: Growth, Opportunities & Certifications',
    speakerName: 'AWS Community Leaders',
    sessionType: 'Community Keynote',
    tagsPool: ['🚀 Inspiring', '💡 Career Guidance', '📚 Great Cert Tips', '🔥 High Energy'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_tech_keynote',
    sessionTitle: 'Technical Keynote: Building Modern Applications on AWS',
    speakerName: 'Pushkar Thakur (SDE II @ Procedure)',
    sessionType: 'Technical Keynote',
    tagsPool: ['💡 Deep Architecture', '💻 Hands-on Insights', '⚡ Excellent Delivery', '🔥 Highly Relevant'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_tech_1',
    sessionTitle: 'Tech Session 1: AWS Compute Services (EC2, Lambda, ECS, EKS)',
    speakerName: 'Vipul Chaudhary (SRE @ Intangles)',
    sessionType: 'Deep Dive',
    tagsPool: ['⚙️ Clear Compute Concepts', '🧩 Great Container Tips', '💡 Real-world Examples', '👌 Well Paced'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_tech_2',
    sessionTitle: 'Tech Session 2: AWS Storage & Databases Deep Dive',
    speakerName: 'Ameya Vaidya (Cloud Architect & AWS Community Builder)',
    sessionType: 'Deep Dive',
    tagsPool: ['🗄️ Great S3 & DynamoDB Tips', '📈 Scaling Advice', '💡 Clear Explanation', '🔥 Highly Engaging'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  }
];

const INITIAL_AFTERNOON_SESSIONS: SessionFeedbackItem[] = [
  {
    sessionId: 'session_tech_3',
    sessionTitle: 'Tech Session 3: DevOps on AWS (CI/CD, IaC, Automation)',
    speakerName: 'Nilesh Vaghela (AWS Community Hero | CEO, ElectroMech & CloudKida)',
    sessionType: 'Deep Dive',
    tagsPool: ['🛠️ Super Practical', '🚀 Inspiring Hero', '💡 Great CI/CD Advice', '🔥 Outstanding'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_tech_4',
    sessionTitle: 'Tech Session 4: Generative AI with AWS (Amazon Bedrock & Amazon Q)',
    speakerName: 'Abhijeet Chinchole (CTO, Cloudlytics)',
    sessionType: 'AI Deep Dive',
    tagsPool: ['🤖 Mindblowing GenAI', '💡 Practical Bedrock Demos', '⚡ Cutting-Edge', '🔥 Best Session'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_tech_5',
    sessionTitle: 'Tech Session 5: Cloud Security on AWS (IAM, WAF, GuardDuty)',
    speakerName: 'Abhishek Maurya (Sr. Cloud Engineer)',
    sessionType: 'Security Deep Dive',
    tagsPool: ['🔒 Essential Security Rules', '🛡️ Clear IAM Tips', '💡 Great Best Practices', '👌 Crisp & Clear'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_panel',
    sessionTitle: 'Women in Tech & Cloud Career Panel Discussion',
    speakerName: 'Afreen Bano, Anjali Mishra, Sanika Kotgire, Dimple Vaghela',
    sessionType: 'Panel Discussion',
    tagsPool: ['🌟 Inspiring Journeys', '💪 Empowering', '💼 Real Career Wisdom', '🔥 Outstanding Panel'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_kahoot_quiz',
    sessionTitle: 'Live Kahoot Cloud Quiz & Fun Giveaways',
    speakerName: 'AWS SBG Organizing Team',
    sessionType: 'Interactive Quiz',
    tagsPool: ['🏆 Super Fun', '🎁 Loved the Swags', '⚡ Fast & Competitive', '👏 Great Energy'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  },
  {
    sessionId: 'session_closing',
    sessionTitle: 'Concluding Ceremony, Sponsor Awards & Vote of Thanks',
    speakerName: 'AWS Student Builder Group Dhule',
    sessionType: 'Chequered Flag',
    tagsPool: ['❤️ Heartwarming', '📸 Great Group Photo', '🤝 Looking forward to 2027', '👏 Great Team'],
    attended: true,
    rating: 0,
    tags: [],
    comment: ''
  }
];

const INITIAL_FOOD_DATA: FoodFeedbackData = {
  breakfast: {
    mealType: 'breakfast',
    mealTitle: 'Breakfast & Morning Refreshments',
    menuDescription: 'Poha, Upma, Tea, Coffee & Morning Refreshments',
    attended: true,
    tasteRating: 0,
    freshnessRating: 0,
    serviceRating: 0,
    tags: [],
    comment: '',
    suggestedTags: [
      '🔥 Hot & Fresh',
      '😋 Delicious Poha/Upma',
      '☕ Good Tea/Coffee',
      '❄️ Was Luke-warm',
      '⏳ Long Queue',
      '🥣 Wanted More Options',
      '🧼 Clean & Hygienic'
    ]
  },
  lunch: {
    mealType: 'lunch',
    mealTitle: 'Grand Lunch Buffet',
    menuDescription: 'Full Course Lunch Meal: Paneer sabji, Dal, Hot Rotis, Jeera Rice, Salad, Sweet & Accompaniments',
    attended: true,
    tasteRating: 0,
    freshnessRating: 0,
    serviceRating: 0,
    tags: [],
    comment: '',
    suggestedTags: [
      '🍲 Tasty Paneer/Dal',
      '🥞 Hot Rotis',
      '🍨 Loved the Sweets',
      '👍 Good Portions',
      '⏳ Slow Buffet Queue',
      '🌶️ Little Too Spicy',
      '🧂 Need Better Spicing',
      '🚰 Water Dispenser Refill Needed'
    ]
  },
  snacks: {
    mealType: 'snacks',
    mealTitle: 'Evening High-Tea & Snacks',
    menuDescription: 'Crispy Evening Snacks, Hot Masala Chai & Coffee',
    attended: true,
    tasteRating: 0,
    freshnessRating: 0,
    serviceRating: 0,
    tags: [],
    comment: '',
    suggestedTags: [
      '☕ Great Masala Chai',
      '🍪 Crispy Snacks',
      '⚡ Good Energy Boost',
      '❌ Snacks Ran Out Early',
      '🥛 Need Stronger Coffee',
      '👌 Quick Service'
    ]
  },
  overallCanteenRating: 0,
  canteenSuggestion: ''
};

const INITIAL_FORM_DATA: FeedbackFormData = {
  attendeeName: '',
  email: '',
  isAnonymous: false,
  overallRating: 0,
  venueRating: 0,
  organizationRating: 0,
  generalImpressions: [],
  morningSessions: INITIAL_MORNING_SESSIONS,
  afternoonSessions: INITIAL_AFTERNOON_SESSIONS,
  foodFeedback: INITIAL_FOOD_DATA,
  npsScore: 10,
  favoriteHighlight: '',
  suggestionsNextYear: ''
};

const STEPS = [
  { id: 1, title: 'Overview', icon: User, desc: 'Attendee & General Experience' },
  { id: 2, title: 'Morning', icon: Mic, desc: 'Keynotes & Tech Sessions 1-2' },
  { id: 3, title: 'Afternoon', icon: Sparkles, desc: 'Tech Sessions 3-5 & Panel' },
  { id: 4, title: 'Food & Canteen', icon: Utensils, desc: 'Breakfast, Lunch & Snacks' },
  { id: 5, title: 'Final Lap', icon: MessageSquare, desc: 'NPS & Future Suggestions' },
];

export const FeedbackPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FeedbackFormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_FORM_DATA;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-save draft on form change
  useEffect(() => {
    if (!isSubmitted) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch {
        // ignore
      }
    }
  }, [formData, isSubmitted]);

  // Scroll to top on step switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateFormData = (updates: Partial<FeedbackFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.overallRating || formData.overallRating === 0) {
        setErrorMessage('Please provide an overall event rating before continuing.');
        return;
      }
    }
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        attendeeName: formData.isAnonymous ? 'Anonymous Attendee' : (formData.attendeeName || 'Anonymous Attendee'),
        email: formData.isAnonymous ? '' : (formData.email || ''),
        isAnonymous: formData.isAnonymous,
        overallRating: formData.overallRating || 5,
        venueRating: formData.venueRating || 5,
        organizationRating: formData.organizationRating || 5,
        generalImpressions: formData.generalImpressions || [],
        morningSessions: formData.morningSessions,
        afternoonSessions: formData.afternoonSessions,
        foodFeedback: formData.foodFeedback,
        npsScore: formData.npsScore,
        favoriteHighlight: formData.favoriteHighlight,
        suggestionsNextYear: formData.suggestionsNextYear,
        submittedAt: new Date().toISOString()
      };

      await api.post('/api/feedback', payload);

      // Clear draft storage on success
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[Feedback Submit Error]', err);
      // Fallback: even if network has issue, acknowledge local success so user is not stuck
      const msg = err.response?.data?.message || err.message || 'Unable to submit feedback. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setFormData(INITIAL_FORM_DATA);
    setIsSubmitted(false);
    setCurrentStep(1);
  };

  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative flex flex-col">
      {/* Background Lighting / Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-b from-[#FF9900]/10 via-[#E10600]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-white/5 py-3.5 px-4 sm:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">Back to Home</span>
          <span className="font-mono text-xs uppercase tracking-widest sm:hidden">Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-sans font-black italic text-lg sm:text-xl uppercase tracking-tighter">
            AWS SCD <span className="text-aws-orange">DHULE</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-aws-orange/10 border border-aws-orange/30 text-aws-orange font-mono text-[9px] uppercase font-bold tracking-widest">
            FEEDBACK
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto w-full relative z-10">
        {!isSubmitted ? (
          <>
            {/* Page Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="font-mono text-[11px] text-aws-orange uppercase tracking-[0.25em] mb-2 font-bold flex items-center justify-center gap-2">
                <Sparkles size={14} />
                Official Event Feedback & Canteen Audit
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight text-white mb-3">
                Rate Your <span className="text-aws-orange">SCD Experience</span>
              </h1>
              <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto">
                Quick, page-wise evaluation for all tech sessions and food catering (Breakfast, Lunch & Snacks).
              </p>
            </div>

            {/* Multi-Step Wizard Progress Bar */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl">
              {/* Steps Indicator */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-4">
                {STEPS.map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  const Icon = step.icon;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition-all duration-200 cursor-pointer text-center relative min-w-0 ${
                        isCurrent
                          ? 'bg-aws-orange/15 border border-aws-orange/50 text-aws-orange shadow-[0_0_12px_rgba(255,153,0,0.2)]'
                          : isCompleted
                          ? 'bg-white/[0.02] text-emerald-400 hover:bg-white/[0.05]'
                          : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check size={12} className="text-emerald-400 stroke-[3]" />
                          </div>
                        ) : (
                          <Icon size={16} className={isCurrent ? 'text-aws-orange' : 'text-current'} />
                        )}
                      </div>
                      <span className="font-sans font-black italic text-[9px] sm:text-xs uppercase tracking-tight truncate max-w-full leading-tight">
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-[#171717] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-aws-orange to-[#E10600] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 font-mono text-[10px] text-white/40 gap-2">
                <span className="truncate">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].desc}</span>
                <span className="shrink-0">{progressPercent}% Complete</span>
              </div>
            </div>

            {/* Error Banner for Steps 1-4 if validation fails */}
            {errorMessage && currentStep < 5 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-sans animate-fadeIn">
                <AlertTriangle size={18} className="shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Active Step Content */}
            <div className="mb-8">
              {currentStep === 1 && (
                <FeedbackStepGeneral
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}

              {currentStep === 2 && (
                <FeedbackStepSessions
                  title="Morning Keynotes & Technical Deep Dives"
                  subtitle="Rate the inaugurals, keynote speakers, compute/database sessions, and morning fun quiz."
                  sessions={formData.morningSessions}
                  onChange={(sessions) => updateFormData({ morningSessions: sessions })}
                />
              )}

              {currentStep === 3 && (
                <FeedbackStepSessions
                  title="Afternoon Tech Sessions & Career Panel"
                  subtitle="Rate DevOps, GenAI Bedrock, Cloud Security, Women in Tech Panel, and the Kahoot Quiz."
                  sessions={formData.afternoonSessions}
                  onChange={(sessions) => updateFormData({ afternoonSessions: sessions })}
                />
              )}

              {currentStep === 4 && (
                <FeedbackStepFood
                  foodData={formData.foodFeedback}
                  onChange={(foodFeedback) => updateFormData({ foodFeedback })}
                />
              )}

              {currentStep === 5 && (
                <FeedbackStepFinal
                  formData={formData}
                  updateFormData={updateFormData}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                  errorMessage={errorMessage}
                />
              )}
            </div>

            {/* Global Bottom Navigation (For Steps 1 to 4) */}
            {currentStep < 5 && (
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-mono text-xs text-white/40 hidden sm:inline shrink-0">
                    Step {currentStep} of {STEPS.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2.5 bg-aws-orange hover:bg-white hover:text-black text-black font-sans font-black italic uppercase text-xs tracking-wider rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,153,0,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentStep === 4 ? 'Review & Submit' : 'Next Step'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <FeedbackSuccess
            formData={formData}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default FeedbackPage;
