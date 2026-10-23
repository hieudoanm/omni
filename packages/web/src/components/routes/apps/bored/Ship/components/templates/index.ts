import type { FC } from 'react';

// Business & Health
import { DealBadge } from './business-health/ecommerce/DealBadge';
import { NewArrival } from './business-health/ecommerce/NewArrival';
import { ProductShowcase } from './business-health/ecommerce/ProductShowcase';
import { ProductSpecs } from './business-health/ecommerce/ProductSpecs';
import { Unboxing } from './business-health/ecommerce/Unboxing';

import { BillReminder } from './business-health/finance/BillReminder';
import { InvoiceCard } from './business-health/finance/InvoiceCard';
import { BudgetTracker } from './business-health/finance/BudgetTracker';
import { ExpenseLog } from './business-health/finance/ExpenseLog';
import { FinancialPlan } from './business-health/finance/FinancialPlan';
import { InvestmentTip } from './business-health/finance/InvestmentTip';
import { BillSplit } from './business-health/finance/BillSplit';
import { SavingsGoal } from './business-health/finance/SavingsGoal';

import { FoodReview } from './business-health/food/FoodReview';
import { MealPlan } from './business-health/food/MealPlan';
import { IngredientSpotlight } from './business-health/food/IngredientSpotlight';
import { MenuHighlights } from './business-health/food/MenuHighlights';
import { NutritionFacts } from './business-health/food/NutritionFacts';
import { RecipeCard } from './business-health/food/RecipeCard';
import { MeditationGuide } from './business-health/health/MeditationGuide';
import { MoodTracker } from './business-health/health/MoodTracker';
import { SleepTips } from './business-health/health/SleepTips';
import { WaterTracker } from './business-health/health/WaterTracker';
import { WellnessTip } from './business-health/health/WellnessTip';
import { WorkoutCard } from './business-health/health/WorkoutCard';
import { Announcement } from './business-health/marketing/Announcement';
import { FAQ } from './business-health/marketing/FAQ';
import { Glossary } from './business-health/marketing/Glossary';
import { OfferBanner } from './business-health/marketing/OfferBanner';
import { PricingCard } from './business-health/marketing/PricingCard';
import { ValueProp } from './business-health/marketing/ValueProp';

// Content & Design
import { AreaChart } from './content-design/charts/AreaChart';
import { BarChart } from './content-design/charts/BarChart';
import { PieChart } from './content-design/charts/PieChart';
import { ProgressRing } from './content-design/charts/ProgressRing';
import { RadarChart } from './content-design/charts/RadarChart';
import { ScatterChart } from './content-design/charts/ScatterChart';
import { Comparison } from './content-design/compare/Comparison';
import { MythVsFact } from './content-design/compare/MythVsFact';
import { ProsCons } from './content-design/compare/ProsCons';
import { RatingScale } from './content-design/compare/RatingScale';
import { SplitScreen } from './content-design/compare/SplitScreen';
import { Versus } from './content-design/compare/Versus';
import { DataStats } from './content-design/data/DataStats';
import { DonutChart } from './content-design/data/DonutChart';
import { FeatureGrid } from './content-design/data/FeatureGrid';
import { ProgressList } from './content-design/data/ProgressList';
import { Sparkline } from './content-design/data/Sparkline';
import { StatRow } from './content-design/data/StatRow';
import { StatusGrid } from './content-design/data/StatusGrid';
import { Timeline } from './content-design/data/Timeline';
import { BulletList } from './visual-layout/list/BulletList';
import { Checklist } from './visual-layout/list/Checklist';
import { ColorPalette } from './visual-layout/list/ColorPalette';
import { Listicle } from './visual-layout/list/Listicle';
import { StepByStep } from './visual-layout/list/StepByStep';
import { StepsHorizontal } from './visual-layout/list/StepsHorizontal';
import { Certifications } from './visual-layout/profile/Certifications';
import { Education } from './visual-layout/profile/Education';
import { ProfileHeader } from './visual-layout/profile/ProfileHeader';
import { Projects as ProfileProjects } from './visual-layout/profile/Projects';
import { Skills } from './visual-layout/profile/Skills';
import { WorkExperience } from './visual-layout/profile/WorkExperience';
import { Haiku } from './visual-layout/text/Haiku';
import { Minimal } from './visual-layout/text/Minimal';
import { PullQuote } from './visual-layout/text/PullQuote';
import { Takeaway } from './visual-layout/text/Takeaway';
import { TipCard } from './visual-layout/text/TipCard';
import { GradientText } from './content-design/typography/GradientText';
import { HighlightedTitle } from './content-design/typography/HighlightedTitle';
import { IconText } from './content-design/typography/IconText';
import { Strikethrough } from './content-design/typography/Strikethrough';
import { TriWord } from './content-design/typography/TriWord';
import { WordStack } from './content-design/typography/WordStack';
import { ArchitectureDiagram } from './content-design/dev/ArchitectureDiagram';
import { ApiEndpoint } from './content-design/dev/ApiEndpoint';
import { Changelog } from './content-design/dev/Changelog';
import { DatabaseSchema } from './content-design/dev/DatabaseSchema';
import { DependencyGraph } from './content-design/dev/DependencyGraph';
import { GitGraph } from './content-design/dev/GitGraph';
import { ConfusionMatrix } from './content-design/data-science/ConfusionMatrix';
import { ModelComparison } from './content-design/data-science/ModelComparison';
import { LossCurve } from './content-design/data-science/LossCurve';
import { FeatureTable } from './content-design/compare/FeatureTable';
import { DataTable } from './content-design/data/DataTable';
import { HeatmapGrid } from './content-design/data/HeatmapGrid';

