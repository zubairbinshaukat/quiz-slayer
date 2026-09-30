export const EXAMPLE_JSON = `{
  "subject": "Machine Learning",
  "slug": "machine-learning",
  "description": "Supervised, unsupervised learning, and neural networks.",
  "questions": [
    {
      "id": 1,
      "text": "What is supervised learning?",
      "options": [
        "Learning without labeled data",
        "Learning from labeled input-output pairs",
        "Reinforcement from an environment",
        "Clustering similar data points"
      ],
      "correctIndex": 1,
      "shortExplanation": "Supervised learning trains on labeled input-output pairs.",
      "explanation": "Supervised learning uses labeled training data where each input has a known output, allowing the model to learn the mapping function."
    }
  ],
  "guess_questions": [
    {
      "id": 1,
      "text": "Which algorithm is commonly used for classification?",
      "options": ["K-Means", "Decision Tree", "PCA", "DBSCAN"],
      "correctIndex": 1,
      "shortExplanation": "Decision Trees are widely used for classification tasks.",
      "explanation": "Decision Trees split data based on feature thresholds to classify inputs, making them one of the most widely used classification algorithms."
    }
  ]
}`

export const AI_PROMPT = `Convert the following content into a quiz JSON file. Follow this EXACT format and rules:

{
  "subject": "Subject Name Here",
  "slug": "subject-name-here",
  "description": "A brief one-line description",
  "questions": [
    {
      "id": 1,
      "text": "Question text ending with ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "shortExplanation": "One short sentence explaining the correct answer",
      "explanation": "2-4 sentences explaining why the correct answer is right"
    }
  ]
}

RULES:
- slug: lowercase letters, numbers, hyphens ONLY (e.g. "machine-learning", "data-structures")
- Each question needs EXACTLY 4 options
- Each question needs 4 or 5 options
- correctIndex is 0-indexed: 0 = first option, 1 = second, 2 = third, 3 = fourth
- Each question must have a "shortExplanation" field (1 concise sentence)
- Each question must have an "explanation" field (2-4 sentences explaining why the correct answer is right)
- Generate at least 15 questions that test deep understanding, not just memorization
- Questions should be clear, unambiguous, and exam-style
- You may add a "guess_questions" array with 20+ additional practice questions in the same format

[PASTE YOUR DOCUMENT / LECTURE NOTES / TEXTBOOK CONTENT HERE]`

export const FIELD_GUIDE: { label: string; desc: string }[] = [
  { label: 'subject', desc: 'Display name of the subject' },
  { label: 'slug', desc: 'URL-safe ID: lowercase + hyphens' },
  { label: 'questions', desc: 'Array of professor questions' },
  { label: 'guess_questions', desc: 'Optional AI practice questions' },
  { label: 'correctIndex', desc: '0-indexed position of correct option' },
  { label: 'options', desc: 'Array of 4 or 5 answer choices' },
  { label: 'shortExplanation', desc: '1-sentence summary of the correct answer' },
  { label: 'explanation', desc: '2-4 sentence detailed explanation' },
]
