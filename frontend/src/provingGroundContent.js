export const quizTopics = [
  {
    id: 'java-collections', title: 'Java collections', topic: 'Java', assessmentTitle: 'Java fundamentals: collections and streams',
    questions: [
      { prompt: 'Which collection keeps unique values and does not promise iteration order?', choices: ['ArrayList', 'HashSet', 'LinkedList', 'ArrayDeque'], answer: 1, explanation: 'HashSet stores unique elements and does not guarantee iteration order.' },
      { prompt: 'Which interface represents key-to-value lookups?', choices: ['List', 'Set', 'Map', 'Queue'], answer: 2, explanation: 'Map associates keys with values for lookup.' },
      { prompt: 'Which stream operation transforms each element?', choices: ['filter', 'map', 'distinct', 'limit'], answer: 1, explanation: 'map converts each input element into an output element.' },
    ],
  },
  {
    id: 'react-state', title: 'React state basics', topic: 'React', assessmentTitle: 'React state and component thinking',
    questions: [
      { prompt: 'How should state be updated when the next value depends on the previous value?', choices: ['Mutate the state directly', 'Use a functional state setter', 'Edit the DOM manually', 'Reload the page'], answer: 1, explanation: 'A functional state setter receives the latest state value.' },
      { prompt: 'Why should rendered list items have stable keys?', choices: ['To help React track items between renders', 'To add CSS automatically', 'To make all items buttons', 'To sort the list'], answer: 0, explanation: 'Stable keys help React match items as a list changes.' },
      { prompt: 'Where should shared state usually live?', choices: ['In the closest common parent', 'Separately in every child', 'In a CSS file', 'In the browser URL only'], answer: 0, explanation: 'The closest common parent can provide one source of truth to its children.' },
    ],
  },
  {
    id: 'http-api', title: 'HTTP API essentials', topic: 'APIs', assessmentTitle: 'Design a dependable REST API',
    questions: [
      { prompt: 'Which method normally reads a resource without changing it?', choices: ['POST', 'GET', 'PATCH', 'DELETE'], answer: 1, explanation: 'GET retrieves a representation and should not change server state.' },
      { prompt: 'Which status code commonly means a resource was created?', choices: ['200', '201', '404', '500'], answer: 1, explanation: '201 Created is commonly returned after successful resource creation.' },
      { prompt: 'Where must request validation happen?', choices: ['Only in the browser', 'At the server API boundary', 'Only after saving', 'Only in CSS'], answer: 1, explanation: 'The server must validate input because clients can be bypassed.' },
    ],
  },
]

export const codingChallenges = [
  { id: 'word-frequency', title: 'Count word frequencies', topic: 'Java', difficulty: 'Beginner', language: 'Java',
    statement: 'Write a method that counts how often each word appears in a list. Treat words as case-insensitive and return a map keyed by the lowercase word.',
    examples: [{ input: '["Java", "code", "java"]', output: '{java=2, code=1}', explanation: 'The two spellings of Java count as the same word.' }],
    starter: 'import java.util.*;\n\nclass WordCounter {\n    Map<String, Integer> countWords(List<String> words) {\n        // TODO: count each lowercase word\n        return Map.of();\n    }\n}',
  },
  { id: 'filter-items', title: 'Filter completed tasks', topic: 'JavaScript', difficulty: 'Beginner', language: 'JavaScript',
    statement: 'Write a function that returns only tasks whose completed property is true. Keep the original task objects and input array unchanged.',
    examples: [{ input: '[{title:"Read", completed:true}, {title:"Build", completed:false}]', output: '[{title:"Read", completed:true}]', explanation: 'Only the completed task remains in the returned array.' }],
    starter: 'function completedTasks(tasks) {\n  // TODO: return completed tasks without mutating tasks\n  return [];\n}',
  },
]

export const topicNotes = [
  { id: 'notes-collections', title: 'Choosing Java collections', topic: 'Java', body: 'Use a List when order and duplicates matter. Use a Set when values must be unique. Use a Map when each key points to a value. Pick the simplest structure that matches the operations your program needs.', bullets: ['ArrayList: indexed access and iteration', 'HashSet: uniqueness with fast membership checks', 'HashMap: key-based lookup'], quizId: 'java-collections', challengeId: 'word-frequency' },
  { id: 'notes-react-state', title: 'React state and rerenders', topic: 'React', body: 'State describes values that can change while a component is on screen. Update it through the setter and create new arrays or objects instead of mutating existing state.', bullets: ['Use functional updates when the next value depends on the previous one', 'Use stable keys for rendered lists', 'Lift state to the closest shared parent when siblings need it'], quizId: 'react-state', challengeId: 'filter-items' },
  { id: 'notes-http', title: 'HTTP methods and status codes', topic: 'APIs', body: 'HTTP methods describe the intended operation. Status codes tell the client whether the request succeeded or why it could not be completed.', bullets: ['GET reads; POST commonly creates', '201 means created; 400 means invalid request', '404 means the resource was not found'], quizId: 'http-api', challengeId: null },
]

export const practiceSets = [
  { id: 'daily-java', title: 'Java collections quick reps', topic: 'Java', quizId: 'java-collections', assessmentTitle: 'Java fundamentals: collections and streams', description: 'Repeat a short set on choosing collections and transforming values.' },
  { id: 'daily-react', title: 'React state quick reps', topic: 'React', quizId: 'react-state', assessmentTitle: 'React state and component thinking', description: 'Repeat a short set on state updates, keys, and component boundaries.' },
]

export function scoreQuiz(questions, answers) {
  return questions.reduce((score, question, index) => score + (answers[index] === question.answer ? 1 : 0), 0)
}