// Social & Learning
import { CheatSheet } from './social-learning/education/CheatSheet';
import { References } from './social-learning/education/References';
import { BookReview } from './social-learning/education/BookReview';
import { CourseHighlight } from './social-learning/education/CourseHighlight';
import { MindMap } from './social-learning/education/MindMap';
import { LearningPath } from './social-learning/education/LearningPath';
import { QuickQuiz } from './social-learning/education/QuickQuiz';
import { StudyTips } from './social-learning/education/StudyTips';
import { SubjectSummary } from './social-learning/education/SubjectSummary';
import { Iceberg } from './social-learning/hierarchy/Iceberg';
import { Ladder } from './social-learning/hierarchy/Ladder';
import { OnionDiagram } from './social-learning/hierarchy/OnionDiagram';
import { Pyramid } from './social-learning/hierarchy/Pyramid';
import { TierList } from './social-learning/hierarchy/TierList';
import { Leaderboard } from './social-learning/hierarchy/Leaderboard';
import { Affirmation } from './social-learning/inspirational/Affirmation';
import { BeliefCard } from './social-learning/inspirational/BeliefCard';
import { MissionStatement } from './social-learning/inspirational/MissionStatement';
import { VisionBoard } from './social-learning/inspirational/VisionBoard';
import { Abbreviation } from './social-learning/interactive/Abbreviation';
import { ChallengeCard } from './social-learning/interactive/ChallengeCard';
import { Chat } from './social-learning/interactive/Chat';
import { FillBlank } from './social-learning/interactive/FillBlank';
import { PollVote } from './social-learning/interactive/PollVote';
import { QandA } from './social-learning/interactive/QandA';
import { ThisOrThat } from './social-learning/interactive/ThisOrThat';
import { Discussion } from './social-learning/research/Discussion';
import { IntroLiterature } from './social-learning/research/IntroLiterature';
import { Limitations } from './social-learning/research/Limitations';
import { Methods } from './social-learning/research/Methods';
import { Participants } from './social-learning/research/Participants';
import { HypothesisCard } from './social-learning/research/HypothesisCard';
import { Results } from './social-learning/research/Results';
import { EventCard } from './visual-layout/social/EventCard';
import { Mention } from './visual-layout/social/Mention';
import { ProfileCard } from './visual-layout/social/ProfileCard';
import { ShareCTA } from './visual-layout/social/ShareCTA';
import { TeamRoster } from './visual-layout/social/TeamRoster';
import { Testimonial } from './visual-layout/social/Testimonial';
import { BreakingNews } from './social-learning/news/BreakingNews';
import { BreakdownCard } from './social-learning/news/BreakdownCard';
import { DailyDigest } from './social-learning/news/DailyDigest';
import { FactCheck } from './social-learning/news/FactCheck';
import { TrendingTopic } from './social-learning/news/TrendingTopic';

