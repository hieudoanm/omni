import type { TemplateDef } from '../types';

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'deal-badge',
    label: 'Deal Badge',
    description: 'Discount badge with original and deal prices',
    category: 'ecommerce',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Deal title' },
      { key: 'originalPrice', type: 'string', description: 'Original price' },
      { key: 'dealPrice', type: 'string', description: 'Deal price' },
      { key: 'discount', type: 'string', description: 'Discount percentage' },
      { key: 'badge', type: 'string', description: 'Badge label' },
      { key: 'cta', type: 'string', description: 'Call to action' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Flash Sale',
      originalPrice: '$299',
      dealPrice: '$149',
      discount: '50% OFF',
      badge: 'LIMITED',
      cta: 'Shop Now',
      citation: '',
    },
  },

  {
    id: 'invoice-card',
    label: 'Invoice Card',
    description: 'Invoice summary with line items and total',
    category: 'ecommerce',
    group: 'Business & Health',
    schema: [
      { key: 'invoiceNumber', type: 'string', description: 'Invoice ID' },
      { key: 'client', type: 'string', description: 'Client name' },
      { key: 'amount', type: 'string', description: 'Total amount' },
      { key: 'dueDate', type: 'string', description: 'Due date' },
      {
        key: 'items',
        type: 'array',
        description: 'Array of {desc, amount} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      invoiceNumber: 'INV-2025-001',
      client: 'Acme Corp',
      amount: '$4,500',
      dueDate: 'Apr 30, 2025',
      items: [
        {
          desc: 'UI Design',
          amount: '$2,500',
        },
        {
          desc: 'Development',
          amount: '$2,000',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'new-arrival',
    label: 'New Arrival',
    description: 'Product card with badge, image, name, and price',
    category: 'ecommerce',
    group: 'Business & Health',
    schema: [
      { key: 'badge', type: 'string', description: 'Badge label' },
      { key: 'name', type: 'string', description: 'Product name' },
      { key: 'price', type: 'string', description: 'Current price' },
      {
        key: 'oldPrice',
        type: 'string',
        description: 'Original price (optional)',
      },
      { key: 'subtitle', type: 'string', description: 'Short description' },
      { key: 'imageUrl', type: 'string', description: 'Product image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      badge: 'NEW',
      name: 'Classic Tee',
      price: '$49',
      oldPrice: '',
      description: '',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'product-showcase',
    label: 'Product Showcase',
    description: 'Product image, name, price, tagline, and feature tags',
    category: 'ecommerce',
    group: 'Business & Health',
    schema: [
      { key: 'name', type: 'string', description: 'Product name' },
      { key: 'price', type: 'string', description: 'Price' },
      { key: 'tagline', type: 'string', description: 'Short tagline' },
      { key: 'features', type: 'string[]', description: 'Feature tags' },
      { key: 'imageUrl', type: 'string', description: 'Product image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Minimal Watch',
      price: '$299',
      tagline: 'Timeless design, modern craft',
      features: ['Water resistant', 'Swiss movement', 'Sapphire glass'],
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'product-specs',
    label: 'Product Specs',
    description: 'Product specification table',
    category: 'ecommerce',
    group: 'Business & Health',
    schema: [
      { key: 'name', type: 'string', description: 'Product name' },
      { key: 'tagline', type: 'string', description: 'Product tagline' },
      {
        key: 'specs',
        type: 'array<{label, value}>',
        description: 'Specification rows',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Pro Laptop 16"',
      tagline: 'Power meets portability',
      specs: [
        {
          label: 'Display',
          value: '16" Liquid Retina XDR',
        },
        {
          label: 'Chip',
          value: 'M3 Pro',
        },
        {
          label: 'Memory',
          value: '18GB Unified',
        },
        {
          label: 'Storage',
          value: '512GB SSD',
        },
        {
          label: 'Battery',
          value: 'Up to 22 hours',
        },
        {
          label: 'Weight',
          value: '2.14 kg',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'unboxing',
    label: 'Unboxing',
    description: "What's inside the box — product name and item list",
    category: 'ecommerce',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'product', type: 'string', description: 'Product name' },
      { key: 'items', type: 'string[]', description: 'Box contents' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Unboxing',
      product: 'Pro Laptop 16"',
      items: ['Laptop', 'Charger', 'USB-C cable', 'Starter guide'],
      text: '',
      citation: '',
    },
  },

  {
    id: 'bill-reminder',
    label: 'Bill Reminder',
    description: 'Upcoming bills with paid/unpaid status',
    category: 'finance',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Reminder title' },
      {
        key: 'bills',
        type: 'array',
        description: 'Array of {name, amount, dueDate, paid} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Upcoming Bills',
      bills: [
        {
          name: 'Rent',
          amount: '$1,500',
          dueDate: 'Apr 1',
          paid: false,
        },
        {
          name: 'Electricity',
          amount: '$95',
          dueDate: 'Apr 5',
          paid: true,
        },
        {
          name: 'Internet',
          amount: '$60',
          dueDate: 'Apr 10',
          paid: false,
        },
        {
          name: 'Insurance',
          amount: '$120',
          dueDate: 'Apr 15',
          paid: false,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'budget-tracker',
    label: 'Budget Tracker',
    description: 'Income, expenses, and savings overview with bars',
    category: 'finance',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Budget title' },
      { key: 'income', type: 'string', description: 'Income amount' },
      { key: 'expenses', type: 'string', description: 'Expenses amount' },
      { key: 'savings', type: 'string', description: 'Savings amount' },
      { key: 'period', type: 'string', description: 'Time period' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Monthly Budget',
      income: '$5,000',
      expenses: '$3,200',
      savings: '$1,800',
      period: 'March 2025',
      citation: '',
    },
  },

  {
    id: 'expense-log',
    label: 'Expense Log',
    description: 'Recent expense entries with categories and amounts',
    category: 'finance',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Log title' },
      {
        key: 'expenses',
        type: 'array',
        description: 'Array of {category, amount, date} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Recent Expenses',
      expenses: [
        {
          category: 'Groceries',
          amount: '$85',
          date: 'Mar 15',
        },
        {
          category: 'Transport',
          amount: '$35',
          date: 'Mar 14',
        },
        {
          category: 'Dining',
          amount: '$52',
          date: 'Mar 13',
        },
        {
          category: 'Utilities',
          amount: '$120',
          date: 'Mar 12',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'financial-plan',
    label: 'Financial Plan',
    description: 'Numbered financial planning steps',
    category: 'finance',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Plan title' },
      {
        key: 'steps',
        type: 'array',
        description: 'Array of {label, desc} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Debt Payoff Plan',
      steps: [
        {
          label: 'List all debts',
          desc: 'Include balances and interest rates',
        },
        {
          label: 'Prioritise by rate',
          desc: 'Pay highest interest first',
        },
        {
          label: 'Set monthly payment',
          desc: 'Allocate extra funds each month',
        },
        {
          label: 'Track progress',
          desc: 'Celebrate each debt paid off',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'investment-tip',
    label: 'Investment Tip',
    description: 'Investment advice with risk level badge',
    category: 'finance',
    group: 'Business & Health',
    schema: [
      { key: 'tip', type: 'string', description: 'Investment tip' },
      { key: 'category', type: 'string', description: 'Investment category' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Detailed explanation',
      },
      {
        key: 'risk',
        type: 'string',
        description: 'Risk level (Low/Medium/High)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      tip: 'Diversify your portfolio',
      category: 'Strategy',
      description:
        'Spread investments across different asset classes to reduce risk and stabilise returns over time.',
      risk: 'Low',
      citation: '',
    },
  },

  {
    id: 'savings-goal',
    label: 'Savings Goal',
    description: 'Goal tracking with progress bar and deadline',
    category: 'finance',
    group: 'Business & Health',
    schema: [
      { key: 'goal', type: 'string', description: 'Savings goal name' },
      { key: 'target', type: 'string', description: 'Target amount' },
      { key: 'current', type: 'string', description: 'Current saved amount' },
      { key: 'deadline', type: 'string', description: 'Goal deadline' },
      { key: 'note', type: 'string', description: 'Optional note' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      goal: 'Emergency Fund',
      target: '$10,000',
      current: '$6,500',
      deadline: 'Dec 2025',
      note: 'Saving $500 per month',
      citation: '',
    },
  },

  {
    id: 'food-review',
    label: 'Food Review',
    description: 'Dish review with star rating and description',
    category: 'food',
    group: 'Business & Health',
    schema: [
      { key: 'dish', type: 'string', description: 'Dish name' },
      { key: 'restaurant', type: 'string', description: 'Restaurant name' },
      { key: 'rating', type: 'number', description: 'Star rating 1-5' },
      { key: 'review', type: 'string', description: 'Review text' },
      { key: 'imageUrl', type: 'string', description: 'Optional image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      dish: 'Margherita Pizza',
      restaurant: "Napoli's",
      rating: 5,
      review:
        'Perfectly crisp crust, fresh mozzarella, and the most flavourful tomato sauce I have had outside of Italy.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'ingredient-spotlight',
    label: 'Ingredient Spotlight',
    description: 'Single ingredient with benefits and uses',
    category: 'food',
    group: 'Business & Health',
    schema: [
      { key: 'name', type: 'string', description: 'Ingredient name' },
      {
        key: 'benefits',
        type: 'array',
        description: 'Array of benefit strings',
      },
      { key: 'uses', type: 'array', description: 'Array of use strings' },
      { key: 'imageUrl', type: 'string', description: 'Optional image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Turmeric',
      benefits: ['Anti-inflammatory', 'Rich in antioxidants', 'Supports immune function'],
      uses: ['Curries and stews', 'Golden milk latte', 'Smoothies', 'Rice dishes'],
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'meal-plan',
    label: 'Meal Plan',
    description: 'Weekly meal plan grid',
    category: 'food',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Plan title' },
      {
        key: 'meals',
        type: 'array',
        description: 'Array of {day, breakfast, lunch, dinner} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Weekly Meal Plan',
      meals: [
        {
          day: 'Mon',
          breakfast: 'Oatmeal',
          lunch: 'Grilled Chicken',
          dinner: 'Salmon',
        },
        {
          day: 'Tue',
          breakfast: 'Smoothie',
          lunch: 'Quinoa Bowl',
          dinner: 'Stir Fry',
        },
        {
          day: 'Wed',
          breakfast: 'Toast',
          lunch: 'Caesar Salad',
          dinner: 'Pasta',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'menu-highlights',
    label: 'Menu Highlights',
    description: 'Restaurant menu with featured items and prices',
    category: 'food',
    group: 'Business & Health',
    schema: [
      { key: 'restaurant', type: 'string', description: 'Restaurant name' },
      {
        key: 'items',
        type: 'array',
        description: 'Array of {name, price, desc} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      restaurant: 'The Green Bowl',
      items: [
        {
          name: 'Buddha Bowl',
          price: '$14',
          desc: 'Quinoa, greens, sweet potato',
        },
        {
          name: 'Poke Bowl',
          price: '$16',
          desc: 'Fresh salmon, rice, avocado',
        },
        {
          name: 'Acai Bowl',
          price: '$11',
          desc: 'Acai, banana, granola',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'nutrition-facts',
    label: 'Nutrition Facts',
    description: 'Nutrition label-style display with values',
    category: 'food',
    group: 'Business & Health',
    schema: [
      { key: 'item', type: 'string', description: 'Food item name' },
      { key: 'calories', type: 'string', description: 'Calorie count' },
      { key: 'fat', type: 'string', description: 'Fat content' },
      { key: 'carbs', type: 'string', description: 'Carbohydrate content' },
      { key: 'protein', type: 'string', description: 'Protein content' },
      { key: 'serving', type: 'string', description: 'Serving size' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      item: 'Greek Yogurt',
      calories: '150',
      fat: '4g',
      carbs: '8g',
      protein: '20g',
      serving: '1 cup (245g)',
      citation: '',
    },
  },

  {
    id: 'recipe-card',
    label: 'Recipe Card',
    description: 'Recipe with ingredients, steps, and time info',
    category: 'food',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Recipe title' },
      { key: 'prepTime', type: 'string', description: 'Preparation time' },
      { key: 'cookTime', type: 'string', description: 'Cooking time' },
      {
        key: 'ingredients',
        type: 'array',
        description: 'Array of ingredient strings',
      },
      { key: 'steps', type: 'array', description: 'Array of step strings' },
      { key: 'imageUrl', type: 'string', description: 'Optional image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Avocado Toast',
      prepTime: '5 min',
      cookTime: '3 min',
      ingredients: [
        '2 slices sourdough bread',
        '1 ripe avocado',
        'Salt and pepper',
        'Red pepper flakes',
        'Lemon juice',
      ],
      steps: [
        'Toast the bread until golden',
        'Mash avocado with lemon juice',
        'Spread on toast',
        'Season and garnish',
      ],
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'meditation-guide',
    label: 'Meditation Guide',
    description: 'Step-by-step meditation with duration and tip',
    category: 'health',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Meditation title' },
      { key: 'duration', type: 'string', description: 'Duration display' },
      {
        key: 'instructions',
        type: 'array',
        description: 'Array of instruction strings',
      },
      { key: 'tip', type: 'string', description: 'Helpful tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Mindful Breathing',
      duration: '5 min',
      instructions: [
        'Find a comfortable seated position',
        'Close your eyes and relax your shoulders',
        'Breathe in slowly through your nose for 4 counts',
        'Hold for 4 counts',
        'Exhale through your mouth for 6 counts',
        'Repeat for 5 minutes',
      ],
      tip: 'If your mind wanders, gently bring focus back to your breath without judgement.',
      citation: '',
    },
  },

  {
    id: 'mood-tracker',
    label: 'Mood Tracker',
    description: 'Daily mood logging with emoji and note',
    category: 'health',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Tracker title' },
      {
        key: 'mood',
        type: 'string',
        description: 'Mood label (great/good/okay/low/bad)',
      },
      { key: 'note', type: 'string', description: 'Journal note' },
      { key: 'date', type: 'string', description: 'Date string' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'How are you feeling?',
      mood: 'good',
      note: 'Had a productive morning and a nice walk in the park during lunch.',
      date: 'Mar 15, 2025',
      citation: '',
    },
  },

  {
    id: 'sleep-tips',
    label: 'Sleep Tips',
    description: 'Sleep hygiene tips with featured tip and quote',
    category: 'health',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'tip', type: 'string', description: 'Featured tip' },
      { key: 'tips', type: 'array', description: 'Array of tip strings' },
      { key: 'quote', type: 'string', description: 'Motivational quote' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Better Sleep Tonight',
      tip: 'Avoid screens 30 minutes before bed. Blue light suppresses melatonin production.',
      tips: [
        'Keep a consistent sleep schedule',
        'Make your bedroom cool and dark',
        'Avoid caffeine after 2 PM',
        'Limit alcohol before bed',
      ],
      quote: 'Sleep is the golden chain that ties health and our bodies together.',
      citation: '',
    },
  },

  {
    id: 'water-tracker',
    label: 'Water Tracker',
    description: 'Daily water intake with glass tracker',
    category: 'health',
    group: 'Business & Health',
    schema: [
      { key: 'goal', type: 'string', description: 'Daily goal (glasses)' },
      {
        key: 'current',
        type: 'string',
        description: 'Current glasses consumed',
      },
      { key: 'unit', type: 'string', description: 'Unit label' },
      { key: 'tip', type: 'string', description: 'Hydration tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      goal: '8',
      current: '5',
      unit: 'glasses',
      tip: 'Keep a water bottle on your desk as a visual reminder to sip throughout the day.',
      citation: '',
    },
  },

  {
    id: 'wellness-tip',
    label: 'Wellness Tip',
    description: 'Health and wellness advice with source',
    category: 'health',
    group: 'Business & Health',
    schema: [
      { key: 'tip', type: 'string', description: 'Wellness tip' },
      { key: 'category', type: 'string', description: 'Tip category' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Detailed explanation',
      },
      { key: 'source', type: 'string', description: 'Attribution source' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      tip: 'Movement is medicine',
      category: 'Exercise',
      description:
        'Even 10 minutes of moderate activity can boost mood, improve focus, and reduce stress.',
      source: 'World Health Organisation',
      citation: '',
    },
  },

  {
    id: 'workout-card',
    label: 'Exercise Card',
    description: 'Single exercise with sets, reps, and rest',
    category: 'health',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Workout title' },
      { key: 'exercise', type: 'string', description: 'Exercise name' },
      { key: 'reps', type: 'string', description: 'Number of reps' },
      { key: 'sets', type: 'string', description: 'Number of sets' },
      { key: 'rest', type: 'string', description: 'Rest period' },
      { key: 'note', type: 'string', description: 'Optional note' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Exercise of the Day',
      exercise: 'Pull Ups',
      reps: '10',
      sets: '3',
      rest: '60 sec',
      note: 'Use assisted band if needed',
      citation: '',
    },
  },

  {
    id: 'affirmation',
    label: 'Affirmation',
    description: 'Positive "I am" affirmation statement',
    category: 'inspirational',
    group: 'Business & Health',
    schema: [
      {
        key: 'affirmation',
        type: 'string',
        description: 'The affirmation text',
      },
      { key: 'subtitle', type: 'string', description: 'Supporting subtitle' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      affirmation: 'Resilient',
      subtitle: 'Every setback is a setup for a comeback.',
      citation: '',
    },
  },

  {
    id: 'belief-card',
    label: 'Belief Card',
    description: '"I believe" statement with author and context',
    category: 'inspirational',
    group: 'Business & Health',
    schema: [
      { key: 'belief', type: 'string', description: 'The belief statement' },
      {
        key: 'author',
        type: 'string',
        description: 'Person who holds this belief',
      },
      { key: 'context', type: 'string', description: 'Optional context' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      belief: 'Simplicity is the ultimate sophistication.',
      author: 'Leonardo da Vinci',
      context: 'Renaissance artist and inventor',
      citation: '',
    },
  },

  {
    id: 'mission-statement',
    label: 'Mission Statement',
    description: 'Mission and vision pair with title',
    category: 'inspirational',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'mission', type: 'string', description: 'Mission statement' },
      { key: 'vision', type: 'string', description: 'Vision statement' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Our Mission',
      mission: 'Empower every person and organisation on the planet to achieve more.',
      vision: 'A world where everyone has access to the tools they need to succeed.',
      citation: '',
    },
  },

  {
    id: 'podcast-episode',
    label: 'Podcast Episode',
    description: 'Episode card with play button and details',
    category: 'inspirational',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Episode title' },
      { key: 'episode', type: 'string', description: 'Episode number' },
      { key: 'guest', type: 'string', description: 'Guest name' },
      { key: 'duration', type: 'string', description: 'Episode duration' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Episode description',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'The Future of AI',
      episode: 'EP 42',
      guest: 'Dr. Sarah Chen',
      duration: '58 min',
      description:
        'Exploring how artificial intelligence will reshape creative industries in the next decade.',
      citation: '',
    },
  },

  {
    id: 'streak-counter',
    label: 'Streak Counter',
    description: 'Streak tracking counter with start date',
    category: 'inspirational',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'streak', type: 'string', description: 'Streak number' },
      { key: 'label', type: 'string', description: 'Unit label' },
      { key: 'started', type: 'string', description: 'Start date' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Learning Streak',
      streak: '42',
      label: 'days',
      started: 'Started Feb 15, 2025',
      citation: '',
    },
  },

  {
    id: 'vision-board',
    label: 'Vision Board',
    description: 'Image collage with overlay title and body text',
    category: 'inspirational',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'imageUrl', type: 'string', description: 'URL to an image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Dream Big',
      text: 'Visualise your goals, then work backwards from the future you want to create.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'announcement',
    label: 'Announcement',
    description: 'Badge, headline, body text, and date',
    category: 'marketing',
    group: 'Business & Health',
    schema: [
      {
        key: 'badge',
        type: 'string',
        description: 'Chip label (e.g. New, Launch)',
      },
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'date', type: 'string', description: 'Date or timeline label' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      badge: 'Launching Soon',
      title: 'A New Way to Work',
      text: 'We are building a platform that reimagines how teams collaborate across time zones.',
      date: 'Coming Q1 2025',
      citation: '',
    },
  },

  {
    id: 'faq',
    label: 'FAQ',
    description: 'Question and answer pair',
    category: 'marketing',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'items', type: 'array', description: 'Array of {q, a} objects' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Frequently Asked',
      items: [
        {
          q: 'How does it work?',
          a: 'Sign up, customize your template, and download your image in seconds.',
        },
        {
          q: 'Is it free?',
          a: 'Yes, all templates are free to use with no hidden fees.',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'glossary',
    label: 'Glossary',
    description: 'Term, definition, and example sentence',
    category: 'marketing',
    group: 'Business & Health',
    schema: [
      { key: 'term', type: 'string', description: 'The word or phrase' },
      { key: 'definition', type: 'string', description: 'Clear explanation' },
      { key: 'example', type: 'string', description: 'Usage example' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      term: 'Synergy',
      definition:
        'The interaction of two or more elements that produces a combined effect greater than the sum of their separate effects.',
      example:
        'The synergy between the design and engineering teams led to a breakthrough product.',
      citation: '',
    },
  },

  {
    id: 'offer-banner',
    label: 'Offer Banner',
    description: 'Discount or promo banner with badge and CTA',
    category: 'marketing',
    group: 'Business & Health',
    schema: [
      { key: 'badge', type: 'string', description: 'Offer badge label' },
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'code', type: 'string', description: 'Promo code' },
      { key: 'cta', type: 'string', description: 'Call to action text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      badge: 'Limited Offer',
      title: 'Special Offer',
      text: 'Get 30% off your first month. No commitment required.',
      code: 'WELCOME30',
      cta: 'Claim Offer',
      citation: '',
    },
  },

  {
    id: 'pricing-card',
    label: 'Pricing Card',
    description: 'Plan name, price, feature list, and CTA button',
    category: 'marketing',
    group: 'Business & Health',
    schema: [
      { key: 'plan', type: 'string', description: 'Plan name (e.g. Pro)' },
      {
        key: 'price',
        type: 'string',
        description: 'Price display (e.g. $29/mo)',
      },
      {
        key: 'features',
        type: 'array',
        description: 'Array of feature strings',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      plan: 'Pro Plan',
      price: '$29',
      features: [
        'Unlimited projects',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
      ],
      citation: '',
    },
  },

  {
    id: 'value-prop',
    label: 'Value Prop',
    description: 'Feature-benefit list with numbered icons',
    category: 'marketing',
    group: 'Business & Health',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'features',
        type: 'array<{title, description}>',
        description: 'Feature items',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Why Choose Us',
      features: [
        {
          title: 'Lightning Fast',
          description: 'Optimized for speed at every layer',
        },
        {
          title: 'Built to Scale',
          description: 'Grows with your business effortlessly',
        },
        {
          title: 'Secure by Default',
          description: 'Enterprise-grade security out of the box',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'bullet-list',
    label: 'Bullet List',
    description: 'Simple bullet point list with title',
    category: 'list',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'items', type: 'array', description: 'Array of strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Key Points',
      items: ['Increased productivity', 'Better collaboration', 'Reduced costs', 'Faster delivery'],
      citation: '',
    },
  },

  {
    id: 'checklist',
    label: 'Checklist',
    description: 'A list of items with checkmark icons',
    category: 'list',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Supporting paragraph' },
      { key: 'items', type: 'array', description: 'Array of strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Launch Checklist',
      text: 'Make sure everything is ready before you hit publish.',
      items: ['Write final copy', 'Review analytics', 'Test on mobile', 'Schedule social posts'],
      citation: '',
    },
  },

  {
    id: 'color-palette',
    label: 'Color Palette',
    description: 'Color palette display with swatches',
    category: 'list',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Palette title' },
      {
        key: 'colors',
        type: 'array',
        description: 'Array of {name, hex} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Brand Palette',
      colors: [
        {
          name: 'Primary',
          hex: '#6366f1',
        },
        {
          name: 'Secondary',
          hex: '#8b5cf6',
        },
        {
          name: 'Accent',
          hex: '#f59e0b',
        },
        {
          name: 'Neutral',
          hex: '#64748b',
        },
        {
          name: 'Background',
          hex: '#f8fafc',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'listicle',
    label: 'Listicle',
    description: 'Numbered items with title and bottom image',
    category: 'list',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Supporting paragraph' },
      { key: 'items', type: 'array', description: 'Array of strings' },
      { key: 'imageUrl', type: 'string', description: 'Optional bottom image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: '3 Daily Habits',
      text: 'Small daily improvements over time lead to massive results.',
      items: ['Wake up at 5 AM', 'Read for 30 minutes', 'Exercise daily'],
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'step-by-step',
    label: 'Step by Step',
    description: 'Three numbered steps with icons',
    category: 'list',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Supporting paragraph' },
      { key: 'steps', type: 'array', description: 'Array of {label} objects' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Getting Started',
      text: 'Follow these three steps to begin your journey.',
      steps: [
        {
          label: 'Discover',
        },
        {
          label: 'Learn',
        },
        {
          label: 'Apply',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'steps-horizontal',
    label: 'Steps Horizontal',
    description: 'Horizontal connected step flow with numbers',
    category: 'list',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'steps', type: 'array', description: 'Array of {label} objects' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'How It Works',
      steps: [
        {
          label: 'Plan',
        },
        {
          label: 'Build',
        },
        {
          label: 'Launch',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'card-overlay',
    label: 'Card Overlay',
    description: 'Full-bleed background image with floating text card',
    category: 'media',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'imageUrl', type: 'string', description: 'Background image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'New Horizons',
      text: 'The future belongs to those who believe in the beauty of their dreams.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'cinema-banner',
    label: 'Cinema Banner',
    description: 'Wide letterbox banner with centered text overlay',
    category: 'media',
    group: 'Content & Design',
    schema: [
      { key: 'imageUrl', type: 'string', description: 'Background image URL' },
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body text' },
      { key: 'caption', type: 'string', description: 'Bottom caption' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      imageUrl: '',
      title: 'A New Chapter',
      text: 'Every great story begins with a single step into the unknown.',
      caption: 'Coming this summer',
      citation: '',
    },
  },

  {
    id: 'collage',
    label: 'Collage',
    description: 'Overlapping image arrangement',
    category: 'media',
    group: 'Content & Design',
    schema: [
      { key: 'images', type: 'array', description: 'Array of 3 image URLs' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      images: ['', '', ''],
      citation: '',
    },
  },

  {
    id: 'full-bleed',
    label: 'Full Bleed',
    description: 'Full background image with centered text overlay',
    category: 'media',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'imageUrl', type: 'string', description: 'Background image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Dream Bigger',
      text: 'The only limit to your impact is your imagination and commitment to act.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'mosaic',
    label: 'Mosaic',
    description: '2x2 image grid layout',
    category: 'media',
    group: 'Content & Design',
    schema: [
      { key: 'images', type: 'array', description: 'Array of 4 image URLs' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      images: ['', '', '', ''],
      citation: '',
    },
  },

  {
    id: 'video-still',
    label: 'Video Still',
    description: 'Video player mockup with play button',
    category: 'media',
    group: 'Content & Design',
    schema: [
      { key: 'imageUrl', type: 'string', description: 'Thumbnail image URL' },
      { key: 'title', type: 'string', description: 'Video title' },
      {
        key: 'duration',
        type: 'string',
        description: 'Duration display (e.g. 12:34)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      imageUrl: '',
      title: 'Product Demo',
      duration: '3:45',
      citation: '',
    },
  },

  {
    id: 'breakdown-card',
    label: 'Breakdown Card',
    description: 'News or topic breakdown with key points',
    category: 'news',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Headline' },
      { key: 'summary', type: 'string', description: 'Summary text' },
      {
        key: 'points',
        type: 'array',
        description: 'Array of {title, detail} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Market Rally Explained',
      summary: 'Three key factors drove the S&P 500 to new highs this quarter.',
      points: [
        {
          title: 'Tech Earnings',
          detail: 'Major tech companies exceeded expectations',
        },
        {
          title: 'Fed Policy',
          detail: 'Interest rate hold signaled stability',
        },
        {
          title: 'Consumer Confidence',
          detail: 'Spending indices rose 4.2%',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'breaking-news',
    label: 'Breaking News',
    description: 'Urgency badge, headline, source, and timestamp',
    category: 'news',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'News title' },
      { key: 'source', type: 'string', description: 'News source' },
      { key: 'timestamp', type: 'string', description: 'Time or date' },
      {
        key: 'urgency',
        type: 'string',
        description: 'Urgency label (e.g. BREAKING, UPDATE)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Global Summit Reaches Historic Climate Agreement',
      source: 'Reuters',
      timestamp: '2 hours ago',
      urgency: 'BREAKING',
      citation: '',
    },
  },

  {
    id: 'daily-digest',
    label: 'Daily Digest',
    description: 'Numbered story list with titles and summaries',
    category: 'news',
    group: 'Content & Design',
    schema: [
      { key: 'date', type: 'string', description: 'Date label' },
      {
        key: 'stories',
        type: 'array<{title, summary}>',
        description: 'Top stories',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      date: 'March 15, 2025',
      stories: [
        {
          title: 'Tech stocks rally on AI breakthrough',
          summary: 'Major indices hit record highs as leading companies announce new AI tools.',
        },
        {
          title: 'New renewable energy target set',
          summary: 'Government pledges 80% clean energy by 2035 in landmark policy.',
        },
        {
          title: 'Space agency confirms water on Mars',
          summary: 'Underground ice deposits detected by latest rover mission.',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'fact-check',
    label: 'Fact Check',
    description: 'Claim with verdict badge and source attribution',
    category: 'news',
    group: 'Content & Design',
    schema: [
      { key: 'claim', type: 'string', description: 'The claim being checked' },
      {
        key: 'verdict',
        type: 'string',
        description: 'Verdict: true, false, or partial',
      },
      { key: 'source', type: 'string', description: 'Fact-check source' },
      {
        key: 'explanation',
        type: 'string',
        description: 'Detailed explanation',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      claim: 'Drinking 8 glasses of water a day is scientifically proven',
      verdict: 'partial',
      source: 'Health Feedback',
      explanation:
        'Water needs vary by individual. The "8x8" rule is a reasonable guideline but not a strict scientific requirement.',
      citation: '',
    },
  },

  {
    id: 'q-and-a',
    label: 'Q&A',
    description: 'Question and answer card with category',
    category: 'news',
    group: 'Content & Design',
    schema: [
      { key: 'question', type: 'string', description: 'The question' },
      { key: 'answer', type: 'string', description: 'The answer' },
      { key: 'category', type: 'string', description: 'Topic category' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      question: 'What is design thinking?',
      answer:
        'A human-centred approach to innovation that integrates the needs of people, technology, and business.',
      category: 'Design',
      citation: '',
    },
  },

  {
    id: 'trending-topic',
    label: 'Trending Topic',
    description: 'Hashtag with volume and related tags',
    category: 'news',
    group: 'Content & Design',
    schema: [
      { key: 'hashtag', type: 'string', description: 'Trending hashtag' },
      { key: 'volume', type: 'string', description: 'Post or mention count' },
      { key: 'relatedTags', type: 'string[]', description: 'Related hashtags' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      hashtag: '#ClimateAction',
      volume: '1.2M posts today',
      relatedTags: ['#Sustainability', '#GreenEnergy', '#COP30', '#NetZero'],
      citation: '',
    },
  },

  {
    id: 'certifications',
    label: 'Certifications',
    description: 'Professional certifications, licenses, and awards',
    category: 'profile',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'certs',
        type: 'array<{name, issuer, date, credentialId}>',
        description: 'Certification list',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Certifications',
      certs: [
        {
          name: 'Google UX Design Professional',
          issuer: 'Google',
          date: '2023',
          credentialId: 'GUXD-12345',
        },
        {
          name: 'AWS Cloud Practitioner',
          issuer: 'Amazon Web Services',
          date: '2022',
          credentialId: 'AWS-CP-67890',
        },
        {
          name: 'Certified Scrum Master',
          issuer: 'Scrum Alliance',
          date: '2021',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'education',
    label: 'Education',
    description: 'Degrees, institutions, and academic highlights',
    category: 'profile',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'degrees',
        type: 'array<{institution, degree, field, period, location?, gpa?, highlights?}>',
        description: 'Academic history',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Education',
      degrees: [
        {
          institution: 'Stanford University',
          degree: 'M.S.',
          field: 'Computer Science',
          period: '2017 — 2019',
          location: 'Stanford, CA',
          gpa: '3.9',
          highlights: ['Focus: Human-Computer Interaction', 'Teaching Assistant for CS 147'],
        },
        {
          institution: 'UC Berkeley',
          degree: 'B.S.',
          field: 'Cognitive Science',
          period: '2013 — 2017',
          location: 'Berkeley, CA',
          gpa: '3.8',
          highlights: ['Minor in Design Innovation'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'profile-header',
    label: 'Profile Header',
    description: 'Name, title, tagline, and contact info',
    category: 'profile',
    group: 'Content & Design',
    schema: [
      { key: 'name', type: 'string', description: 'Full name' },
      { key: 'title', type: 'string', description: 'Job title or role' },
      {
        key: 'tagline',
        type: 'string',
        description: 'Short professional tagline',
      },
      { key: 'email', type: 'string', description: 'Email address' },
      { key: 'phone', type: 'string', description: 'Phone number' },
      { key: 'location', type: 'string', description: 'City and country' },
      { key: 'website', type: 'string', description: 'Personal website URL' },
      {
        key: 'github',
        type: 'string',
        description: 'GitHub handle (without @)',
      },
      {
        key: 'linkedin',
        type: 'string',
        description: 'LinkedIn handle (without @)',
      },
      {
        key: 'instagram',
        type: 'string',
        description: 'Instagram handle (without @)',
      },
      { key: 'x', type: 'string', description: 'X/Twitter handle (without @)' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Alex Chen',
      title: 'Senior Product Designer',
      tagline:
        'Designing meaningful experiences at the intersection of simplicity and functionality.',
      email: 'alex@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'alexchen.design',
      github: 'alexchen',
      linkedin: 'alexchen',
      instagram: 'alexchen',
      x: 'alexchen',
      citation: '',
    },
  },

  {
    id: 'profile-projects',
    label: 'Projects',
    description: 'Portfolio items with descriptions and technologies',
    category: 'profile',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'projects',
        type: 'array<{name, description, tech[], highlights[]}>',
        description: 'Project list',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Projects',
      projects: [
        {
          name: 'Design System',
          description: 'A comprehensive component library used across 5 product teams.',
          tech: ['React', 'TypeScript', 'Storybook'],
          highlights: ['120+ components', '95% test coverage', 'Used by 40+ engineers'],
        },
        {
          name: 'Analytics Dashboard',
          description: 'Real-time analytics platform for tracking user behaviour.',
          tech: ['Next.js', 'D3.js', 'PostgreSQL'],
          highlights: ['Handles 1M+ events/day', 'Sub-second query response'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'skills',
    label: 'Skills',
    description: 'Technical and soft skills grouped by category',
    category: 'profile',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'categories',
        type: 'array<{name, items[]}>',
        description: 'Skill groups',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Skills',
      categories: [
        {
          name: 'Design',
          items: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'Design Systems'],
        },
        {
          name: 'Development',
          items: ['React', 'TypeScript', 'CSS/Tailwind', 'HTML', 'Git'],
        },
        {
          name: 'Research',
          items: ['User Interviews', 'Usability Testing', 'A/B Testing', 'Analytics'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'work-experience',
    label: 'Work Experience',
    description: 'Job history with roles, companies, and achievements',
    category: 'profile',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'jobs',
        type: 'array<{company, role, period, achievements}>',
        description: 'Work history',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Work Experience',
      jobs: [
        {
          company: 'Figma',
          role: 'Senior Product Designer',
          period: '2022 — Present',
          achievements: [
            'Led design system used by 50+ engineers',
            'Shipped 3 major features reaching 2M users',
          ],
        },
        {
          company: 'Stripe',
          role: 'Product Designer',
          period: '2019 — 2022',
          achievements: [
            'Redesigned checkout flow increasing conversion 18%',
            'Built and mentored design guild of 8 designers',
          ],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'haiku',
    label: 'Haiku',
    description: 'Three-line poetic format with title',
    category: 'text',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Poem title' },
      { key: 'line1', type: 'string', description: 'First line (5 syllables)' },
      {
        key: 'line2',
        type: 'string',
        description: 'Second line (7 syllables)',
      },
      { key: 'line3', type: 'string', description: 'Third line (5 syllables)' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Silence',
      line1: 'An old silent pond',
      line2: 'A frog jumps into the pond',
      line3: 'Splash! Silence again',
      citation: '',
    },
  },

  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean serif headline with body text and bottom image',
    category: 'text',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'imageUrl', type: 'string', description: 'URL to an image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'The Art of Focus',
      text: 'In a world of constant distraction, the ability to concentrate on what truly matters has become a superpower.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'pull-quote',
    label: 'Pull Quote',
    description: 'Large decorative pull quote with opening mark',
    category: 'text',
    group: 'Content & Design',
    schema: [
      { key: 'quote', type: 'string', description: 'The quoted text' },
      { key: 'author', type: 'string', description: 'Author name' },
      { key: 'source', type: 'string', description: 'Attribution source' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      quote: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      source: 'Stanford commencement address, 2005',
      citation: '',
    },
  },

  {
    id: 'rating-scale',
    label: 'Rating Scale',
    description: 'Star rating display with label and caption',
    category: 'text',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'rating', type: 'number', description: 'Rating value 1-5' },
      {
        key: 'scaleMax',
        type: 'number',
        description: 'Maximum rating (default 5)',
      },
      { key: 'label', type: 'string', description: 'Rating label' },
      { key: 'sublabel', type: 'string', description: 'Rating sublabel' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Customer Rating',
      rating: 4,
      scaleMax: 5,
      label: 'Excellent',
      sublabel: 'Based on 2,500+ reviews',
      citation: '',
    },
  },

  {
    id: 'takeaway',
    label: 'Takeaway',
    description: 'Key insight with red left border and source',
    category: 'text',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Key insight text' },
      { key: 'source', type: 'string', description: 'Attribution source' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Attention is the New Currency',
      text: 'In an information-rich world, the scarcest resource is not information but attention.',
      source: 'Herbert Simon, 1971',
      citation: '',
    },
  },

  {
    id: 'tip-card',
    label: 'Tip Card',
    description: 'Large number, headline, and body text',
    category: 'text',
    group: 'Content & Design',
    schema: [
      {
        key: 'number',
        type: 'string',
        description: 'Display number (e.g. 01)',
      },
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      number: '01',
      title: 'Start Small',
      text: 'Break your goals into tiny, manageable steps. Consistency beats intensity every time.',
      citation: '',
    },
  },

  {
    id: 'gradient-text',
    label: 'Gradient Text',
    description: 'Large gradient headline text',
    category: 'typography',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Supporting text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Create',
      text: 'Beautiful designs that inspire and motivate people every day.',
      citation: '',
    },
  },

  {
    id: 'highlighted-title',
    label: 'Highlighted Title',
    description: 'Big title where specific words are wrapped in accent color',
    category: 'typography',
    group: 'Content & Design',
    schema: [
      { key: 'title', type: 'string', description: 'Full title text' },
      {
        key: 'highlights',
        type: 'string[]',
        description: 'Words to highlight in accent color',
      },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'The Future is NOW',
      highlights: ['NOW'],
      text: '',
      citation: '',
    },
  },

  {
    id: 'icon-text',
    label: 'Icon + Text',
    description: 'Big emoji or icon in accent color paired with large text',
    category: 'typography',
    group: 'Content & Design',
    schema: [
      { key: 'icon', type: 'string', description: 'Emoji or icon character' },
      { key: 'title', type: 'string', description: 'Main text' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      icon: '🚀',
      title: 'Ship Faster',
      text: '',
      citation: '',
    },
  },

  {
    id: 'strikethrough',
    label: 'Strikethrough',
    description: 'Big number with strikethrough next to accent replacement',
    category: 'typography',
    group: 'Content & Design',
    schema: [
      { key: 'number', type: 'string', description: 'Struck-through text' },
      {
        key: 'replacement',
        type: 'string',
        description: 'Replacement in accent color',
      },
      { key: 'label', type: 'string', description: 'Descriptive label' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      number: '$99',
      replacement: 'FREE',
      label: 'Limited Time Offer',
      text: '',
      citation: '',
    },
  },

  {
    id: 'tri-word',
    label: 'Tri Word',
    description: 'Three words in a row, first and last in accent, middle in normal',
    category: 'typography',
    group: 'Content & Design',
    schema: [
      { key: 'word1', type: 'string', description: 'First word (accent)' },
      { key: 'word2', type: 'string', description: 'Middle word (normal)' },
      { key: 'word3', type: 'string', description: 'Last word (accent)' },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      word1: 'WORK',
      word2: 'hard',
      word3: 'PLAY',
      text: '',
      citation: '',
    },
  },

  {
    id: 'word-stack',
    label: 'Word Stack',
    description: 'Words stacked vertically, alternating accent and normal colors',
    category: 'typography',
    group: 'Content & Design',
    schema: [
      {
        key: 'words',
        type: 'array<{text, highlight}>',
        description: 'Words with highlight flag',
      },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      words: [
        {
          text: 'LESS',
          highlight: true,
        },
        {
          text: 'is',
          highlight: false,
        },
        {
          text: 'MORE',
          highlight: true,
        },
      ],
      text: '',
      citation: '',
    },
  },

  {
    id: 'anatomy-study',
    label: 'Anatomy Study',
    description: 'Anatomy reference notes for artists',
    category: 'art',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'subject', type: 'string', description: 'Subject area' },
      {
        key: 'notes',
        type: 'array',
        description: 'Array of {area, description} objects',
      },
      { key: 'tip', type: 'string', description: 'Study tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Anatomy Study',
      subject: 'Human Figure',
      notes: [
        {
          area: 'Skeletal',
          description: 'Bone structure and joints',
        },
        {
          area: 'Muscular',
          description: 'Muscle groups and tension',
        },
        {
          area: 'Proportions',
          description: 'Head-to-body ratios',
        },
      ],
      tip: 'Practice gesture drawing for 5 minutes daily',
      citation: '',
    },
  },

  {
    id: 'art-history',
    label: 'Art History',
    description: 'Timeline of art historical events',
    category: 'art',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'period', type: 'string', description: 'Time period' },
      {
        key: 'entries',
        type: 'array',
        description: 'Array of {date, event, artist} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Art History',
      period: 'Renaissance to Modern',
      entries: [
        {
          date: '1485',
          event: 'Mona Lisa painted',
          artist: 'Leonardo da Vinci',
        },
        {
          date: '1512',
          event: 'Sistine Chapel ceiling',
          artist: 'Michelangelo',
        },
        {
          date: '1889',
          event: 'Starry Night created',
          artist: 'Vincent van Gogh',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'color-wheel',
    label: 'Color Wheel',
    description: 'Color theory wheel with swatches and roles',
    category: 'art',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'colors',
        type: 'array',
        description: 'Array of {name, hex, role} objects',
      },
      { key: 'tip', type: 'string', description: 'Tip text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Color Theory',
      description: 'Understanding the relationships between colors',
      colors: [
        {
          name: 'Primary',
          hex: '#ef4444',
          role: 'Base',
        },
        {
          name: 'Secondary',
          hex: '#f97316',
          role: 'Mix',
        },
        {
          name: 'Tertiary',
          hex: '#eab308',
          role: 'Blend',
        },
        {
          name: 'Complement',
          hex: '#22c55e',
          role: 'Opposite',
        },
        {
          name: 'Neutral',
          hex: '#6b7280',
          role: 'Balance',
        },
      ],
      tip: 'Use complementary colors for maximum contrast',
      citation: '',
    },
  },

  {
    id: 'palette-inspiration',
    label: 'Palette Inspiration',
    description: 'Color palette with mood and swatches',
    category: 'art',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'palette',
        type: 'array',
        description: 'Array of {name, hex} objects',
      },
      { key: 'mood', type: 'string', description: 'Mood tag' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Palette Inspiration',
      description: 'A warm and inviting color palette',
      palette: [
        {
          name: 'Sunset',
          hex: '#f97316',
        },
        {
          name: 'Coral',
          hex: '#fb7185',
        },
        {
          name: 'Lavender',
          hex: '#a78bfa',
        },
        {
          name: 'Sky',
          hex: '#38bdf8',
        },
        {
          name: 'Sage',
          hex: '#86efac',
        },
      ],
      mood: 'Warm & Inviting',
      citation: '',
    },
  },

  {
    id: 'style-guide',
    label: 'Style Guide',
    description: 'Art style comparison with eras and characteristics',
    category: 'art',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      {
        key: 'styles',
        type: 'array',
        description: 'Array of {name, era, description, characteristics} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Art Movements',
      styles: [
        {
          name: 'Impressionism',
          era: '1860s',
          description: 'Light and movement',
          characteristics: 'Visible brushstrokes, open composition',
        },
        {
          name: 'Cubism',
          era: '1907',
          description: 'Geometric forms',
          characteristics: 'Fragmented objects, multiple viewpoints',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'technique-tutorial',
    label: 'Technique Tutorial',
    description: 'Step-by-step art technique guide',
    category: 'art',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'technique', type: 'string', description: 'Technique name' },
      { key: 'difficulty', type: 'string', description: 'Difficulty level' },
      {
        key: 'steps',
        type: 'array',
        description: 'Array of {step, description} objects',
      },
      { key: 'tip', type: 'string', description: 'Pro tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Watercolor Basics',
      technique: 'Wet-on-Wet Technique',
      difficulty: 'Beginner',
      steps: [
        {
          step: 'Prep',
          description: 'Wet the paper evenly',
        },
        {
          step: 'Base',
          description: 'Apply light washes',
        },
        {
          step: 'Detail',
          description: 'Add concentrated pigment',
        },
      ],
      tip: 'Work quickly while the paper is still wet',
      citation: '',
    },
  },

  {
    id: 'cover-letter',
    label: 'Cover Letter',
    description: 'Cover letter template with sections',
    category: 'career',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'greeting', type: 'string', description: 'Greeting' },
      {
        key: 'body',
        type: 'string',
        description: 'Body paragraphs (newline separated)',
      },
      { key: 'closing', type: 'string', description: 'Closing line' },
      { key: 'signature', type: 'string', description: 'Signature' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Cover Letter',
      greeting: 'Dear Hiring Manager,',
      body: 'I am writing to express my interest in the Software Engineer position. With 5 years of experience building scalable web applications, I am confident I can make a meaningful contribution to your team. My background includes leading cross-functional projects, mentoring junior developers, and delivering products that serve millions of users.',
      closing: 'Thank you for your time and consideration.',
      signature: 'Best regards, Alex Chen',
      citation: '',
    },
  },

  {
    id: 'interview-prep',
    label: 'Interview Prep',
    description: 'Common interview questions and answers',
    category: 'career',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'role', type: 'string', description: 'Role' },
      {
        key: 'questions',
        type: 'array',
        description: 'Array of {question, answer} objects',
      },
      { key: 'tip', type: 'string', description: 'Preparation tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Interview Prep',
      role: 'Software Engineer',
      questions: [
        {
          question: 'Tell me about yourself',
          answer: 'Focus on relevant experience and career progression',
        },
        {
          question: 'Why this company?',
          answer: 'Research the mission and connect it to your goals',
        },
      ],
      tip: 'STAR method: Situation, Task, Action, Result',
      citation: '',
    },
  },

  {
    id: 'networking-tip',
    label: 'Networking Tip',
    description: "Networking do's and don'ts",
    category: 'career',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'tip', type: 'string', description: 'Main tip' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      { key: 'doList', type: 'array', description: 'Array of do strings' },
      { key: 'dontList', type: 'array', description: "Array of don't strings" },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Networking Tip',
      tip: 'Give before you ask',
      description: 'The best networking relationships are built on genuine value exchange.',
      doList: ['Follow up within 24 hours', 'Share relevant articles', 'Offer introductions'],
      dontList: ['Ask for favors immediately', 'Only talk about yourself', 'Spam with messages'],
      citation: '',
    },
  },

  {
    id: 'resume-tip',
    label: 'Resume Tip',
    description: 'Resume writing tip with examples',
    category: 'career',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'tip', type: 'string', description: 'Main tip' },
      { key: 'category', type: 'string', description: 'Category' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'examples',
        type: 'array',
        description: 'Array of example strings',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Resume Tip',
      tip: 'Start each bullet with a strong action verb',
      category: 'Formatting',
      description:
        'Action verbs make your resume more impactful and help ATS systems parse your experience.',
      examples: [
        'Managed a team of 5 developers',
        'Increased revenue by 25% YoY',
        'Reduced load time by 40%',
      ],
      citation: '',
    },
  },

  {
    id: 'salary-guide',
    label: 'Salary Guide',
    description: 'Salary ranges by level and location',
    category: 'career',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'role', type: 'string', description: 'Role' },
      {
        key: 'entries',
        type: 'array',
        description: 'Array of {level, salary, location} objects',
      },
      { key: 'note', type: 'string', description: 'Disclaimer note' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Salary Guide',
      role: 'Software Engineer',
      entries: [
        {
          level: 'Junior',
          salary: '$75K-$95K',
          location: 'Remote',
        },
        {
          level: 'Mid',
          salary: '$110K-$140K',
          location: 'San Francisco',
        },
        {
          level: 'Senior',
          salary: '$160K-$200K',
          location: 'San Francisco',
        },
      ],
      note: 'Salaries vary by company, experience, and location',
      citation: '',
    },
  },

  {
    id: 'skill-roadmap',
    label: 'Skill Roadmap',
    description: 'Progressive skill learning path',
    category: 'career',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'skill', type: 'string', description: 'Skill name' },
      {
        key: 'levels',
        type: 'array',
        description: 'Array of {level, description, duration} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Skill Roadmap',
      skill: 'React Development',
      levels: [
        {
          level: 'Beginner',
          description: 'Components, JSX, props, state',
          duration: '2-4 weeks',
        },
        {
          level: 'Intermediate',
          description: 'Hooks, context, routing',
          duration: '1-2 months',
        },
        {
          level: 'Advanced',
          description: 'Performance, patterns, testing',
          duration: '3-6 months',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'achievement-unlocked',
    label: 'Achievement Unlocked',
    description: 'Achievement badge with game and rarity',
    category: 'gaming',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Achievement name' },
      { key: 'game', type: 'string', description: 'Game title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      { key: 'rarity', type: 'string', description: 'Rarity level' },
      { key: 'dateUnlocked', type: 'string', description: 'Date unlocked' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Platinum Trophy',
      game: 'Ghost of Tsushima',
      description: 'Collect all trophies',
      rarity: 'Ultra Rare',
      dateUnlocked: 'Mar 15, 2026',
      citation: '',
    },
  },

  {
    id: 'game-review',
    label: 'Game Review',
    description: 'Game review with pros, cons, and score',
    category: 'gaming',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Game title' },
      { key: 'platform', type: 'string', description: 'Platform' },
      { key: 'score', type: 'string', description: 'Score' },
      { key: 'reviewer', type: 'string', description: 'Reviewer name' },
      { key: 'pros', type: 'array', description: 'Array of pro strings' },
      { key: 'cons', type: 'array', description: 'Array of con strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Elden Ring',
      platform: 'PC',
      score: '9.5',
      reviewer: 'GameSpot',
      pros: ['Massive open world', 'Deep combat system', 'Stunning visuals'],
      cons: ['Steep learning curve', 'Some performance issues'],
      citation: '',
    },
  },

  {
    id: 'settings-guide',
    label: 'Settings Guide',
    description: 'Optimal game settings guide',
    category: 'gaming',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'game', type: 'string', description: 'Game' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'settings',
        type: 'array',
        description: 'Array of {name, value, recommendation} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Optimal Settings',
      game: 'Valorant',
      description: 'Best settings for competitive play',
      settings: [
        {
          name: 'Resolution',
          value: '2560x1440',
          recommendation: '1920x1080',
        },
        {
          name: 'Graphics',
          value: 'Ultra',
          recommendation: 'Medium',
        },
        {
          name: 'FPS',
          value: 'Unlimited',
          recommendation: 'Capped at 240',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'setup-tour',
    label: 'Setup Tour',
    description: 'Gaming setup with components and cost',
    category: 'gaming',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'components',
        type: 'array',
        description: 'Array of {name, spec} objects',
      },
      { key: 'totalCost', type: 'string', description: 'Total cost' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'My Gaming Setup',
      description: 'The ultimate gaming station',
      components: [
        {
          name: 'Monitor',
          spec: '27" 4K 144Hz',
        },
        {
          name: 'Keyboard',
          spec: 'Mechanical RGB',
        },
        {
          name: 'Mouse',
          spec: 'Wireless 25K DPI',
        },
      ],
      totalCost: '$2,500',
      citation: '',
    },
  },

  {
    id: 'stat-tracker',
    label: 'Stat Tracker',
    description: 'Season stats with highlight badge',
    category: 'gaming',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'game', type: 'string', description: 'Game' },
      {
        key: 'stats',
        type: 'array',
        description: 'Array of {label, value} objects',
      },
      { key: 'highlight', type: 'string', description: 'Highlight badge' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Season Stats',
      game: 'League of Legends',
      stats: [
        {
          label: 'Wins',
          value: '142',
        },
        {
          label: 'Losses',
          value: '38',
        },
        {
          label: 'KDA',
          value: '4.2',
        },
        {
          label: 'CS/Min',
          value: '8.5',
        },
      ],
      highlight: 'Top 1%',
      citation: '',
    },
  },

  {
    id: 'tournament',
    label: 'Tournament',
    description: 'Tournament results with rankings',
    category: 'gaming',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'game', type: 'string', description: 'Game' },
      { key: 'date', type: 'string', description: 'Date' },
      {
        key: 'results',
        type: 'array',
        description: 'Array of {position, team, score} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Tournament Results',
      game: 'CS2',
      date: 'Jan 1, 2026',
      results: [
        {
          position: '1',
          team: 'Team Alpha',
          score: '16',
        },
        {
          position: '2',
          team: 'Team Beta',
          score: '12',
        },
        {
          position: '3',
          team: 'Team Gamma',
          score: '9',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'album-review',
    label: 'Album Review',
    description: 'Album review with star rating',
    category: 'music',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Album title' },
      { key: 'artist', type: 'string', description: 'Artist name' },
      { key: 'genre', type: 'string', description: 'Genre' },
      { key: 'rating', type: 'number', description: 'Rating out of 5' },
      { key: 'review', type: 'string', description: 'Review text' },
      { key: 'favoriteTrack', type: 'string', description: 'Favorite track' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Abbey Road',
      artist: 'The Beatles',
      genre: 'Rock',
      rating: 5,
      review: 'A masterpiece that showcases the band at their creative peak.',
      favoriteTrack: 'Come Together',
      citation: '',
    },
  },

  {
    id: 'chord-chart',
    label: 'Chord Chart',
    description: 'Guitar chord chart with finger positions',
    category: 'music',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      {
        key: 'chords',
        type: 'array',
        description: 'Array of {name, fingers} objects',
      },
      { key: 'difficulty', type: 'string', description: 'Difficulty' },
      { key: 'tip', type: 'string', description: 'Playing tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Basic Chords',
      chords: [
        {
          name: 'C',
          fingers: 'x32010',
        },
        {
          name: 'G',
          fingers: '320003',
        },
        {
          name: 'Am',
          fingers: 'x02210',
        },
        {
          name: 'Em',
          fingers: '022000',
        },
        {
          name: 'F',
          fingers: '133211',
        },
      ],
      difficulty: 'Beginner',
      tip: 'Practice transitioning between C, G, and Am',
      citation: '',
    },
  },

  {
    id: 'gear-review',
    label: 'Gear Review',
    description: 'Music gear review with pros and cons',
    category: 'music',
    group: 'Creative Expression',
    schema: [
      { key: 'name', type: 'string', description: 'Gear name' },
      { key: 'category', type: 'string', description: 'Category' },
      { key: 'rating', type: 'number', description: 'Rating out of 5' },
      { key: 'price', type: 'string', description: 'Price' },
      { key: 'pros', type: 'array', description: 'Array of pro strings' },
      { key: 'cons', type: 'array', description: 'Array of con strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Audio-Technica ATH-M50x',
      category: 'Headphones',
      rating: 5,
      price: '$149',
      pros: ['Excellent sound quality', 'Comfortable for long sessions', 'Durable build'],
      cons: ['Slightly heavy', 'Non-detachable cable on older models'],
      citation: '',
    },
  },

  {
    id: 'music-theory',
    label: 'Music Theory',
    description: 'Music theory concept explanation',
    category: 'music',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'concept', type: 'string', description: 'Concept name' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'examples',
        type: 'array',
        description: 'Array of example strings',
      },
      { key: 'tip', type: 'string', description: 'Learning tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Music Theory',
      concept: 'Chord Progressions',
      description:
        'The I-IV-V-I progression is the foundation of Western music and used in countless songs.',
      examples: [
        'I-IV-V-I in C: C-F-G-C',
        'I-V-vi-IV in G: G-D-Em-C',
        'ii-V-I in jazz: Dm-G7-Cmaj7',
      ],
      tip: 'Listen to songs and try to identify the progression by ear',
      citation: '',
    },
  },

  {
    id: 'playlist',
    label: 'Playlist',
    description: 'Music playlist with track listing',
    category: 'music',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Playlist title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'tracks',
        type: 'array',
        description: 'Array of {number, name, artist, duration} objects',
      },
      { key: 'totalDuration', type: 'string', description: 'Total duration' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Focus Flow',
      description: 'Deep concentration tracks',
      tracks: [
        {
          number: 1,
          name: 'Weightless',
          artist: 'Marconi Union',
          duration: '8:09',
        },
        {
          number: 2,
          name: 'Clair de Lune',
          artist: 'Debussy',
          duration: '5:01',
        },
        {
          number: 3,
          name: 'Gymnopédie No.1',
          artist: 'Satie',
          duration: '3:06',
        },
      ],
      totalDuration: '16:16',
      citation: '',
    },
  },

  {
    id: 'setlist',
    label: 'Setlist',
    description: 'Concert setlist with songs and encore',
    category: 'music',
    group: 'Creative Expression',
    schema: [
      { key: 'artist', type: 'string', description: 'Artist name' },
      { key: 'venue', type: 'string', description: 'Venue' },
      { key: 'date', type: 'string', description: 'Date' },
      {
        key: 'songs',
        type: 'array',
        description: 'Array of {number, title, album} objects',
      },
      {
        key: 'encore',
        type: 'array',
        description: 'Array of encore song strings',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      artist: 'Radiohead',
      venue: 'Madison Square Garden',
      date: 'Jun 15, 2026',
      songs: [
        {
          number: 1,
          title: 'Everything in Its Right Place',
          album: 'Kid A',
        },
        {
          number: 2,
          title: 'Paranoid Android',
          album: 'OK Computer',
        },
        {
          number: 3,
          title: 'Idioteque',
          album: 'Kid A',
        },
      ],
      encore: ['Creep', 'Karma Police'],
      citation: '',
    },
  },

  {
    id: 'book-quote',
    label: 'Book Quote',
    description: 'Quote from a book with page and genre',
    category: 'quotes',
    group: 'Creative Expression',
    schema: [
      { key: 'quote', type: 'string', description: 'Quote text' },
      { key: 'book', type: 'string', description: 'Book title' },
      { key: 'author', type: 'string', description: 'Author name' },
      { key: 'pageNumber', type: 'string', description: 'Page number' },
      { key: 'genre', type: 'string', description: 'Genre' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      quote: 'It is a truth universally acknowledged.',
      book: 'Pride and Prejudice',
      author: 'Jane Austen',
      pageNumber: '1',
      genre: 'Classic',
      citation: '',
    },
  },

  {
    id: 'daily-wisdom',
    label: 'Daily Wisdom',
    description: 'Daily wisdom quote with category',
    category: 'quotes',
    group: 'Creative Expression',
    schema: [
      { key: 'wisdom', type: 'string', description: 'Wisdom text' },
      { key: 'author', type: 'string', description: 'Author name' },
      { key: 'category', type: 'string', description: 'Category tag' },
      { key: 'date', type: 'string', description: 'Date' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      wisdom: 'Simplicity is the ultimate sophistication.',
      author: 'Leonardo da Vinci',
      category: 'Philosophy',
      date: 'Jul 13',
      citation: '',
    },
  },

  {
    id: 'famous-quote',
    label: 'Famous Quote',
    description: 'Famous quote with attribution',
    category: 'quotes',
    group: 'Creative Expression',
    schema: [
      { key: 'quote', type: 'string', description: 'Quote text' },
      { key: 'author', type: 'string', description: 'Author name' },
      { key: 'source', type: 'string', description: 'Source' },
      { key: 'year', type: 'string', description: 'Year' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      quote: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      source: 'Stanford commencement address',
      year: '2005',
      citation: '',
    },
  },

  {
    id: 'motivational-quote',
    label: 'Motivational Quote',
    description: 'Motivational quote with theme tag',
    category: 'quotes',
    group: 'Creative Expression',
    schema: [
      { key: 'quote', type: 'string', description: 'Quote text' },
      { key: 'author', type: 'string', description: 'Author name' },
      { key: 'theme', type: 'string', description: 'Theme tag' },
      { key: 'subtitle', type: 'string', description: 'Subtitle' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      quote: 'The future belongs to those who believe in the beauty of their dreams.',
      author: 'Eleanor Roosevelt',
      theme: 'Dreams',
      subtitle: 'Keep believing in yourself',
      citation: '',
    },
  },

  {
    id: 'movie-quote',
    label: 'Movie Quote',
    description: 'Iconic movie quote with character',
    category: 'quotes',
    group: 'Creative Expression',
    schema: [
      { key: 'quote', type: 'string', description: 'Quote text' },
      { key: 'movie', type: 'string', description: 'Movie title' },
      { key: 'character', type: 'string', description: 'Character name' },
      { key: 'year', type: 'string', description: 'Year' },
      { key: 'genre', type: 'string', description: 'Genre' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      quote: 'Life is like a box of chocolates.',
      movie: 'Forrest Gump',
      character: 'Forrest Gump',
      year: '1994',
      genre: 'Drama',
      citation: '',
    },
  },

  {
    id: 'song-lyric',
    label: 'Song Lyric',
    description: 'Song lyric with artist and album',
    category: 'quotes',
    group: 'Creative Expression',
    schema: [
      { key: 'lyric', type: 'string', description: 'Lyric text' },
      { key: 'song', type: 'string', description: 'Song title' },
      { key: 'artist', type: 'string', description: 'Artist name' },
      { key: 'album', type: 'string', description: 'Album name' },
      { key: 'year', type: 'string', description: 'Year' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      lyric: 'Imagine all the people living life in peace.',
      song: 'Imagine',
      artist: 'John Lennon',
      album: 'Imagine',
      year: '1971',
      citation: '',
    },
  },

  {
    id: 'character-sheet',
    label: 'Character Sheet',
    description: 'Character profile with traits and motivation',
    category: 'writing',
    group: 'Creative Expression',
    schema: [
      { key: 'name', type: 'string', description: 'Character name' },
      { key: 'role', type: 'string', description: 'Role' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      { key: 'traits', type: 'array', description: 'Array of trait strings' },
      { key: 'motivation', type: 'string', description: 'Motivation' },
      { key: 'flaw', type: 'string', description: 'Fatal flaw' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Elena Voss',
      role: 'Protagonist',
      description: 'A determined journalist uncovering a conspiracy.',
      traits: ['Brave', 'Curious', 'Flawed'],
      motivation: 'Truth and justice',
      flaw: 'Reckless ambition',
      citation: '',
    },
  },

  {
    id: 'editing-checklist',
    label: 'Editing Checklist',
    description: 'Writing editing checklist by category',
    category: 'writing',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'categories',
        type: 'array',
        description: 'Array of {name, items} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Editing Checklist',
      description: 'A comprehensive checklist for self-editing.',
      categories: [
        {
          name: 'Structure',
          items: ['Clear thesis', 'Logical flow', 'Strong conclusion'],
        },
        {
          name: 'Language',
          items: ['Grammar correct', 'Varied sentence length', 'Active voice'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'genre-guide',
    label: 'Genre Guide',
    description: 'Writing genre guide with required elements',
    category: 'writing',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'genre', type: 'string', description: 'Genre' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'elements',
        type: 'array',
        description: 'Array of element strings',
      },
      {
        key: 'examples',
        type: 'array',
        description: 'Array of example strings',
      },
      { key: 'tip', type: 'string', description: 'Writing tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Genre Guide',
      genre: 'Mystery',
      description: 'A genre focused on solving a crime or puzzle.',
      elements: ['Clues', 'Red herrings', 'Revelation'],
      examples: ['Sherlock Holmes', 'Gone Girl'],
      tip: 'Plant clues early and play fair with the reader',
      citation: '',
    },
  },

  {
    id: 'story-structure',
    label: 'Story Structure',
    description: 'Story structure breakdown with elements',
    category: 'writing',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'structure', type: 'string', description: 'Structure type' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'elements',
        type: 'array',
        description: 'Array of {name, description} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Story Structure',
      structure: 'Three-Act Structure',
      description: 'The most common narrative framework used in storytelling.',
      elements: [
        {
          name: 'Setup',
          description: 'Introduce characters and world',
        },
        {
          name: 'Confrontation',
          description: 'Rising conflict and stakes',
        },
        {
          name: 'Resolution',
          description: 'Climax and resolution',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'world-building',
    label: 'World Building',
    description: 'World building template with aspects and rules',
    category: 'writing',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'worldName', type: 'string', description: 'World name' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'aspects',
        type: 'array',
        description: 'Array of {name, detail} objects',
      },
      { key: 'rules', type: 'array', description: 'Array of rule strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'World Building',
      worldName: 'New World',
      description: 'A fantasy realm with ancient magic and political intrigue.',
      aspects: [
        {
          name: 'Geography',
          detail: 'Diverse landscapes and climates',
        },
        {
          name: 'Culture',
          detail: 'Unique traditions and beliefs',
        },
        {
          name: 'Technology',
          detail: 'Level of advancement',
        },
      ],
      rules: ['Magic has a cost', 'Actions have consequences'],
      citation: '',
    },
  },

  {
    id: 'writing-prompt',
    label: 'Writing Prompt',
    description: 'Creative writing prompt with genre',
    category: 'writing',
    group: 'Creative Expression',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'prompt', type: 'string', description: 'Writing prompt' },
      { key: 'genre', type: 'string', description: 'Genre' },
      { key: 'difficulty', type: 'string', description: 'Difficulty' },
      { key: 'wordCount', type: 'string', description: 'Target word count' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Writing Prompt',
      prompt:
        "Write about a character who discovers a hidden room in their house that shouldn't exist.",
      genre: 'Fiction',
      difficulty: 'Intermediate',
      wordCount: '500',
      citation: '',
    },
  },

  {
    id: 'aspect-ratio',
    label: 'Aspect Ratio',
    description: 'Image aspect ratio showcase',
    category: 'analytics',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Showcase title' },
      {
        key: 'ratios',
        type: 'array',
        description: 'Array of {label, description} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Common Ratios',
      ratios: [
        {
          label: '1:1',
          description: 'Instagram Feed',
        },
        {
          label: '4:5',
          description: 'Instagram Portrait',
        },
        {
          label: '16:9',
          description: 'YouTube Thumbnail',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'book-review',
    label: 'Book Review',
    description: 'Book card with star rating and review text',
    category: 'analytics',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Book title' },
      { key: 'author', type: 'string', description: 'Author name' },
      { key: 'rating', type: 'number', description: 'Star rating 1-5' },
      { key: 'review', type: 'string', description: 'Review text' },
      { key: 'genre', type: 'string', description: 'Book genre' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Atomic Habits',
      author: 'James Clear',
      rating: 5,
      review:
        'A practical guide to building good habits and breaking bad ones. Clear and actionable.',
      genre: 'Self-help',
      citation: '',
    },
  },

  {
    id: 'references',
    label: 'References',
    description: 'Academic or professional references list',
    category: 'analytics',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'items',
        type: 'array<{author?, title?, year?, url?}>',
        description: 'Reference items',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'References',
      items: [
        {
          author: 'Smith, J.',
          title: 'Design Systems at Scale',
          year: '2023',
          url: 'https://example.com/design-systems',
        },
        {
          author: 'Johnson, A.',
          title: 'Modern UI Patterns',
          year: '2022',
          url: 'https://example.com/ui-patterns',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'donut-chart',
    label: 'Donut Chart',
    description: 'Donut/ring chart with percentage segments',
    category: 'analytics',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      {
        key: 'segments',
        type: 'array',
        description: 'Array of {label, pct} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Market Share',
      segments: [
        {
          label: 'Chrome',
          pct: 65,
        },
        {
          label: 'Firefox',
          pct: 18,
        },
        {
          label: 'Safari',
          pct: 12,
        },
        {
          label: 'Other',
          pct: 5,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'notification',
    label: 'Notification',
    description: 'Phone notification mockup',
    category: 'analytics',
    group: 'Data & Visualization',
    schema: [
      { key: 'app', type: 'string', description: 'App name' },
      { key: 'title', type: 'string', description: 'Notification title' },
      { key: 'body', type: 'string', description: 'Notification body' },
      { key: 'time', type: 'string', description: 'Time stamp' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      app: 'Messages',
      title: 'Alex Chen',
      body: 'Are we still on for tomorrow?',
      time: 'now',
      citation: '',
    },
  },

  {
    id: 'status-grid',
    label: 'Status Grid',
    description: 'Service health status grid',
    category: 'analytics',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Grid title' },
      {
        key: 'services',
        type: 'array',
        description: 'Array of {name, status} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'System Status',
      services: [
        {
          name: 'API',
          status: 'Operational',
        },
        {
          name: 'Database',
          status: 'Operational',
        },
        {
          name: 'CDN',
          status: 'Degraded',
        },
        {
          name: 'Auth',
          status: 'Operational',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'area-chart',
    label: 'Area Chart',
    description: 'Filled area chart with grid lines and data points',
    category: 'charts',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'points',
        type: 'array<{label: string, value: number}>',
        description: 'Data points with label and value',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'User Growth',
      text: 'Monthly active user acquisition trend',
      points: [
        {
          label: 'Jan',
          value: 20,
        },
        {
          label: 'Feb',
          value: 35,
        },
        {
          label: 'Mar',
          value: 50,
        },
        {
          label: 'Apr',
          value: 45,
        },
        {
          label: 'May',
          value: 70,
        },
        {
          label: 'Jun',
          value: 60,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'bar-chart',
    label: 'Bar Chart',
    description: 'Vertical bar chart with rounded bars and value labels',
    category: 'charts',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'items',
        type: 'array<{label: string, value: number}>',
        description: 'Bar items with label and value',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Sales by Quarter',
      text: 'Quarterly sales performance breakdown',
      items: [
        {
          label: 'Q1',
          value: 65,
        },
        {
          label: 'Q2',
          value: 90,
        },
        {
          label: 'Q3',
          value: 45,
        },
        {
          label: 'Q4',
          value: 80,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'pie-chart',
    label: 'Pie Chart',
    description: 'Pie chart with percentage labels and legend',
    category: 'charts',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'slices',
        type: 'array<{label: string, value: number}>',
        description: 'Pie slices with label and value',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Traffic Sources',
      text: 'Where our visitors come from',
      slices: [
        {
          label: 'Direct',
          value: 40,
        },
        {
          label: 'Organic',
          value: 25,
        },
        {
          label: 'Referral',
          value: 20,
        },
        {
          label: 'Social',
          value: 15,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'progress-ring',
    label: 'Progress Ring',
    description: 'Circular SVG progress indicator with percentage',
    category: 'charts',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'value',
        type: 'number',
        description: 'Progress percentage 0-100',
      },
      { key: 'label', type: 'string', description: 'Label below the ring' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Completion Rate',
      text: 'Overall project progress',
      value: 73,
      label: 'of tasks completed',
      citation: '',
    },
  },

  {
    id: 'radar-chart',
    label: 'Radar Chart',
    description: 'Radar/spider chart with concentric rings and axis labels',
    category: 'charts',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'axes',
        type: 'array<{label: string, value: number}>',
        description: 'Radar axes with label and value (0-100)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Skill Assessment',
      text: 'Overall performance across key attributes',
      axes: [
        {
          label: 'Speed',
          value: 80,
        },
        {
          label: 'Power',
          value: 65,
        },
        {
          label: 'Defense',
          value: 90,
        },
        {
          label: 'Agility',
          value: 50,
        },
        {
          label: 'Stamina',
          value: 75,
        },
        {
          label: 'Skill',
          value: 60,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'scatter-chart',
    label: 'Scatter Plot',
    description: 'Scatter plot with grid lines and axis labels',
    category: 'charts',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'points',
        type: 'array<{x: number, y: number, label?: string}>',
        description: 'Data points with x/y coordinates and optional label',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Performance Analysis',
      text: 'Correlation between input and output metrics',
      points: [
        {
          x: 10,
          y: 25,
        },
        {
          x: 20,
          y: 40,
        },
        {
          x: 35,
          y: 30,
        },
        {
          x: 50,
          y: 65,
        },
        {
          x: 65,
          y: 55,
        },
        {
          x: 80,
          y: 75,
        },
        {
          x: 90,
          y: 60,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'comparison',
    label: 'Comparison',
    description: 'Side-by-side Before and After columns',
    category: 'compare',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'before', type: 'object', description: '{label, text}' },
      { key: 'after', type: 'object', description: '{label, text}' },
      { key: 'imageUrl', type: 'string', description: 'Optional shared image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Before vs After',
      before: {
        label: 'Before',
        text: 'Manual process took 4 hours per report with frequent errors.',
      },
      after: {
        label: 'After',
        text: 'Automated pipeline runs in 5 minutes with 99.9% accuracy.',
      },
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'feature-table',
    label: 'Feature Table',
    description: 'Feature comparison table with checkmark indicators',
    category: 'compare',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Table title' },
      { key: 'features', type: 'string[]', description: 'Feature names' },
      {
        key: 'plans',
        type: 'array<{name, values}>',
        description: 'Plans with feature values',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Compare Plans',
      features: [
        'Unlimited projects',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom branding',
      ],
      plans: [
        {
          name: 'Free',
          values: ['✓', '—', '—', '—', '—'],
        },
        {
          name: 'Pro',
          values: ['✓', '✓', '✓', '—', '—'],
        },
        {
          name: 'Enterprise',
          values: ['✓', '✓', '✓', '✓', '✓'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'myth-vs-fact',
    label: 'Myth vs Fact',
    description: 'Side-by-side myth busting with X and checkmark icons',
    category: 'compare',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'myth', type: 'string', description: 'The misconception' },
      { key: 'fact', type: 'string', description: 'The truth' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Common Misconceptions',
      myth: 'Eating at night causes weight gain by itself.',
      fact: 'Total calorie intake matters most, not the time of day you eat.',
      citation: '',
    },
  },

  {
    id: 'proscons',
    label: 'Pros & Cons',
    description: 'Two-column pros and cons comparison',
    category: 'compare',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'pros', type: 'array', description: 'Array of pro strings' },
      { key: 'cons', type: 'array', description: 'Array of con strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Pros & Cons',
      pros: ['Fast setup', 'Low cost', 'Easy to use'],
      cons: ['Limited features', 'Steep learning curve'],
      citation: '',
    },
  },

  {
    id: 'split-screen',
    label: 'Split Screen',
    description: 'Image left, headline and text right',
    category: 'compare',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'imageUrl', type: 'string', description: 'URL to an image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Less is More',
      text: 'Simplicity is the ultimate sophistication. Every element must earn its place through purpose.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'versus',
    label: 'Versus',
    description: 'Two-item feature-by-feature comparison',
    category: 'compare',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'optionA', type: 'object', description: '{label, desc}' },
      { key: 'optionB', type: 'object', description: '{label, desc}' },
      {
        key: 'features',
        type: 'array',
        description: 'Array of {a, b} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Versus',
      optionA: {
        label: 'Free',
        desc: '',
      },
      optionB: {
        label: 'Pro',
        desc: '',
      },
      features: [
        {
          a: 'Basic analytics',
          b: 'Advanced analytics',
        },
        {
          a: '1 user',
          b: 'Unlimited users',
        },
        {
          a: 'Email support',
          b: 'Priority support',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'data-stats',
    label: 'Data/Stats',
    description: 'Large centered statistic with supporting text',
    category: 'data',
    group: 'Data & Visualization',
    schema: [
      {
        key: 'stat',
        type: 'string',
        description: 'Large statistic (e.g. 84%)',
      },
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Supporting paragraph' },
      {
        key: 'imageUrl',
        type: 'string',
        description: 'Optional background image',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      stat: '84%',
      title: 'User Satisfaction',
      text: 'Based on survey responses from over 10,000 active users across 50 countries.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'feature-grid',
    label: 'Feature Grid',
    description: 'A 2x2 grid of feature blocks with icons',
    category: 'data',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      {
        key: 'features',
        type: 'array',
        description: 'Array of {label, desc} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Why Choose Us',
      features: [
        {
          label: 'Fast',
          desc: 'Optimized for speed and performance',
        },
        {
          label: 'Secure',
          desc: 'End-to-end encryption by default',
        },
        {
          label: 'Simple',
          desc: 'Minimal learning curve',
        },
        {
          label: 'Scalable',
          desc: 'Grows with your needs',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'progress-list',
    label: 'Progress List',
    description: 'Items with progress bars and percentages',
    category: 'data',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      {
        key: 'items',
        type: 'array',
        description: 'Array of {label, pct} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Progress',
      items: [
        {
          label: 'Design',
          pct: 90,
        },
        {
          label: 'Development',
          pct: 65,
        },
        {
          label: 'Testing',
          pct: 40,
        },
        {
          label: 'Deployment',
          pct: 20,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'sparkline',
    label: 'Sparkline',
    description: 'Mini sparkline trend chart',
    category: 'data',
    group: 'Data & Visualization',
    schema: [
      { key: 'label', type: 'string', description: 'Chart label' },
      { key: 'values', type: 'array', description: 'Array of numbers' },
      { key: 'current', type: 'string', description: 'Current value' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      label: 'Revenue Trend',
      values: [20, 35, 25, 45, 40, 55, 50, 65, 60, 75],
      current: '$75K',
      citation: '',
    },
  },

  {
    id: 'stat-row',
    label: 'Stat Row',
    description: 'Row of 3 statistics with values and labels',
    category: 'data',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      {
        key: 'text',
        type: 'string',
        description: 'Description text under headline',
      },
      {
        key: 'stats',
        type: 'array',
        description: 'Array of {value, label} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'By the Numbers',
      text: '',
      stats: [
        {
          value: '10K+',
          label: 'Users',
        },
        {
          value: '99.9%',
          label: 'Uptime',
        },
        {
          value: '24/7',
          label: 'Support',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Chronological entries with date and event',
    category: 'data',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Timeline title' },
      {
        key: 'entries',
        type: 'array',
        description: 'Array of {date, event} objects',
      },
      { key: 'imageUrl', type: 'string', description: 'Optional bottom image' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Project Milestones',
      entries: [
        {
          date: 'Q1 2024',
          event: 'Research phase complete',
        },
        {
          date: 'Q2 2024',
          event: 'MVP development started',
        },
        {
          date: 'Q3 2024',
          event: 'Beta launch',
        },
        {
          date: 'Q4 2024',
          event: 'Public release',
        },
      ],
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'confusion-matrix',
    label: 'Confusion Matrix',
    description: 'TP/TN/FP/FN classification grid with accuracy',
    category: 'data-science',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Matrix title' },
      {
        key: 'classes',
        type: 'string[]',
        description: 'Class labels (2 items)',
      },
      { key: 'tp', type: 'number', description: 'True Positives' },
      { key: 'tn', type: 'number', description: 'True Negatives' },
      { key: 'fp', type: 'number', description: 'False Positives' },
      { key: 'fn', type: 'number', description: 'False Negatives' },
      { key: 'accuracy', type: 'string', description: 'Overall accuracy' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Email Spam Classifier',
      classes: ['Spam', 'Not Spam'],
      tp: 420,
      tn: 380,
      fp: 15,
      fn: 25,
      accuracy: '94.6%',
      citation: '',
    },
  },

  {
    id: 'data-table',
    label: 'Data Table',
    description: 'Tabular data with header and alternating rows',
    category: 'data-science',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Table title' },
      { key: 'columns', type: 'string[]', description: 'Column headers' },
      { key: 'rows', type: 'string[][]', description: 'Table rows' },
      {
        key: 'text',
        type: 'string',
        description: 'Description text under the table',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Quarterly Results',
      columns: ['Quarter', 'Revenue', 'Growth', 'Status'],
      rows: [
        {
          0: 'Q1 2024',
          1: '$2.4M',
          2: '+12%',
          3: 'On track',
        },
        {
          0: 'Q2 2024',
          1: '$3.1M',
          2: '+29%',
          3: 'Exceeded',
        },
        {
          0: 'Q3 2024',
          1: '$2.8M',
          2: '-10%',
          3: 'Review',
        },
        {
          0: 'Q4 2024',
          1: '$3.5M',
          2: '+25%',
          3: 'On track',
        },
      ],
      text: 'Q2 and Q4 showed strong growth driven by new product launches. Q3 dip was due to seasonal factors and has since recovered.',
      citation: '',
    },
  },

  {
    id: 'heatmap-grid',
    label: 'Heatmap Grid',
    description: 'Color-intensity matrix grid',
    category: 'data-science',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Grid title' },
      { key: 'rows', type: 'string[]', description: 'Row labels' },
      { key: 'cols', type: 'string[]', description: 'Column labels' },
      {
        key: 'values',
        type: 'number[][]',
        description: '2D array of values 0-100',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Activity Heatmap',
      rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      cols: ['9am', '12pm', '3pm', '6pm'],
      values: [
        {
          0: 20,
          1: 80,
          2: 60,
          3: 30,
        },
        {
          0: 40,
          1: 90,
          2: 70,
          3: 50,
        },
        {
          0: 10,
          1: 60,
          2: 80,
          3: 40,
        },
        {
          0: 30,
          1: 70,
          2: 90,
          3: 60,
        },
        {
          0: 50,
          1: 80,
          2: 50,
          3: 20,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'hypothesis-card',
    label: 'Hypothesis Card',
    description: 'Research hypothesis with variables and method',
    category: 'data-science',
    group: 'Data & Visualization',
    schema: [
      { key: 'hypothesis', type: 'string', description: 'The hypothesis' },
      {
        key: 'variables',
        type: 'array',
        description: 'Array of {name, type} objects',
      },
      { key: 'method', type: 'string', description: 'Research method' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      hypothesis: 'Users who see personalized content engage 40% more',
      variables: [
        {
          name: 'Content type',
          type: 'Independent',
        },
        {
          name: 'Engagement rate',
          type: 'Dependent',
        },
      ],
      method: 'A/B Testing',
      citation: '',
    },
  },

  {
    id: 'loss-curve',
    label: 'Loss Curve',
    description: 'Training and validation loss over epochs',
    category: 'data-science',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Chart title' },
      { key: 'epochs', type: 'number', description: 'Total epochs' },
      {
        key: 'trainLoss',
        type: 'number[]',
        description: 'Training loss per epoch',
      },
      {
        key: 'valLoss',
        type: 'number[]',
        description: 'Validation loss per epoch',
      },
      {
        key: 'bestEpoch',
        type: 'number',
        description: 'Epoch with best val loss',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Training Progress',
      epochs: 20,
      trainLoss: [
        2.1, 1.5, 1.1, 0.85, 0.7, 0.58, 0.5, 0.45, 0.42, 0.4, 0.38, 0.37, 0.36, 0.35, 0.35, 0.34,
        0.34, 0.33, 0.33, 0.33,
      ],
      valLoss: [
        2.2, 1.6, 1.2, 0.95, 0.8, 0.7, 0.65, 0.62, 0.6, 0.59, 0.58, 0.58, 0.59, 0.6, 0.61, 0.62,
        0.63, 0.64, 0.65, 0.66,
      ],
      bestEpoch: 11,
      citation: '',
    },
  },

  {
    id: 'model-comparison',
    label: 'Model Comparison',
    description: 'Side-by-side ML model metrics table',
    category: 'data-science',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Comparison title' },
      {
        key: 'models',
        type: 'array<{name, accuracy, f1, precision, recall, latency}>',
        description: 'Model metrics',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Classification Models',
      models: [
        {
          name: 'Logistic Reg',
          accuracy: '89.2%',
          f1: '0.88',
          precision: '0.91',
          recall: '0.85',
          latency: '2ms',
        },
        {
          name: 'Random Forest',
          accuracy: '93.1%',
          f1: '0.92',
          precision: '0.94',
          recall: '0.90',
          latency: '15ms',
        },
        {
          name: 'XGBoost',
          accuracy: '94.5%',
          f1: '0.94',
          precision: '0.95',
          recall: '0.93',
          latency: '8ms',
        },
        {
          name: 'Neural Net',
          accuracy: '93.8%',
          f1: '0.93',
          precision: '0.92',
          recall: '0.94',
          latency: '45ms',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'api-endpoint',
    label: 'API Endpoint',
    description: 'REST method, path, parameters, and response example',
    category: 'dev',
    group: 'Data & Visualization',
    schema: [
      {
        key: 'method',
        type: 'string',
        description: 'HTTP method (GET, POST, PUT, DELETE)',
      },
      { key: 'path', type: 'string', description: 'Endpoint path' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Endpoint description',
      },
      {
        key: 'params',
        type: 'array<{name, type, desc}>',
        description: 'Request parameters',
      },
      {
        key: 'responseExample',
        type: 'string',
        description: 'Example response body',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      method: 'GET',
      path: '/api/v1/users/:id',
      description: 'Retrieve a user by their unique identifier',
      params: [
        {
          name: 'id',
          type: 'string',
          description: 'User ID (path param)',
        },
        {
          name: 'fields',
          type: 'string',
          description: 'Comma-separated fields to include',
        },
      ],
      responseExample:
        '{\n  "id": "usr_abc123",\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}',
      citation: '',
    },
  },

  {
    id: 'architecture-diagram',
    label: 'Architecture Diagram',
    description: 'System components with connection arrows and labels',
    category: 'dev',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Diagram title' },
      {
        key: 'components',
        type: 'array<{name, desc}>',
        description: 'System components',
      },
      {
        key: 'connections',
        type: 'array<{from, to, label}>',
        description: 'Connections between components',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Microservices Architecture',
      components: [
        {
          name: 'API Gateway',
          desc: 'Routes requests to services',
        },
        {
          name: 'Auth Service',
          desc: 'JWT validation & sessions',
        },
        {
          name: 'User Service',
          desc: 'User CRUD operations',
        },
        {
          name: 'PostgreSQL',
          desc: 'Primary data store',
        },
      ],
      connections: [
        {
          from: 'API Gateway',
          to: 'Auth Service',
          label: 'validates',
        },
        {
          from: 'API Gateway',
          to: 'User Service',
          label: 'delegates',
        },
        {
          from: 'User Service',
          to: 'PostgreSQL',
          label: 'queries',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'changelog',
    label: 'Changelog',
    description: 'Version changelog with typed changes',
    category: 'dev',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Project name' },
      { key: 'version', type: 'string', description: 'Version number' },
      { key: 'date', type: 'string', description: 'Release date' },
      {
        key: 'changes',
        type: 'array<{type, description}>',
        description: 'Change entries (added/fixed/changed/removed)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'App Release',
      version: 'v2.4.0',
      date: 'March 15, 2025',
      changes: [
        {
          type: 'added',
          description: 'Dark mode support',
        },
        {
          type: 'added',
          description: 'Export to PDF feature',
        },
        {
          type: 'fixed',
          description: 'Login timeout issue',
        },
        {
          type: 'changed',
          description: 'Updated navigation layout',
        },
        {
          type: 'removed',
          description: 'Deprecated legacy API endpoints',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'database-schema',
    label: 'Database Schema',
    description: 'Database table schema visualization',
    category: 'dev',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Schema title' },
      {
        key: 'tables',
        type: 'array<{name, columns}>',
        description: 'Database tables',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Database Schema',
      tables: [
        {
          name: 'users',
          columns: [
            {
              name: 'id',
              type: 'UUID',
              pk: true,
            },
            {
              name: 'email',
              type: 'VARCHAR(255)',
            },
            {
              name: 'name',
              type: 'VARCHAR(100)',
            },
            {
              name: 'created_at',
              type: 'TIMESTAMP',
            },
          ],
        },
        {
          name: 'posts',
          columns: [
            {
              name: 'id',
              type: 'UUID',
              pk: true,
            },
            {
              name: 'user_id',
              type: 'UUID',
            },
            {
              name: 'title',
              type: 'VARCHAR(255)',
            },
            {
              name: 'body',
              type: 'TEXT',
            },
          ],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'dependency-graph',
    label: 'Dependency Graph',
    description: 'Package dependency visualization',
    category: 'dev',
    group: 'Data & Visualization',
    schema: [
      { key: 'title', type: 'string', description: 'Graph title' },
      {
        key: 'nodes',
        type: 'array<{name, version}>',
        description: 'Graph nodes',
      },
      {
        key: 'edges',
        type: 'array<{from, to}>',
        description: 'Connections between nodes',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Package Dependencies',
      nodes: [
        {
          name: 'app',
          version: '1.0.0',
        },
        {
          name: 'react',
          version: '18.2.0',
        },
        {
          name: 'router',
          version: '6.20.0',
        },
        {
          name: 'state',
          version: '4.5.0',
        },
        {
          name: 'ui-lib',
          version: '2.3.0',
        },
      ],
      edges: [
        {
          from: 'app',
          to: 'react',
        },
        {
          from: 'app',
          to: 'router',
        },
        {
          from: 'app',
          to: 'state',
        },
        {
          from: 'app',
          to: 'ui-lib',
        },
        {
          from: 'router',
          to: 'react',
        },
        {
          from: 'state',
          to: 'react',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'git-graph',
    label: 'Git Graph',
    description: 'Branch and commit DAG visualization',
    category: 'dev',
    group: 'Data & Visualization',
    schema: [
      {
        key: 'title',
        type: 'string',
        description: 'Repository or section title',
      },
      {
        key: 'branches',
        type: 'array<{name, commits}>',
        description: 'Branches with their commits',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Feature Branch Workflow',
      branches: [
        {
          name: 'main',
          commits: [
            {
              id: 'a1b2c3d',
              message: 'Initial release',
            },
            {
              id: 'e4f5g6h',
              message: 'Merge feature/auth',
              merge: true,
            },
          ],
        },
        {
          name: 'feature/auth',
          commits: [
            {
              id: 'i7j8k9l',
              message: 'Add login endpoint',
            },
            {
              id: 'm0n1o2p',
              message: 'Add JWT middleware',
            },
          ],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'deadline',
    label: 'Deadline',
    description: 'Big days-left number with task name',
    category: 'countdown',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'daysLeft', type: 'string', description: 'Days remaining' },
      { key: 'task', type: 'string', description: 'Task name' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Deadline',
      daysLeft: '5',
      task: 'Final submission',
      text: '',
      citation: '',
    },
  },

  {
    id: 'event-timer',
    label: 'Event Timer',
    description: 'Large time-left display with event name and date',
    category: 'countdown',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'eventName', type: 'string', description: 'Event name' },
      { key: 'timeLeft', type: 'string', description: 'Time remaining' },
      { key: 'date', type: 'string', description: 'Event date' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Event Timer',
      eventName: 'Annual Conference',
      timeLeft: '3d 12h 45m',
      date: 'Mar 15, 2025',
      text: '',
      citation: '',
    },
  },

  {
    id: 'goal-tracker',
    label: 'Goal Tracker',
    description: 'Progress bar with percentage and current/target values',
    category: 'countdown',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'goal', type: 'string', description: 'Goal description' },
      { key: 'current', type: 'number', description: 'Current value' },
      { key: 'target', type: 'number', description: 'Target value' },
      { key: 'unit', type: 'string', description: 'Unit suffix' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Goal Tracker',
      goal: 'Ship 100 commits',
      current: 73,
      target: 100,
      unit: '',
      text: '',
      citation: '',
    },
  },

  {
    id: 'launch-countdown',
    label: 'Launch Countdown',
    description: 'Countdown timer with days, hours, minutes, seconds',
    category: 'countdown',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Countdown title' },
      { key: 'date', type: 'string', description: 'Target date string' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Coming Soon',
      date: '2025-03-01',
      text: '',
      citation: '',
    },
  },

  {
    id: 'milestone',
    label: 'Milestone',
    description: 'Current vs target with milestone name',
    category: 'countdown',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'milestone', type: 'string', description: 'Milestone name' },
      { key: 'current', type: 'string', description: 'Current value' },
      { key: 'target', type: 'string', description: 'Target value' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Milestone',
      milestone: '10K Followers',
      current: '9,847',
      target: '10,000',
      text: '',
      citation: '',
    },
  },

  {
    id: 'speed-run',
    label: 'Speed Run',
    description: 'Best time record with attempt count',
    category: 'countdown',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'task', type: 'string', description: 'Task description' },
      { key: 'record', type: 'string', description: 'Best time' },
      { key: 'attempts', type: 'string', description: 'Number of attempts' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Speed Run',
      task: 'Build a landing page',
      record: '2h 15m',
      attempts: '12',
      text: '',
      citation: '',
    },
  },

  {
    id: 'browser',
    label: 'Browser',
    description: 'Browser window with URL bar and page content',
    category: 'device',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'url', type: 'string', description: 'Website URL' },
      { key: 'pageTitle', type: 'string', description: 'Browser tab title' },
      { key: 'title', type: 'string', description: 'Page title' },
      { key: 'subtitle', type: 'string', description: 'Description text' },
      { key: 'image', type: 'string', description: '16:9 content image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      url: 'example.com',
      pageTitle: 'Welcome',
      title: 'Your Site',
      description: 'A modern web experience for everyone',
      image: '',
      citation: '',
    },
  },

  {
    id: 'desktop',
    label: 'File Tree',
    description: 'Explorer-style file tree showing project structure',
    category: 'device',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Project title' },
      { key: 'subtitle', type: 'string', description: 'Description text' },
      {
        key: 'tree',
        type: 'string',
        description: 'Indented file/folder tree (2 spaces per depth)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Project Structure',
      description: 'Well-organised codebase with clear separation of concerns.',
      tree: 'src/\n  components/\n    Button.tsx\n    Header.tsx\n  hooks/\n    useAuth.ts\n  utils/\n    api.ts\n  App.tsx\n  index.ts\npackage.json\ntsconfig.json',
      citation: '',
    },
  },

  {
    id: 'laptop',
    label: 'Code',
    description: 'Code snippet card with syntax block and line numbers',
    category: 'device',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Code title' },
      { key: 'subtitle', type: 'string', description: 'Description text' },
      { key: 'code', type: 'string', description: 'Multi-line code snippet' },
      {
        key: 'language',
        type: 'string',
        description: 'Programming language label',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Snippet',
      description: 'Clean and readable code example.',
      code: 'import { useState } from "react";\n\nconst App = () => {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n};',
      language: 'TypeScript',
      citation: '',
    },
  },

  {
    id: 'mobile',
    label: 'Mobile',
    description: 'Phone mockup with app metrics and stats',
    category: 'device',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'App name or title' },
      { key: 'subtitle', type: 'string', description: 'Description text' },
      { key: 'image', type: 'string', description: '9:16 content image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'FitTrack',
      description: 'Track your daily activity and stay motivated',
      image: '',
      citation: '',
    },
  },

  {
    id: 'smart-watch',
    label: 'Smart Watch',
    description: 'Watch face showing time and fitness metrics',
    category: 'device',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Watch title' },
      { key: 'subtitle', type: 'string', description: 'Description text' },
      { key: 'image', type: 'string', description: '1:1 watch face image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Health Watch',
      description: 'Track your fitness goals with style',
      image: '',
      citation: '',
    },
  },

  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Dark terminal window with command and output',
    category: 'device',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Terminal title' },
      { key: 'subtitle', type: 'string', description: 'Description text' },
      { key: 'command', type: 'string', description: 'Shell command' },
      { key: 'output', type: 'string', description: 'Command output' },
      { key: 'syntax', type: 'string', description: 'Code or syntax block' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Deploy Script',
      description: 'A quick deployment script for your project',
      command: 'npm run deploy',
      output: 'Deploying to production...',
      syntax: '✓ Build complete\n✓ Tests passed\n✓ Deployed v2.4.1',
      citation: '',
    },
  },

  {
    id: 'camera-settings',
    label: 'Camera Settings',
    description: 'Camera settings display with mode and tip',
    category: 'photography',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'camera', type: 'string', description: 'Camera name' },
      {
        key: 'settings',
        type: 'array',
        description: 'Array of {label, value} objects',
      },
      { key: 'mode', type: 'string', description: 'Shooting mode' },
      { key: 'tip', type: 'string', description: 'Photography tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      camera: 'Sony A7IV',
      settings: [
        {
          label: 'Aperture',
          value: 'f/2.8',
        },
        {
          label: 'Shutter',
          value: '1/200s',
        },
        {
          label: 'ISO',
          value: '400',
        },
        {
          label: 'Focal',
          value: '85mm',
        },
      ],
      mode: 'Portrait',
      tip: 'Use a wide aperture for beautiful bokeh',
      citation: '',
    },
  },

  {
    id: 'composition',
    label: 'Composition',
    description: 'Composition rules and tips',
    category: 'photography',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'rule', type: 'string', description: 'Rule name' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      { key: 'tips', type: 'array', description: 'Array of tip strings' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Composition',
      rule: 'Rule of Thirds',
      description: 'Divide your frame into a 3x3 grid and place subjects along the lines.',
      tips: [
        'Place horizons on the upper or lower third',
        'Align subjects with intersection points',
        'Leave space in the direction of movement',
      ],
      citation: '',
    },
  },

  {
    id: 'lens-guide',
    label: 'Lens Guide',
    description: 'Camera lens comparison guide',
    category: 'photography',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      {
        key: 'lenses',
        type: 'array',
        description: 'Array of {name, focalLength, aperture, use} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Lens Guide',
      lenses: [
        {
          name: 'Wide Angle',
          focalLength: '16-35mm',
          aperture: 'f/2.8',
          use: 'Landscapes',
        },
        {
          name: 'Standard',
          focalLength: '50mm',
          aperture: 'f/1.8',
          use: 'Street / Portrait',
        },
        {
          name: 'Telephoto',
          focalLength: '70-200mm',
          aperture: 'f/2.8',
          use: 'Sports / Wildlife',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'lighting-tips',
    label: 'Lighting Tips',
    description: 'Lighting setup and technique tips',
    category: 'photography',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'setup', type: 'string', description: 'Lighting setup' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'tips',
        type: 'array',
        description: 'Array of {label, desc} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Lighting Tips',
      setup: 'Three-Point Lighting',
      description: 'The classic setup for portrait and studio photography.',
      tips: [
        {
          label: 'Key Light',
          desc: 'Main light source, placed 45° to the subject',
        },
        {
          label: 'Fill Light',
          desc: 'Softens shadows on the opposite side',
        },
        {
          label: 'Back Light',
          desc: 'Separates subject from background',
        },
        {
          label: 'Modifier',
          desc: 'Use softboxes or umbrellas to diffuse',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'mood-board',
    label: 'Mood Board',
    description: 'Visual mood board with themes and keywords',
    category: 'photography',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      {
        key: 'themes',
        type: 'array',
        description: 'Array of {name, color} objects',
      },
      {
        key: 'keywords',
        type: 'array',
        description: 'Array of keyword strings',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Mood Board',
      description: 'Inspiration for an autumn photoshoot',
      themes: [
        {
          name: 'Warm',
          color: '#f97316',
        },
        {
          name: 'Rustic',
          color: '#92400e',
        },
        {
          name: 'Golden',
          color: '#eab308',
        },
      ],
      keywords: ['autumn', 'golden hour', 'cozy', 'nature', 'warm tones'],
      citation: '',
    },
  },

  {
    id: 'photo-editing',
    label: 'Photo Editing',
    description: 'Before and after photo editing comparison',
    category: 'photography',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'beforeLabel', type: 'string', description: 'Before label' },
      { key: 'afterLabel', type: 'string', description: 'After label' },
      { key: 'subtitle', type: 'string', description: 'Description' },
      { key: 'imageUrl', type: 'string', description: 'Image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Photo Editing',
      beforeLabel: 'Before',
      afterLabel: 'After',
      description: 'Basic color grading and exposure correction',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'head-to-head',
    label: 'Head to Head',
    description: 'Two-team comparison with form, league position, and key stats side by side',
    category: 'sports',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Match title' },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'teamA', type: 'string', description: 'Team A name' },
      { key: 'teamB', type: 'string', description: 'Team B name' },
      {
        key: 'formA',
        type: 'string',
        description: 'Team A recent form (e.g. W W D L W)',
      },
      {
        key: 'formB',
        type: 'string',
        description: 'Team B recent form (e.g. L W W W D)',
      },
      {
        key: 'stats',
        type: 'array<{label, valueA, valueB}>',
        description: 'Comparison stats',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Matchday 30',
      text: 'Top of the table clash',
      teamA: 'Arsenal',
      teamB: 'Liverpool',
      formA: 'W W D W W',
      formB: 'W W W D W',
      stats: [
        {
          label: 'League Position',
          valueA: '2nd',
          valueB: '1st',
        },
        {
          label: 'Goals Scored',
          valueA: '52',
          valueB: '58',
        },
        {
          label: 'Goals Conceded',
          valueA: '18',
          valueB: '16',
        },
        {
          label: 'Clean Sheets',
          valueA: '10',
          valueB: '12',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'league-table',
    label: 'League Table',
    description: 'Season standings with position, team, played, won, drawn, lost, GD, and points',
    category: 'sports',
    group: 'Lifestyle & Tech',
    schema: [
      {
        key: 'title',
        type: 'string',
        description: 'League name and season',
      },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'standings',
        type: 'array<{position, team, played, won, drawn, lost, gd, points}>',
        description: 'Team standings',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Premier League 2024/25',
      text: 'After Matchweek 28',
      standings: [
        {
          position: 1,
          team: 'Liverpool',
          played: 28,
          won: 20,
          drawn: 6,
          lost: 2,
          gd: '+35',
          points: 66,
        },
        {
          position: 2,
          team: 'Arsenal',
          played: 28,
          won: 18,
          drawn: 6,
          lost: 4,
          gd: '+28',
          points: 60,
        },
        {
          position: 3,
          team: 'Nottingham Forest',
          played: 28,
          won: 16,
          drawn: 5,
          lost: 7,
          gd: '+12',
          points: 53,
        },
        {
          position: 4,
          team: 'Chelsea',
          played: 28,
          won: 14,
          drawn: 7,
          lost: 7,
          gd: '+10',
          points: 49,
        },
        {
          position: 5,
          team: 'Man City',
          played: 28,
          won: 14,
          drawn: 5,
          lost: 9,
          gd: '+5',
          points: 47,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'match-schedule',
    label: 'Match Schedule',
    description: 'Upcoming fixtures list with dates, opponents, venues, and kickoff times',
    category: 'sports',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Team or league name' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'fixtures',
        type: 'array<{date, time, homeTeam, awayTeam, venue}>',
        description: 'Upcoming fixtures',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Arsenal — March Fixtures',
      text: 'Premier League & Champions League',
      fixtures: [
        {
          date: 'Sat 15 Mar',
          time: '15:00',
          homeTeam: 'Arsenal',
          awayTeam: 'Chelsea',
          venue: 'Emirates Stadium',
        },
        {
          date: 'Wed 19 Mar',
          time: '20:00',
          homeTeam: 'Real Madrid',
          awayTeam: 'Arsenal',
          venue: 'Santiago Bernabeu',
        },
        {
          date: 'Sat 22 Mar',
          time: '17:30',
          homeTeam: 'Man City',
          awayTeam: 'Arsenal',
          venue: 'Etihad Stadium',
        },
        {
          date: 'Sat 29 Mar',
          time: '15:00',
          homeTeam: 'Arsenal',
          awayTeam: 'Liverpool',
          venue: 'Emirates Stadium',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'scorecard',
    label: 'Scorecard',
    description: 'Match result with final score, team names, scorers, and key stats',
    category: 'sports',
    group: 'Lifestyle & Tech',
    schema: [
      {
        key: 'title',
        type: 'string',
        description: 'Competition or match title',
      },
      { key: 'text', type: 'string', description: 'Description text' },
      { key: 'homeTeam', type: 'string', description: 'Home team name' },
      { key: 'awayTeam', type: 'string', description: 'Away team name' },
      { key: 'homeScore', type: 'number', description: 'Home team score' },
      { key: 'awayScore', type: 'number', description: 'Away team score' },
      { key: 'date', type: 'string', description: 'Match date' },
      { key: 'venue', type: 'string', description: 'Stadium or venue' },
      {
        key: 'scorers',
        type: 'array<{name, minute, team}>',
        description: 'Goal scorers',
      },
      {
        key: 'stats',
        type: 'array<{label, home, away}>',
        description: 'Match statistics',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Premier League',
      text: 'Matchday 28',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 3,
      awayScore: 1,
      date: 'Sat 15 Mar',
      venue: 'Emirates Stadium',
      scorers: [
        {
          name: 'Saka',
          minute: '23',
          team: 'home',
        },
        {
          name: 'Havertz',
          minute: '56',
          team: 'home',
        },
        {
          name: 'Rice',
          minute: '78',
          team: 'home',
        },
        {
          name: 'Palmer',
          minute: '65',
          team: 'away',
        },
      ],
      stats: [
        {
          label: 'Possession',
          home: '58%',
          away: '42%',
        },
        {
          label: 'Shots',
          home: '14',
          away: '9',
        },
        {
          label: 'On Target',
          home: '6',
          away: '3',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'season-stats',
    label: 'Season Stats',
    description: 'Leaderboard of top scorers or other aggregate season statistics',
    category: 'sports',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Stat category title' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'leaders',
        type: 'array<{position, name, team, value}>',
        description: 'Top players ranking',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Top Scorers',
      text: 'Premier League 2024/25',
      leaders: [
        {
          position: 1,
          name: 'Erling Haaland',
          team: 'Man City',
          value: 22,
        },
        {
          position: 2,
          name: 'Mohamed Salah',
          team: 'Liverpool',
          value: 19,
        },
        {
          position: 3,
          name: 'Alexander Isak',
          team: 'Newcastle',
          value: 17,
        },
        {
          position: 4,
          name: 'Cole Palmer',
          team: 'Chelsea',
          value: 15,
        },
        {
          position: 5,
          name: 'Bukayo Saka',
          team: 'Arsenal',
          value: 14,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'tournament-bracket',
    label: 'Tournament Bracket',
    description: 'Knockout bracket showing round pairings, scores, and advancing teams',
    category: 'sports',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Tournament name' },
      { key: 'text', type: 'string', description: 'Description text' },
      {
        key: 'rounds',
        type: 'array<{name, matches}>',
        description: 'Bracket rounds with match pairings',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Champions League 2025',
      text: 'Knockout Stage',
      rounds: [
        {
          name: 'Quarter-Finals',
          matches: [
            {
              teamA: 'Arsenal',
              teamB: 'Real Madrid',
              scoreA: 3,
              scoreB: 2,
              winner: 'Arsenal',
            },
            {
              teamA: 'Barcelona',
              teamB: 'Bayern',
              scoreA: 1,
              scoreB: 1,
              winner: 'Barcelona',
            },
          ],
        },
        {
          name: 'Semi-Finals',
          matches: [
            {
              teamA: 'Arsenal',
              teamB: 'Barcelona',
              scoreA: 2,
              scoreB: 1,
              winner: 'Arsenal',
            },
          ],
        },
        {
          name: 'Final',
          matches: [
            {
              teamA: 'Arsenal',
              teamB: 'Inter Milan',
            },
          ],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'bucket-list',
    label: 'Bucket List',
    description: 'Numbered travel bucket list with reasons',
    category: 'travel',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'List title' },
      {
        key: 'items',
        type: 'array',
        description: 'Array of {place, reason} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Travel Dreams',
      items: [
        {
          place: 'Northern Lights',
          reason: 'Witness the aurora borealis in Iceland',
        },
        {
          place: 'Machu Picchu',
          reason: 'Hike the Inca Trail to ancient ruins',
        },
        {
          place: 'Santorini',
          reason: 'Watch sunset over white-washed villages',
        },
        {
          place: 'Bali',
          reason: 'Experience rice terraces and temple culture',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'destination-guide',
    label: 'Destination Guide',
    description: 'Place guide with highlights and best time to visit',
    category: 'travel',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'destination', type: 'string', description: 'Destination name' },
      {
        key: 'highlights',
        type: 'array',
        description: 'Array of highlight strings',
      },
      { key: 'bestTime', type: 'string', description: 'Best time to visit' },
      { key: 'tip', type: 'string', description: 'Travel tip' },
      { key: 'imageUrl', type: 'string', description: 'Optional image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      destination: 'Kyoto, Japan',
      highlights: [
        'Fushimi Inari Shrine with thousands of torii gates',
        'Bamboo Grove in Arashiyama',
        'Historic Gion district',
        'Kinkaku-ji Golden Pavilion',
      ],
      bestTime: 'March–May or Oct–Nov',
      tip: 'Visit popular temples early in the morning to avoid crowds.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'itinerary-day',
    label: 'Itinerary Day',
    description: 'Day-by-day trip schedule with timeline',
    category: 'travel',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Trip title' },
      { key: 'day', type: 'string', description: 'Day number' },
      { key: 'date', type: 'string', description: 'Date string' },
      {
        key: 'items',
        type: 'array<{time, activity, location}>',
        description: 'Schedule items',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Tokyo Adventure',
      day: '2',
      date: 'March 20, 2025',
      items: [
        {
          time: '8:00',
          activity: 'Tsukiji Outer Market breakfast',
          location: 'Tsukiji',
        },
        {
          time: '10:30',
          activity: 'Visit Senso-ji Temple',
          location: 'Asakusa',
        },
        {
          time: '13:00',
          activity: 'Lunch at Ichiran Ramen',
          location: 'Shibuya',
        },
        {
          time: '15:00',
          activity: 'TeamLab Borderless',
          location: 'Odaiba',
        },
        {
          time: '19:00',
          activity: 'Dinner in Shinjuku',
          location: 'Shinjuku',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'landmark-spotlight',
    label: 'Landmark Spotlight',
    description: 'Famous landmark with location and fun fact',
    category: 'travel',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'name', type: 'string', description: 'Landmark name' },
      { key: 'location', type: 'string', description: 'Location' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Landmark description',
      },
      { key: 'funFact', type: 'string', description: 'Interesting fact' },
      { key: 'imageUrl', type: 'string', description: 'Optional image URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Colosseum',
      location: 'Rome, Italy',
      description:
        'The largest ancient amphitheatre ever built, capable of holding up to 80,000 spectators.',
      funFact:
        'The Colosseum had a retractable awning system called the velarium to shield spectators from the sun.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'packing-list',
    label: 'Packing List',
    description: 'Travel packing checklist with item count',
    category: 'travel',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Trip title' },
      { key: 'items', type: 'array', description: 'Array of item strings' },
      { key: 'tip', type: 'string', description: 'Packing tip' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Weekend Getaway',
      items: [
        'Passport & ID',
        'Phone charger',
        'Toiletries bag',
        '2 outfits per day',
        'Comfortable walking shoes',
        'Reusable water bottle',
        'Travel pillow',
        'Snacks',
      ],
      tip: 'Roll your clothes instead of folding to save space and reduce wrinkles.',
      citation: '',
    },
  },

  {
    id: 'travel-tip',
    label: 'Travel Tip',
    description: 'Travel advice with category and hashtag',
    category: 'travel',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'tip', type: 'string', description: 'Travel tip' },
      { key: 'category', type: 'string', description: 'Tip category' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Detailed explanation',
      },
      { key: 'hashtag', type: 'string', description: 'Related hashtag' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      tip: 'Pack a portable charger',
      category: 'Packing',
      description:
        'A portable power bank is a lifesaver during long travel days when outlets are scarce.',
      hashtag: '#TravelSmart',
      citation: '',
    },
  },

  {
    id: 'climate-compare',
    label: 'Climate Compare',
    description: 'Two-city weather comparison side by side',
    category: 'weather',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'cityA',
        type: 'object',
        description: '{city, temp, condition, humidity, wind}',
      },
      {
        key: 'cityB',
        type: 'object',
        description: '{city, temp, condition, humidity, wind}',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Climate Compare',
      cityA: {
        city: 'London',
        temp: '14°C',
        condition: 'Cloudy',
        humidity: '78%',
        wind: '18 km/h',
      },
      cityB: {
        city: 'Sydney',
        temp: '24°C',
        condition: 'Sunny',
        humidity: '55%',
        wind: '10 km/h',
      },
      citation: '',
    },
  },

  {
    id: 'forecast',
    label: 'Forecast',
    description: 'Daily weather with temperature, condition, and details',
    category: 'weather',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'city', type: 'string', description: 'City name' },
      { key: 'temp', type: 'string', description: 'Current temperature' },
      { key: 'condition', type: 'string', description: 'Weather condition' },
      { key: 'high', type: 'string', description: 'Daily high' },
      { key: 'low', type: 'string', description: 'Daily low' },
      { key: 'humidity', type: 'string', description: 'Humidity percentage' },
      { key: 'wind', type: 'string', description: 'Wind speed' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: "Today's Weather",
      city: 'London',
      temp: '18°C',
      condition: 'Partly Cloudy',
      high: '21°C',
      low: '14°C',
      humidity: '62%',
      wind: '12 km/h',
      citation: '',
    },
  },

  {
    id: 'season',
    label: 'Season',
    description: 'Season summary with avg temp, rainfall, and highlights',
    category: 'weather',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'season', type: 'string', description: 'Season and year' },
      { key: 'city', type: 'string', description: 'City name' },
      { key: 'avgTemp', type: 'string', description: 'Average temperature' },
      { key: 'rainfall', type: 'string', description: 'Total rainfall' },
      {
        key: 'daylight',
        type: 'string',
        description: 'Average daylight hours',
      },
      { key: 'highlights', type: 'string[]', description: 'Season highlights' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Season Overview',
      season: 'Spring 2025',
      city: 'Paris',
      avgTemp: '16°C',
      rainfall: '48 mm',
      daylight: '14.5 hrs',
      highlights: [
        'Cherry blossoms peak in early April',
        'Mild temperatures ideal for walking',
        'Occasional spring showers',
      ],
      citation: '',
    },
  },

  {
    id: 'sunrise-sunset',
    label: 'Sunrise & Sunset',
    description: 'Daylight hours with sunrise, sunset, and golden hour',
    category: 'weather',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'city', type: 'string', description: 'City name' },
      { key: 'sunrise', type: 'string', description: 'Sunrise time' },
      { key: 'sunset', type: 'string', description: 'Sunset time' },
      { key: 'daylight', type: 'string', description: 'Total daylight' },
      { key: 'goldenHour', type: 'string', description: 'Golden hour window' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Sunrise & Sunset',
      city: 'Barcelona',
      sunrise: '06:42',
      sunset: '21:18',
      daylight: '14h 36m',
      goldenHour: '20:32 – 21:05',
      citation: '',
    },
  },

  {
    id: 'uv-index',
    label: 'UV Index',
    description: 'UV level display with peak time and protection tips',
    category: 'weather',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'value', type: 'string', description: 'UV index value' },
      {
        key: 'level',
        type: 'string',
        description: 'UV level (Low/Moderate/High/Very High/Extreme)',
      },
      { key: 'tips', type: 'string[]', description: 'Protection tips' },
      { key: 'peakTime', type: 'string', description: 'Peak UV hours' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'UV Index',
      value: '7',
      level: 'High',
      tips: [
        'Wear sunscreen (SPF 30+)',
        'Seek shade during midday hours',
        'Wear protective clothing and sunglasses',
      ],
      peakTime: '11:00 AM – 3:00 PM',
      citation: '',
    },
  },

  {
    id: 'weekly-outlook',
    label: 'Weekly Outlook',
    description: '7-day forecast with high/low temperatures',
    category: 'weather',
    group: 'Lifestyle & Tech',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'city', type: 'string', description: 'City name' },
      {
        key: 'days',
        type: 'array<{day, high, low, condition}>',
        description: 'Daily forecasts',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Weekly Outlook',
      city: 'Tokyo',
      days: [
        {
          day: 'Mon',
          high: '22°',
          low: '15°',
          condition: 'Sunny',
        },
        {
          day: 'Tue',
          high: '20°',
          low: '14°',
          condition: 'Cloudy',
        },
        {
          day: 'Wed',
          high: '18°',
          low: '13°',
          condition: 'Rain',
        },
        {
          day: 'Thu',
          high: '21°',
          low: '14°',
          condition: 'Partly Cloudy',
        },
        {
          day: 'Fri',
          high: '24°',
          low: '16°',
          condition: 'Sunny',
        },
        {
          day: 'Sat',
          high: '23°',
          low: '15°',
          condition: 'Sunny',
        },
        {
          day: 'Sun',
          high: '19°',
          low: '12°',
          condition: 'Showers',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'cheat-sheet',
    label: 'Cheat Sheet',
    description: 'Quick reference card with key rules or formulas',
    category: 'education',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Cheat sheet title' },
      { key: 'subject', type: 'string', description: 'Subject name' },
      {
        key: 'items',
        type: 'array<{label, content}>',
        description: 'Reference items',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Cheat Sheet',
      subject: 'JavaScript',
      items: [
        {
          label: 'Variable',
          content: 'let x = value',
        },
        {
          label: 'Constant',
          content: 'const x = value',
        },
        {
          label: 'Function',
          content: 'const fn = () => {}',
        },
        {
          label: 'Array Map',
          content: 'arr.map(x => x)',
        },
        {
          label: 'Fetch',
          content: 'await fetch(url)',
        },
        {
          label: 'Class',
          content: 'class Foo extends Bar {}',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'course-highlight',
    label: 'Course Highlight',
    description: 'Course overview with module list and badges',
    category: 'education',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Course title' },
      { key: 'instructor', type: 'string', description: 'Instructor name' },
      {
        key: 'modules',
        type: 'array',
        description: 'Array of module name strings',
      },
      { key: 'duration', type: 'string', description: 'Course duration' },
      { key: 'level', type: 'string', description: 'Difficulty level' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'JavaScript Fundamentals',
      instructor: 'Jane Doe',
      modules: ['Variables & Types', 'Functions & Scope', 'Objects & Arrays', 'Async Programming'],
      duration: '8 weeks',
      level: 'Beginner',
      citation: '',
    },
  },

  {
    id: 'learning-path',
    label: 'Learning Path',
    description: 'Connected step-by-step learning roadmap',
    category: 'education',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Path title' },
      {
        key: 'steps',
        type: 'array',
        description: 'Array of {level, label, desc} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Learn Web Development',
      steps: [
        {
          level: '1',
          label: 'HTML & CSS',
          desc: 'Build static web pages',
        },
        {
          level: '2',
          label: 'JavaScript',
          desc: 'Add interactivity',
        },
        {
          level: '3',
          label: 'React',
          desc: 'Build modern UIs',
        },
        {
          level: '4',
          label: 'Backend',
          desc: 'APIs and databases',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'quick-quiz',
    label: 'Quick Quiz',
    description: 'Multiple choice question with answer reveal',
    category: 'education',
    group: 'Social & Learning',
    schema: [
      { key: 'question', type: 'string', description: 'Quiz question' },
      { key: 'options', type: 'array', description: 'Array of answer strings' },
      { key: 'answer', type: 'string', description: 'Correct answer' },
      {
        key: 'explanation',
        type: 'string',
        description: 'Why the answer is correct',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
      answer: 'Tokyo',
      explanation: 'Tokyo has been the capital of Japan since 1868, during the Meiji Restoration.',
      citation: '',
    },
  },

  {
    id: 'study-tips',
    label: 'Study Tips',
    description: 'Study technique with numbered steps',
    category: 'education',
    group: 'Social & Learning',
    schema: [
      { key: 'technique', type: 'string', description: 'Study technique name' },
      { key: 'subtitle', type: 'string', description: 'Brief explanation' },
      { key: 'steps', type: 'array', description: 'Array of step strings' },
      { key: 'subject', type: 'string', description: 'Subject or topic' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      technique: 'Pomodoro Technique',
      description:
        'A time management method that uses focused work intervals followed by short breaks.',
      steps: [
        'Choose a task to work on',
        'Set a 25-minute timer',
        'Work until the timer rings',
        'Take a 5-minute break',
      ],
      subject: 'Study Skills',
      citation: '',
    },
  },

  {
    id: 'subject-summary',
    label: 'Subject Summary',
    description: 'Topic overview with key points and summary',
    category: 'education',
    group: 'Social & Learning',
    schema: [
      { key: 'subject', type: 'string', description: 'Subject name' },
      { key: 'topic', type: 'string', description: 'Specific topic' },
      {
        key: 'keyPoints',
        type: 'array',
        description: 'Array of key point strings',
      },
      { key: 'summary', type: 'string', description: 'Concluding summary' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      subject: 'Science',
      topic: 'The Water Cycle',
      keyPoints: [
        'Water evaporates from oceans and lakes',
        'Vapour rises and condenses into clouds',
        'Precipitation returns water to the surface',
        'Runoff carries water back to oceans',
      ],
      summary: 'The water cycle is a continuous process that distributes water across the planet.',
      citation: '',
    },
  },

  {
    id: 'bill-split',
    label: 'Bill Split',
    description: 'Bill splitting calculator',
    category: 'football',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Title' },
      { key: 'total', type: 'string', description: 'Total amount' },
      { key: 'people', type: 'string', description: 'Number of people' },
      { key: 'each', type: 'string', description: 'Amount per person' },
      {
        key: 'items',
        type: 'array',
        description: 'Array of {name, amount} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Dinner Bill',
      total: '$186.50',
      people: '4 people',
      each: '$46.63 each',
      items: [
        {
          name: 'Food',
          amount: '$142.00',
        },
        {
          name: 'Drinks',
          amount: '$28.50',
        },
        {
          name: 'Tax',
          amount: '$16.00',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'formation-card',
    label: 'Formation Card',
    description: 'Football pitch diagram with player positions and numbers',
    category: 'football',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Team or match title' },
      {
        key: 'formation',
        type: 'string',
        description: 'Formation (e.g. 4-3-3)',
      },
      {
        key: 'players',
        type: 'array<{name, number, position, rating?}>',
        description: 'Players (max 11)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Arsenal',
      formation: '4-3-3',
      players: [
        {
          name: 'Raya',
          number: 22,
          position: 'GK',
        },
        {
          name: 'White',
          number: 4,
          position: 'RB',
        },
        {
          name: 'Saliba',
          number: 2,
          position: 'CB',
        },
        {
          name: 'Gabriel',
          number: 6,
          position: 'CB',
        },
        {
          name: 'Zinchenko',
          number: 35,
          position: 'LB',
        },
        {
          name: 'Odegaard',
          number: 8,
          position: 'CM',
        },
        {
          name: 'Rice',
          number: 41,
          position: 'CM',
        },
        {
          name: 'Havertz',
          number: 29,
          position: 'CM',
        },
        {
          name: 'Saka',
          number: 7,
          position: 'RW',
        },
        {
          name: 'Jesus',
          number: 9,
          position: 'ST',
        },
        {
          name: 'Martinelli',
          number: 11,
          position: 'LW',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'mind-map',
    label: 'Mind Map',
    description: 'Central topic with radiating branches',
    category: 'football',
    group: 'Social & Learning',
    schema: [
      { key: 'central', type: 'string', description: 'Central topic' },
      {
        key: 'branches',
        type: 'array',
        description: 'Array of {topic, detail} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      central: 'Web Dev',
      branches: [
        {
          topic: 'Frontend',
          detail: 'React, Vue, Angular',
        },
        {
          topic: 'Backend',
          detail: 'Node, Python, Go',
        },
        {
          topic: 'DevOps',
          detail: 'Docker, K8s, CI/CD',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'packing-checklist',
    label: 'Packing Checklist',
    description: 'Travel packing checklist by category',
    category: 'football',
    group: 'Social & Learning',
    schema: [
      { key: 'destination', type: 'string', description: 'Destination' },
      { key: 'days', type: 'string', description: 'Trip duration' },
      {
        key: 'categories',
        type: 'array',
        description: 'Array of {name, items[]} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      destination: 'Tokyo',
      days: '7 days',
      categories: [
        {
          name: 'Clothes',
          items: ['T-shirts x5', 'Jeans x2', 'Jacket'],
        },
        {
          name: 'Electronics',
          items: ['Phone charger', 'Adapter', 'Camera'],
        },
        {
          name: 'Documents',
          items: ['Passport', 'Tickets', 'Insurance'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'player-stats',
    label: 'Player Stats',
    description: 'Sports player statistics card',
    category: 'football',
    group: 'Social & Learning',
    schema: [
      { key: 'name', type: 'string', description: 'Player name' },
      { key: 'team', type: 'string', description: 'Team name' },
      { key: 'position', type: 'string', description: 'Position' },
      {
        key: 'stats',
        type: 'array',
        description: 'Array of {label, value} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Marcus Johnson',
      team: 'City FC',
      position: 'Forward',
      stats: [
        {
          label: 'Goals',
          value: '24',
        },
        {
          label: 'Assists',
          value: '12',
        },
        {
          label: 'Matches',
          value: '38',
        },
        {
          label: 'Rating',
          value: '8.7',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'transfer-card',
    label: 'Transfer Card',
    description: 'Player transfer details with fee and contract',
    category: 'football',
    group: 'Social & Learning',
    schema: [
      { key: 'player', type: 'string', description: 'Player name' },
      { key: 'from', type: 'string', description: 'Selling club' },
      { key: 'to', type: 'string', description: 'Buying club' },
      { key: 'fee', type: 'string', description: 'Transfer fee' },
      {
        key: 'contractLength',
        type: 'string',
        description: 'Contract duration',
      },
      { key: 'date', type: 'string', description: 'Transfer date' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      player: 'Kylian Mbappe',
      from: 'PSG',
      to: 'Real Madrid',
      fee: 'Free',
      contractLength: '5 years',
      date: 'July 2024',
      citation: '',
    },
  },

  {
    id: 'iceberg',
    label: 'Iceberg',
    description: 'Surface-to-deep layers showing visible vs hidden information',
    category: 'hierarchy',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Title text' },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      {
        key: 'layers',
        type: 'array<{label, items}>',
        description: 'Iceberg layers from surface to deep',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Iceberg',
      text: 'What you see vs what lies beneath',
      layers: [
        {
          label: 'Surface',
          items: ['What everyone sees'],
        },
        {
          label: 'Below Water',
          items: ['What few know', 'Hidden effort'],
        },
        {
          label: 'Deep',
          items: ['Secrets', 'Years of practice'],
        },
        {
          label: 'Abyss',
          items: ['Unknown to most', 'Core truth'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'ladder',
    label: 'Ladder',
    description: 'Vertical rungs showing progression from bottom to top',
    category: 'hierarchy',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Title text' },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      {
        key: 'rungs',
        type: 'array<{label, items}>',
        description: 'Ladder rungs from bottom (novice) to top (expert)',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Ladder',
      text: 'Skill progression',
      rungs: [
        {
          label: 'Expert',
          items: ['Mastery level'],
        },
        {
          label: 'Advanced',
          items: ['Deep knowledge', 'Leadership'],
        },
        {
          label: 'Intermediate',
          items: ['Working knowledge'],
        },
        {
          label: 'Beginner',
          items: ['Getting started'],
        },
        {
          label: 'Novice',
          items: ['First steps'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'leaderboard',
    label: 'Leaderboard',
    description: 'Ranked list with medals and scores',
    category: 'hierarchy',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Leaderboard title' },
      {
        key: 'entries',
        type: 'array<{rank, name, score, medal}>',
        description: 'Ranked entries',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Top Contributors',
      entries: [
        {
          rank: 1,
          name: 'Alice',
          score: '2,450',
          medal: '🥇',
        },
        {
          rank: 2,
          name: 'Bob',
          score: '1,890',
          medal: '🥈',
        },
        {
          rank: 3,
          name: 'Carol',
          score: '1,650',
          medal: '🥉',
        },
        {
          rank: 4,
          name: 'Dave',
          score: '1,200',
        },
        {
          rank: 5,
          name: 'Eve',
          score: '980',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'onion-diagram',
    label: 'Onion Diagram',
    description: 'Concentric rings from outer to inner showing layers of importance',
    category: 'hierarchy',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Title text' },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      {
        key: 'rings',
        type: 'array<{label, items}>',
        description: 'Rings from core to outer',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Onion Diagram',
      text: 'Layers of importance',
      rings: [
        {
          label: 'Core',
          items: ['Essential', 'Critical'],
        },
        {
          label: 'Inner',
          items: ['Important', 'Key'],
        },
        {
          label: 'Middle',
          items: ['Supporting', 'Helpful'],
        },
        {
          label: 'Outer',
          items: ['Optional', 'Nice to have'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'pyramid',
    label: 'Pyramid',
    description: 'Wide base narrowing to top showing hierarchy of importance',
    category: 'hierarchy',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Title text' },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      {
        key: 'levels',
        type: 'array<{label, items}>',
        description: 'Pyramid levels from top to base',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Pyramid',
      text: 'Hierarchy of importance',
      levels: [
        {
          label: 'Top',
          items: ['Most important'],
        },
        {
          label: 'Upper',
          items: ['High priority', 'Key goals'],
        },
        {
          label: 'Middle',
          items: ['Medium priority', 'Supporting tasks'],
        },
        {
          label: 'Lower',
          items: ['Low priority', 'Nice to have'],
        },
        {
          label: 'Base',
          items: ['Foundation', 'Basics'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'tier-list',
    label: 'Tier List',
    description: 'S/A/B/C/D/F tier ranking with color-coded rows and items',
    category: 'hierarchy',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Title text' },
      { key: 'text', type: 'string', description: 'Subtitle text' },
      {
        key: 'tiers',
        type: 'array<{label, color, items}>',
        description: 'Tier rows with label, hex color, and items',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Tier List',
      text: 'My rankings',
      tiers: [
        {
          label: 'S',
          color: '#ff0030',
          items: ['The GOAT', 'Absolute classic'],
        },
        {
          label: 'A',
          color: '#d90029',
          items: ['Great pick', 'Solid choice'],
        },
        {
          label: 'B',
          color: '#b30022',
          items: ['Good', 'Above average'],
        },
        {
          label: 'C',
          color: '#8c001b',
          items: ['Decent', 'Middle of the road'],
        },
        {
          label: 'D',
          color: '#660014',
          items: ['Below average'],
        },
        {
          label: 'F',
          color: '#40000d',
          items: ['Skip this', 'Not recommended'],
        },
      ],
      citation: '',
    },
  },

  {
    id: 'abbreviation',
    label: 'Abbreviation',
    description: 'Abbreviation expanded with full name',
    category: 'interactive',
    group: 'Social & Learning',
    schema: [
      { key: 'abbr', type: 'string', description: 'Abbreviation or acronym' },
      { key: 'full', type: 'string', description: 'Full form' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      abbr: 'NASA',
      full: 'National Aeronautics Space Administration',
      citation: '',
    },
  },

  {
    id: 'challenge-card',
    label: 'Challenge Card',
    description: 'Challenge prompt with day count',
    category: 'interactive',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Challenge title' },
      {
        key: 'subtitle',
        type: 'string',
        description: 'Challenge description',
      },
      { key: 'days', type: 'string', description: 'Duration (e.g. 30)' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Write Every Day',
      description: 'Build a writing habit one day at a time.',
      days: '30',
      citation: '',
    },
  },

  {
    id: 'chat',
    label: 'Chat',
    description: 'Chat conversation with alternating message bubbles',
    category: 'interactive',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Chat title or label' },
      {
        key: 'messages',
        type: 'array',
        description: 'Array of {sender, text, time} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Team Chat',
      messages: [
        {
          sender: 'Alice',
          text: 'Hey, did you see the new design?',
          time: '2:30 PM',
        },
        {
          sender: 'Bob',
          text: 'Yes! It looks amazing.',
          time: '2:31 PM',
        },
        {
          sender: 'Alice',
          text: 'Let me know if you have feedback.',
          time: '2:32 PM',
        },
        {
          sender: 'Bob',
          text: 'Ship it!',
          time: '2:33 PM',
        },
      ],
      citation: '',
    },
  },

  {
    id: 'fill-blank',
    label: 'Fill in the Blank',
    description: 'Text with a blank to fill in',
    category: 'interactive',
    group: 'Social & Learning',
    schema: [
      { key: 'text', type: 'string', description: 'Text with ___ marker' },
      { key: 'blank', type: 'string', description: 'The answer' },
      { key: 'hint', type: 'string', description: 'Optional hint' },
      { key: 'author', type: 'string', description: 'Optional attribution' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      text: 'The only thing we have to fear is ___ itself.',
      blank: 'fear',
      hint: 'Franklin D. Roosevelt',
      author: 'Franklin D. Roosevelt',
      citation: '',
    },
  },

  {
    id: 'poll-vote',
    label: 'Poll Vote',
    description: 'Poll question with percentage bars',
    category: 'interactive',
    group: 'Social & Learning',
    schema: [
      { key: 'question', type: 'string', description: 'Poll question' },
      {
        key: 'options',
        type: 'array',
        description: 'Array of {label, percentage} objects',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      question: 'What matters most in design?',
      options: [
        {
          label: 'Usability',
          percentage: 45,
        },
        {
          label: 'Aesthetics',
          percentage: 30,
        },
        {
          label: 'Performance',
          percentage: 25,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'this-or-that',
    label: 'This or That',
    description: 'Binary choice comparison with VS divider',
    category: 'interactive',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'optionA', type: 'string', description: 'Left option' },
      { key: 'optionB', type: 'string', description: 'Right option' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Which do you choose?',
      optionA: 'Remote Work',
      optionB: 'Office Culture',
      citation: '',
    },
  },

  {
    id: 'discussion',
    label: 'Discussion',
    description: 'Interpretation of findings, implications, and future directions',
    category: 'research',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'interpretation',
        type: 'string',
        description: 'Key interpretation',
      },
      {
        key: 'implications',
        type: 'string[]',
        description: 'Research implications',
      },
      {
        key: 'futureDirections',
        type: 'string[]',
        description: 'Future research directions',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Discussion',
      interpretation:
        'Results support the hypothesis that sleep quality significantly predicts next-day recall accuracy, consistent with the active systems consolidation framework.',
      implications: [
        'Advances theoretical understanding of sleep–memory link',
        'Practical implications for educational scheduling',
        'Supports targeted sleep interventions',
      ],
      futureDirections: [
        'Replicate with longitudinal design',
        'Include neuroimaging measures',
        'Test across age groups',
      ],
      citation: '',
    },
  },

  {
    id: 'intro-literature',
    label: 'Intro & Literature',
    description: 'Research question, hypotheses, and key prior work cited',
    category: 'research',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Paper title' },
      { key: 'question', type: 'string', description: 'Research question' },
      { key: 'hypotheses', type: 'string[]', description: 'Study hypotheses' },
      { key: 'citations', type: 'string[]', description: 'Key cited works' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'The Effect of Sleep on Memory Consolidation',
      question: 'Does sleep quality predict next-day recall accuracy?',
      hypotheses: [
        'H₁: Better sleep quality predicts higher recall accuracy',
        'H₂: REM sleep duration mediates the relationship',
      ],
      citations: ['Walker & Stickgold (2006)', 'Diekelmann & Born (2010)', 'Wamsley (2019)'],
    },
  },

  {
    id: 'limitations',
    label: 'Limitations',
    description: 'Study constraints, impact ratings, and recommendations',
    category: 'research',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'limitations',
        type: 'array<{title, description, impact}>',
        description: 'Study limitations',
      },
      {
        key: 'recommendations',
        type: 'string[]',
        description: 'Recommendations for future work',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Limitations',
      limitations: [
        {
          title: 'Sample generalizability',
          description: 'Convenience sample from a single university',
          impact: 'High',
        },
        {
          title: 'Self-report measures',
          description: 'Potential social desirability bias in survey responses',
          impact: 'Medium',
        },
        {
          title: 'Cross-sectional design',
          description: 'Causal inferences limited by correlational data',
          impact: 'High',
        },
      ],
      recommendations: [
        'Replicate with community samples',
        'Include behavioural measures alongside self-report',
        'Conduct longitudinal follow-up studies',
      ],
      citation: '',
    },
  },

  {
    id: 'methods',
    label: 'Methods',
    description: 'Study design, procedure, materials, and analysis plan',
    category: 'research',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'design', type: 'string', description: 'Study design type' },
      { key: 'procedure', type: 'string[]', description: 'Procedure steps' },
      { key: 'materials', type: 'string[]', description: 'Materials used' },
      {
        key: 'analysis',
        type: 'string',
        description: 'Statistical analysis plan',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Methods',
      design: 'Between-subjects experimental design',
      procedure: [
        'Informed consent obtained',
        'Random assignment to conditions',
        'Task presentation and data collection',
        'Debriefing and compensation',
      ],
      materials: [
        'Custom survey (Qualtrics)',
        'Reaction time software (PsychoPy)',
        'Stimulus set (n = 120)',
      ],
      analysis: 'Mixed-effects regression with random intercepts for participants',
      citation: '',
    },
  },

  {
    id: 'participants',
    label: 'Participants',
    description: 'Sample demographics, size, recruitment, and inclusion criteria',
    category: 'research',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      { key: 'sampleSize', type: 'string', description: 'Total sample size' },
      {
        key: 'demographics',
        type: 'array<{label, value}>',
        description: 'Demographic breakdowns',
      },
      { key: 'method', type: 'string', description: 'Recruitment method' },
      { key: 'criteria', type: 'string[]', description: 'Inclusion criteria' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Participants',
      sampleSize: 'N = 240',
      demographics: [
        {
          label: 'Age',
          value: 'M = 28.4, SD = 6.2',
        },
        {
          label: 'Gender',
          value: '52% Female, 48% Male',
        },
        {
          label: 'Education',
          value: "78% Bachelor's or higher",
        },
      ],
      method: 'Recruited via Prolific Academic',
      criteria: ['Aged 18–65', 'Native English speakers', 'No prior exposure to study stimuli'],
      citation: '',
    },
  },

  {
    id: 'results',
    label: 'Results',
    description: 'Key findings with statistics, effect sizes, and significance',
    category: 'research',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Section title' },
      {
        key: 'findings',
        type: 'array<{label, value, significant}>',
        description: 'Key findings',
      },
      {
        key: 'statistic',
        type: 'string',
        description: 'Overall test statistic',
      },
      {
        key: 'effectSize',
        type: 'string',
        description: 'Effect size interpretation',
      },
      {
        key: 'chart',
        type: 'string',
        description: 'Optional chart description',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Results',
      findings: [
        {
          label: 'Main effect of sleep quality on recall',
          value: 'F(1, 238) = 14.72, p < .001',
          significant: true,
        },
        {
          label: 'REM duration interaction',
          value: 'F(2, 238) = 3.89, p = .021',
          significant: true,
        },
        {
          label: 'Age covariate',
          value: 'F(1, 238) = 1.02, p = .313',
          significant: false,
        },
      ],
      statistic: 'η² = 0.058',
      effectSize: 'Medium effect',
      chart: '',
      citation: '',
    },
  },

  {
    id: 'event-card',
    label: 'Event Card',
    description: 'Event details with date, time, and location',
    category: 'social',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Event title' },
      { key: 'date', type: 'string', description: 'Event date' },
      { key: 'time', type: 'string', description: 'Event time' },
      { key: 'location', type: 'string', description: 'Event location' },
      { key: 'subtitle', type: 'string', description: 'Event description' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Design Summit 2025',
      date: 'JAN 15',
      time: '10:00 AM — 4:00 PM',
      location: 'San Francisco, CA',
      description: 'Join industry leaders for a day of talks, workshops, and networking.',
      citation: '',
    },
  },

  {
    id: 'mention',
    label: 'Mention',
    description: 'Social media mention card with engagement',
    category: 'social',
    group: 'Social & Learning',
    schema: [
      { key: 'handle', type: 'string', description: 'Social media handle' },
      { key: 'quote', type: 'string', description: 'Post content' },
      { key: 'name', type: 'string', description: 'Display name' },
      { key: 'avatarUrl', type: 'string', description: 'Avatar image URL' },
      { key: 'likes', type: 'string', description: 'Like count' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      handle: '@designer',
      quote: 'Great content! Really insightful perspective on this topic.',
      name: 'Designer Pro',
      avatarUrl: '',
      likes: '124',
      citation: '',
    },
  },

  {
    id: 'profile-card',
    label: 'Profile Card',
    description: 'Avatar, name, title, and bio',
    category: 'social',
    group: 'Social & Learning',
    schema: [
      { key: 'name', type: 'string', description: 'Full name' },
      { key: 'title', type: 'string', description: 'Job title or role' },
      { key: 'bio', type: 'string', description: 'Short biography' },
      { key: 'imageUrl', type: 'string', description: 'Profile photo URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      name: 'Alex Chen',
      title: 'Product Designer',
      bio: 'Designing meaningful experiences at the intersection of simplicity and functionality.',
      imageUrl: '',
      citation: '',
    },
  },

  {
    id: 'share-cta',
    label: 'Share CTA',
    description: 'Call to action for sharing content',
    category: 'social',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Main title' },
      { key: 'text', type: 'string', description: 'Body paragraph' },
      { key: 'buttonLabel', type: 'string', description: 'Button text' },
      { key: 'hashtag', type: 'string', description: 'Associated hashtag' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Share This',
      text: 'Help others discover this content by sharing it with your network.',
      buttonLabel: 'Share Now',
      hashtag: '#Infographic',
      citation: '',
    },
  },

  {
    id: 'team-roster',
    label: 'Team Roster',
    description: 'Grid of team member cards with roles',
    category: 'social',
    group: 'Social & Learning',
    schema: [
      { key: 'title', type: 'string', description: 'Team name' },
      {
        key: 'members',
        type: 'array<{name, role, number}>',
        description: 'Team members',
      },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      title: 'Squad',
      members: [
        {
          name: 'Alex Chen',
          role: 'Captain',
          number: 10,
        },
        {
          name: 'Sarah Kim',
          role: 'Designer',
          number: 7,
        },
        {
          name: 'Mike Ross',
          role: 'Developer',
          number: 9,
        },
        {
          name: 'Lisa Park',
          role: 'Manager',
          number: 1,
        },
        {
          name: 'Tom Wang',
          role: 'Analyst',
          number: 5,
        },
        {
          name: 'Ana Silva',
          role: 'Engineer',
          number: 3,
        },
      ],
      citation: '',
    },
  },

  {
    id: 'testimonial',
    label: 'Testimonial',
    description: 'Star rating, quote, avatar, name, and title',
    category: 'social',
    group: 'Social & Learning',
    schema: [
      { key: 'quote', type: 'string', description: 'Customer testimonial' },
      { key: 'name', type: 'string', description: 'Customer name' },
      { key: 'title', type: 'string', description: 'Customer role or company' },
      { key: 'rating', type: 'number', description: 'Star rating 1-5' },
      { key: 'imageUrl', type: 'string', description: 'Optional photo URL' },
      { key: 'citation', type: 'string', description: 'Source citation' },
    ],
    defaultContent: {
      quote:
        'This tool completely transformed our workflow. We went from chaos to clarity in days.',
      name: 'Sarah Mitchell',
      title: 'CEO, Brightside Inc.',
      rating: 5,
      imageUrl: '',
      citation: '',
    },
  },
];

export const DEFAULT_CONTENT_MAP: Record<string, Record<string, unknown>> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t.defaultContent]),
);