// Lifestyle & Tech
import { Deadline } from './lifestyle-tech/countdown/Deadline';
import { EventTimer } from './lifestyle-tech/countdown/EventTimer';
import { GoalTracker } from './lifestyle-tech/countdown/GoalTracker';
import { LaunchCountdown } from './lifestyle-tech/countdown/LaunchCountdown';
import { Milestone } from './lifestyle-tech/countdown/Milestone';
import { SpeedRun } from './lifestyle-tech/countdown/SpeedRun';
import { StreakCounter } from './lifestyle-tech/countdown/StreakCounter';
import { Browser } from './lifestyle-tech/device/Browser';
import { Code } from './lifestyle-tech/device/Code';
import { FileTree } from './lifestyle-tech/device/FileTree';
import { Mobile } from './lifestyle-tech/device/Mobile';
import { SmartWatch } from './lifestyle-tech/device/SmartWatch';
import { Terminal } from './lifestyle-tech/device/Terminal';
import { Notification } from './lifestyle-tech/device/Notification';
import { CardOverlay } from './lifestyle-tech/media/CardOverlay';
import { CinemaBanner } from './lifestyle-tech/media/CinemaBanner';
import { Collage } from './lifestyle-tech/media/Collage';
import { FullBleed } from './lifestyle-tech/media/FullBleed';
import { Mosaic } from './lifestyle-tech/media/Mosaic';
import { PodcastEpisode } from './lifestyle-tech/media/PodcastEpisode';
import { AspectRatio } from './lifestyle-tech/media/AspectRatio';
import { VideoStill } from './lifestyle-tech/media/VideoStill';
import { HeadToHead } from './lifestyle-tech/sports/HeadToHead';
import { PlayerStats } from './lifestyle-tech/sports/PlayerStats';
import { LeagueTable } from './lifestyle-tech/sports/LeagueTable';
import { MatchSchedule } from './lifestyle-tech/sports/MatchSchedule';
import { Scorecard } from './lifestyle-tech/sports/Scorecard';
import { SeasonStats } from './lifestyle-tech/sports/SeasonStats';
import { TournamentBracket } from './lifestyle-tech/sports/TournamentBracket';
import { FormationCard } from './lifestyle-tech/football/FormationCard';
import { TransferCard } from './lifestyle-tech/football/TransferCard';
import { BucketList } from './lifestyle-tech/travel/BucketList';
import { DestinationGuide } from './lifestyle-tech/travel/DestinationGuide';
import { ItineraryDay } from './lifestyle-tech/travel/ItineraryDay';
import { LandmarkSpotlight } from './lifestyle-tech/travel/LandmarkSpotlight';
import { PackingChecklist } from './lifestyle-tech/travel/PackingChecklist';
import { PackingList } from './lifestyle-tech/travel/PackingList';
import { TravelTip } from './lifestyle-tech/travel/TravelTip';
import { ClimateCompare } from './visual-layout/weather/ClimateCompare';
import { Forecast } from './visual-layout/weather/Forecast';
import { Season } from './visual-layout/weather/Season';
import { SunriseSunset } from './visual-layout/weather/SunriseSunset';
import { UVIndex } from './visual-layout/weather/UVIndex';
import { WeeklyOutlook } from './visual-layout/weather/WeeklyOutlook';

// Photography (visual-layout/photography/)
import { CameraSettings } from './visual-layout/photography/CameraSettings';
import { PhotoEditing } from './visual-layout/photography/PhotoEditing';
import { Composition } from './visual-layout/photography/Composition';
import { LightingTips } from './visual-layout/photography/LightingTips';
import { LensGuide } from './visual-layout/photography/LensGuide';
import { MoodBoard } from './visual-layout/photography/MoodBoard';

// Creative Expression (creative-expression/)
import { ColorWheel } from './creative-expression/art/ColorWheel';
import { TechniqueTutorial } from './creative-expression/art/TechniqueTutorial';
import { StyleGuide } from './creative-expression/art/StyleGuide';
import { ArtHistory } from './creative-expression/art/ArtHistory';
import { AnatomyStudy } from './creative-expression/art/AnatomyStudy';
import { PaletteInspiration } from './creative-expression/art/PaletteInspiration';

import { GameReview } from './creative-expression/gaming/GameReview';
import { AchievementUnlocked } from './creative-expression/gaming/AchievementUnlocked';
import { SetupTour } from './creative-expression/gaming/SetupTour';
import { SettingsGuide } from './creative-expression/gaming/SettingsGuide';
import { StatTracker } from './creative-expression/gaming/StatTracker';
import { Tournament } from './creative-expression/gaming/Tournament';

import { AlbumReview } from './creative-expression/music/AlbumReview';
import { Playlist } from './creative-expression/music/Playlist';
import { ChordChart } from './creative-expression/music/ChordChart';
import { GearReview } from './creative-expression/music/GearReview';
import { Setlist } from './creative-expression/music/Setlist';
import { MusicTheory } from './creative-expression/music/MusicTheory';

import { WritingPrompt } from './creative-expression/writing/WritingPrompt';
import { StoryStructure } from './creative-expression/writing/StoryStructure';
import { CharacterSheet } from './creative-expression/writing/CharacterSheet';
import { WorldBuilding } from './creative-expression/writing/WorldBuilding';
import { EditingChecklist } from './creative-expression/writing/EditingChecklist';
import { GenreGuide } from './creative-expression/writing/GenreGuide';

import { ResumeTip } from './creative-expression/career/ResumeTip';
import { InterviewPrep } from './creative-expression/career/InterviewPrep';
import { SkillRoadmap } from './creative-expression/career/SkillRoadmap';
import { SalaryGuide } from './creative-expression/career/SalaryGuide';
import { NetworkingTip } from './creative-expression/career/NetworkingTip';
import { CoverLetter } from './creative-expression/career/CoverLetter';

import { FamousQuote } from './creative-expression/quotes/FamousQuote';
import { DailyWisdom } from './creative-expression/quotes/DailyWisdom';
import { BookQuote } from './creative-expression/quotes/BookQuote';
import { MovieQuote } from './creative-expression/quotes/MovieQuote';
import { SongLyric } from './creative-expression/quotes/SongLyric';
import { MotivationalQuote } from './creative-expression/quotes/MotivationalQuote';

import type { TemplateProps } from './common';

export const TEMPLATE_MAP: Record<string, FC<TemplateProps>> = {
  minimal: Minimal,
  'pull-quote': PullQuote,
  haiku: Haiku,
  takeaway: Takeaway,
  'tip-card': TipCard,
  'split-screen': SplitScreen,
  comparison: Comparison,
  'myth-vs-fact': MythVsFact,
  proscons: ProsCons,
  versus: Versus,
  'rating-scale': RatingScale,
  'card-overlay': CardOverlay,
  'full-bleed': FullBleed,
  mosaic: Mosaic,
  'video-still': VideoStill,
  'cinema-banner': CinemaBanner,
  collage: Collage,
  timeline: Timeline,
  'data-stats': DataStats,
  'donut-chart': DonutChart,
  'feature-grid': FeatureGrid,
  'stat-row': StatRow,
  'status-grid': StatusGrid,
  sparkline: Sparkline,
  'progress-list': ProgressList,
  listicle: Listicle,
  checklist: Checklist,
  'step-by-step': StepByStep,
  'steps-horizontal': StepsHorizontal,
  'color-palette': ColorPalette,
  'bullet-list': BulletList,
  announcement: Announcement,
  faq: FAQ,
  glossary: Glossary,
  'pricing-card': PricingCard,
  'offer-banner': OfferBanner,
  'value-prop': ValueProp,
  'profile-card': ProfileCard,
  testimonial: Testimonial,
  'event-card': EventCard,
  'share-cta': ShareCTA,
  mention: Mention,
  affirmation: Affirmation,
  'vision-board': VisionBoard,
  'mission-statement': MissionStatement,
  'belief-card': BeliefCard,
  abbreviation: Abbreviation,
  chat: Chat,
  'poll-vote': PollVote,
  'this-or-that': ThisOrThat,
  'challenge-card': ChallengeCard,
  'fill-blank': FillBlank,
  'q-and-a': QandA,
  'study-tips': StudyTips,
  'subject-summary': SubjectSummary,
  'learning-path': LearningPath,
  'mind-map': MindMap,
  'quick-quiz': QuickQuiz,
  'course-highlight': CourseHighlight,
  'cheat-sheet': CheatSheet,
  'launch-countdown': LaunchCountdown,
  'event-timer': EventTimer,
  deadline: Deadline,
  milestone: Milestone,
  'goal-tracker': GoalTracker,
  'speed-run': SpeedRun,
  'streak-counter': StreakCounter,
  'product-showcase': ProductShowcase,
  'new-arrival': NewArrival,
  unboxing: Unboxing,
  'budget-tracker': BudgetTracker,
  'savings-goal': SavingsGoal,
  'expense-log': ExpenseLog,
  'investment-tip': InvestmentTip,
  'financial-plan': FinancialPlan,
  'bill-split': BillSplit,
  'bill-reminder': BillReminder,
  'invoice-card': InvoiceCard,
  'meal-plan': MealPlan,
  'recipe-card': RecipeCard,
  'menu-highlights': MenuHighlights,
  'nutrition-facts': NutritionFacts,
  'ingredient-spotlight': IngredientSpotlight,
  'food-review': FoodReview,
  'meditation-guide': MeditationGuide,
  'workout-card': WorkoutCard,
  'water-tracker': WaterTracker,
  'sleep-tips': SleepTips,
  'mood-tracker': MoodTracker,
  'wellness-tip': WellnessTip,
  'destination-guide': DestinationGuide,
  'packing-checklist': PackingChecklist,
  'packing-list': PackingList,
  'bucket-list': BucketList,
  'travel-tip': TravelTip,
  'landmark-spotlight': LandmarkSpotlight,
  'profile-header': ProfileHeader,
  'work-experience': WorkExperience,
  education: Education,
  skills: Skills,
  'profile-projects': ProfileProjects,
  certifications: Certifications,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  'scatter-chart': ScatterChart,
  'area-chart': AreaChart,
  'radar-chart': RadarChart,
  'tier-list': TierList,
  iceberg: Iceberg,
  pyramid: Pyramid,
  ladder: Ladder,
  'onion-diagram': OnionDiagram,
  'player-stats': PlayerStats,
  scorecard: Scorecard,
  'league-table': LeagueTable,
  'head-to-head': HeadToHead,
  'tournament-bracket': TournamentBracket,
  'match-schedule': MatchSchedule,
  'season-stats': SeasonStats,
  'formation-card': FormationCard,
  'transfer-card': TransferCard,
  'highlighted-title': HighlightedTitle,
  'gradient-text': GradientText,
  'word-stack': WordStack,
  'icon-text': IconText,
  'tri-word': TriWord,
  strikethrough: Strikethrough,
  'architecture-diagram': ArchitectureDiagram,
  'api-endpoint': ApiEndpoint,
  'git-graph': GitGraph,
  'confusion-matrix': ConfusionMatrix,
  'model-comparison': ModelComparison,
  'loss-curve': LossCurve,
  mobile: Mobile,
  desktop: FileTree,
  'smart-watch': SmartWatch,
  notification: Notification,
  terminal: Terminal,
  browser: Browser,
  laptop: Code,
  'intro-literature': IntroLiterature,
  participants: Participants,
  methods: Methods,
  results: Results,
  discussion: Discussion,
  limitations: Limitations,
  'hypothesis-card': HypothesisCard,
  'breaking-news': BreakingNews,
  'daily-digest': DailyDigest,
  'fact-check': FactCheck,
  'breakdown-card': BreakdownCard,
  'trending-topic': TrendingTopic,
  forecast: Forecast,
  'weekly-outlook': WeeklyOutlook,
  season: Season,
  'climate-compare': ClimateCompare,
  'uv-index': UVIndex,
  'sunrise-sunset': SunriseSunset,
  'progress-ring': ProgressRing,
  'feature-table': FeatureTable,
  'heatmap-grid': HeatmapGrid,
  'data-table': DataTable,
  references: References,
  'book-review': BookReview,
  'team-roster': TeamRoster,
  leaderboard: Leaderboard,
  'product-specs': ProductSpecs,
  'deal-badge': DealBadge,
  'itinerary-day': ItineraryDay,
  'aspect-ratio': AspectRatio,
  'podcast-episode': PodcastEpisode,
  changelog: Changelog,
  'dependency-graph': DependencyGraph,
  'database-schema': DatabaseSchema,
  // Photography
  'camera-settings': CameraSettings,
  'photo-editing': PhotoEditing,
  composition: Composition,
  'lighting-tips': LightingTips,
  'lens-guide': LensGuide,
  'mood-board': MoodBoard,
  // Art
  'color-wheel': ColorWheel,
  'technique-tutorial': TechniqueTutorial,
  'style-guide': StyleGuide,
  'art-history': ArtHistory,
  'anatomy-study': AnatomyStudy,
  'palette-inspiration': PaletteInspiration,
  // Gaming
  'game-review': GameReview,
  'achievement-unlocked': AchievementUnlocked,
  'setup-tour': SetupTour,
  'settings-guide': SettingsGuide,
  'stat-tracker': StatTracker,
  tournament: Tournament,
  // Music
  'album-review': AlbumReview,
  playlist: Playlist,
  'chord-chart': ChordChart,
  'gear-review': GearReview,
  setlist: Setlist,
  'music-theory': MusicTheory,
  // Writing
  'writing-prompt': WritingPrompt,
  'story-structure': StoryStructure,
  'character-sheet': CharacterSheet,
  'world-building': WorldBuilding,
  'editing-checklist': EditingChecklist,
  'genre-guide': GenreGuide,
  // Career
  'resume-tip': ResumeTip,
  'interview-prep': InterviewPrep,
  'skill-roadmap': SkillRoadmap,
  'salary-guide': SalaryGuide,
  'networking-tip': NetworkingTip,
  'cover-letter': CoverLetter,
  // Quotes
  'famous-quote': FamousQuote,
  'daily-wisdom': DailyWisdom,
  'book-quote': BookQuote,
  'movie-quote': MovieQuote,
  'song-lyric': SongLyric,
  'motivational-quote': MotivationalQuote,
};
