import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, BadgeCheck, Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown, Clock3, Code2, Compass, FileText, Flame, GraduationCap, Layers3, LockKeyhole, Menu, Search, ShieldCheck, Sparkles, Target, Trophy, Users, X } from 'lucide-react'
import { AuthPage, ProfilePage, PublicProfilePage } from './AccountPages'
import Chatbot from './Chatbot'
import CodePlayground from './CodePlayground'
import ProvingGround from './ProvingGround'
import ThemePicker from './ThemePicker'
import { api } from './api'

const samples = [
  { id: 'java', title: 'Java fundamentals: collections and streams', category: 'Backend', level: 'Beginner', durationMinutes: 25, summary: 'Model a small problem, choose collections, and transform data with clear Java code.', skills: ['Java', 'Collections', 'Streams'], mark: 'J', tone: 'lavender', completed: '2.4k' },
  { id: 'api', title: 'Design a dependable REST API', category: 'Backend', level: 'Intermediate', durationMinutes: 35, summary: 'Demonstrate API design, validation, error handling, and resource modeling with Spring Boot.', skills: ['Spring Boot', 'REST', 'Java'], mark: '↗', tone: 'mint', completed: '1.8k' },
  { id: 'react', title: 'React state & component thinking', category: 'Frontend', level: 'Beginner', durationMinutes: 30, summary: 'Build confidence in component boundaries, state updates, and accessible interactive UI.', skills: ['React', 'JavaScript', 'Accessibility'], mark: '⚛', tone: 'peach', completed: '3.1k' },
  { id: 'sql', title: 'SQL queries for product analytics', category: 'Data', level: 'Intermediate', durationMinutes: 30, summary: 'Use joins, grouping, and careful filters to answer realistic product questions.', skills: ['SQL', 'PostgreSQL', 'Analytics'], mark: '⌘', tone: 'blue', completed: '1.2k' },
  { id: 'security', title: 'Secure authentication foundations', category: 'Security', level: 'Advanced', durationMinutes: 40, summary: 'Reason about identity, authorization, password storage, and safe defaults.', skills: ['Spring Security', 'OWASP', 'Java'], mark: '◈', tone: 'rose', completed: '860' },
]
const questionSets = {
  'Java fundamentals: collections and streams': [
    { prompt: 'Which collection should you choose when you need unique values and do not care about order?', choices: ['ArrayList', 'HashSet', 'LinkedList', 'Queue'], answer: 1, explanation: 'A Set stores unique values. HashSet is a common choice when insertion order is not required.' },
    { prompt: 'What does Stream.filter(...) do?', choices: ['Changes each item', 'Keeps items matching a condition', 'Sorts the stream', 'Combines all items into one value'], answer: 1, explanation: 'filter keeps only the elements that satisfy its predicate.' },
    { prompt: 'Which interface is best for key-to-value lookups?', choices: ['List', 'Set', 'Map', 'Deque'], answer: 2, explanation: 'Map stores key-value pairs and supports lookups by key.' },
  ],
  'Design a dependable REST API': [
    { prompt: 'Which HTTP method is normally used to retrieve a resource without changing it?', choices: ['POST', 'GET', 'PATCH', 'DELETE'], answer: 1, explanation: 'GET is used to read a resource and should not change server state.' },
    { prompt: 'What status code best represents a resource that does not exist?', choices: ['200', '201', '404', '500'], answer: 2, explanation: '404 Not Found indicates the requested resource could not be found.' },
    { prompt: 'Where should request validation happen?', choices: ['Only in the browser', 'At the API boundary on the server', 'Only in the database', 'After returning a response'], answer: 1, explanation: 'The server must validate input because clients cannot be trusted to enforce rules.' },
  ],
  'React state & component thinking': [
    { prompt: 'What is the recommended way to update state based on its previous value?', choices: ['Mutate the state object directly', 'Use the functional state setter', 'Change the DOM manually', 'Reload the page'], answer: 1, explanation: 'A functional setter receives the latest state and avoids stale updates.' },
    { prompt: 'Why should a list item have a stable key?', choices: ['To apply CSS', 'To help React track items between renders', 'To make the item clickable', 'To sort the list'], answer: 1, explanation: 'Keys help React match each rendered item when a list changes.' },
    { prompt: 'Where should state live when two sibling components need it?', choices: ['In the closest shared parent', 'In both components separately', 'In the HTML document', 'In a CSS file'], answer: 0, explanation: 'Lifting state to the closest shared parent gives both components one source of truth.' },
  ],
  'SQL queries for product analytics': [
    { prompt: 'Which clause filters grouped results after aggregation?', choices: ['WHERE', 'ORDER BY', 'HAVING', 'LIMIT'], answer: 2, explanation: 'HAVING filters groups after GROUP BY and aggregate calculations.' },
    { prompt: 'What does an INNER JOIN return?', choices: ['Every row from the left table', 'Rows with matching keys in both tables', 'Only unmatched rows', 'A Cartesian product'], answer: 1, explanation: 'INNER JOIN returns rows that match the join condition in both tables.' },
    { prompt: 'Which function counts all rows, including rows with NULL values?', choices: ['COUNT(*)', 'COUNT(column)', 'SUM(*)', 'TOTAL(column)'], answer: 0, explanation: 'COUNT(*) counts rows; COUNT(column) excludes rows where that column is NULL.' },
  ],
  'Secure authentication foundations': [
    { prompt: 'How should an application store user passwords?', choices: ['As plain text', 'Encrypted with a reversible key', 'Hashed with a password-hashing function and salt', 'In a browser cookie'], answer: 2, explanation: 'Use a purpose-built password hashing function with a unique salt; never store recoverable passwords.' },
    { prompt: 'What is the main purpose of authorization?', choices: ['Confirm who a user is', 'Decide what an authenticated user may do', 'Reset a password', 'Create a session cookie'], answer: 1, explanation: 'Authentication identifies a user; authorization checks their permissions.' },
    { prompt: 'Where should access control be enforced?', choices: ['Only by hiding buttons in the UI', 'On the server for every protected operation', 'Only in a robots.txt file', 'Only after a user logs out'], answer: 1, explanation: 'The server must enforce permissions because browser controls can be bypassed.' },
  ],
}
questionSets['Java fundamentals: collections and streams'].push(
  { prompt: 'What does a Comparator let you define?', choices: ['A custom ordering for objects', 'A database schema', 'A thread lock', 'A memory allocator'], answer: 0, explanation: 'Comparator defines a custom ordering, such as sorting people by age.' },
  { prompt: 'Which stream operation turns each input into a different value?', choices: ['filter', 'map', 'distinct', 'peek'], answer: 1, explanation: 'map transforms each element into a new value.' },
  { prompt: 'What does List.of(...) return?', choices: ['A mutable linked list', 'An unmodifiable list', 'A set', 'A map'], answer: 1, explanation: 'List.of creates an unmodifiable list.' },
  { prompt: 'Which collection preserves insertion order and removes duplicates?', choices: ['HashSet', 'TreeMap', 'LinkedHashSet', 'ArrayDeque'], answer: 2, explanation: 'LinkedHashSet combines uniqueness with insertion-order iteration.' },
  { prompt: 'What is Optional primarily used for?', choices: ['Representing a value that may be absent', 'Storing many values', 'Opening a file', 'Starting a thread'], answer: 0, explanation: 'Optional makes possible absence explicit in an API.' }
)
questionSets['Design a dependable REST API'].push(
  { prompt: 'Which status code commonly indicates successful resource creation?', choices: ['200', '201', '204', '302'], answer: 1, explanation: '201 Created is the standard response when a request creates a resource.' },
  { prompt: 'What property should an idempotent PUT request have?', choices: ['Repeating it has the same intended result', 'It always creates duplicates', 'It can only be used once', 'It hides validation errors'], answer: 0, explanation: 'An idempotent operation has the same intended effect when repeated.' },
  { prompt: 'Where should API versioning be made clear?', choices: ['In a documented contract', 'Only in database table names', 'In user passwords', 'Nowhere'], answer: 0, explanation: 'A documented versioning strategy helps clients understand compatibility.' },
  { prompt: 'What should an API return for invalid request fields?', choices: ['A useful 4xx response with field errors', 'A stack trace', 'A success response', 'An empty response with no status'], answer: 0, explanation: 'Client input errors should be reported clearly without exposing internals.' },
  { prompt: 'Why paginate large collection responses?', choices: ['To limit response size and work', 'To encrypt requests', 'To avoid authentication', 'To guarantee sorting'], answer: 0, explanation: 'Pagination keeps responses and database work manageable.' }
)
questionSets['React state & component thinking'].push(
  { prompt: 'What should a controlled input use?', choices: ['A state value and change handler', 'Direct DOM mutation only', 'A random key each render', 'No value or event handler'], answer: 0, explanation: 'A controlled input takes its value from React state and updates through events.' },
  { prompt: 'When is useEffect appropriate?', choices: ['Synchronizing with an external system', 'For every calculation', 'To replace all event handlers', 'To style an element'], answer: 0, explanation: 'Effects synchronize a component with external systems such as subscriptions or network state.' },
  { prompt: 'Why avoid mutating an array in state?', choices: ['React relies on new references to detect changes', 'Arrays cannot contain objects', 'Mutation is always faster', 'It disables CSS'], answer: 0, explanation: 'Creating a new array gives React a clear state change to render.' },
  { prompt: 'What does lifting state up help with?', choices: ['Sharing one state source between components', 'Making components private', 'Reducing browser storage', 'Replacing props'], answer: 0, explanation: 'A shared parent can coordinate state used by sibling components.' },
  { prompt: 'What is an accessible button name for?', choices: ['Assistive technology users to understand its action', 'Changing the button color', 'Sorting a list', 'Saving network bandwidth'], answer: 0, explanation: 'A clear accessible name communicates the control purpose to screen readers.' }
)
questionSets['SQL queries for product analytics'].push(
  { prompt: 'How do you count distinct users?', choices: ['COUNT(DISTINCT user_id)', 'SUM(user_id)', 'UNIQUE(user_id)', 'COUNT(*) DISTINCT'], answer: 0, explanation: 'COUNT(DISTINCT column) counts unique non-null values.' },
  { prompt: 'Which join keeps all rows from the left table?', choices: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN'], answer: 1, explanation: 'LEFT JOIN preserves every left row and adds matching right-side data when present.' },
  { prompt: 'What is a window function useful for?', choices: ['Calculations across related rows without collapsing them', 'Deleting duplicate tables', 'Encrypting columns', 'Creating an index'], answer: 0, explanation: 'Window functions calculate over related rows while retaining each row in the result.' },
  { prompt: 'Which clause sorts the final results?', choices: ['GROUP BY', 'WHERE', 'ORDER BY', 'HAVING'], answer: 2, explanation: 'ORDER BY sorts the result set.' },
  { prompt: 'How should you compare a column to a missing SQL value?', choices: ['column = NULL', 'column IS NULL', 'column == empty', 'column LIKE NULL'], answer: 1, explanation: 'SQL uses IS NULL because NULL represents an unknown value.' }
)
questionSets['Secure authentication foundations'].push(
  { prompt: 'What does multi-factor authentication combine?', choices: ['Two or more different factor types', 'Two usernames', 'A password and its copy', 'Only security questions'], answer: 0, explanation: 'MFA uses distinct factor types, such as something known and something possessed.' },
  { prompt: 'Why use a short-lived session identifier?', choices: ['Limit the impact if it is exposed', 'Make passwords reusable', 'Avoid authorization checks', 'Store user profile text'], answer: 0, explanation: 'Shorter-lived sessions reduce how long a stolen identifier remains useful.' },
  { prompt: 'What should an authorization check verify?', choices: ['The user may perform this action on this resource', 'The button is visible', 'The browser is Chrome', 'The request has a large payload'], answer: 0, explanation: 'Authorization must check the user, action, and resource on the server.' },
  { prompt: 'What is a safe password reset token?', choices: ['Random, single-use, and time-limited', 'The user email in plain text', 'A permanent shared code', 'The old password reversed'], answer: 0, explanation: 'Reset tokens should be unpredictable, expire, and be invalidated after use.' },
  { prompt: 'Why rate-limit login attempts?', choices: ['Slow automated credential guessing', 'Improve image quality', 'Change the password hash', 'Skip session renewal'], answer: 0, explanation: 'Rate limits make large-scale automated password guessing harder.' }
)
questionSets['Python automation essentials'] = [
  { prompt: 'Which Python type stores key-value pairs?', choices: ['list', 'dict', 'tuple', 'set'], answer: 1, explanation: 'A dict maps keys to values.' },
  { prompt: 'How do you safely open a file so it is closed afterward?', choices: ['with open(...) as file:', 'file.start()', 'close(open(...)) only', 'new File()'], answer: 0, explanation: 'A with statement manages cleanup, including closing the file.' },
  { prompt: 'What does a list comprehension produce?', choices: ['A new list from an iterable', 'A database', 'A class method', 'A socket'], answer: 0, explanation: 'List comprehensions create lists from iterable values and an expression.' },
  { prompt: 'What does `if __name__ == "__main__":` support?', choices: ['Running a script only when executed directly', 'Installing packages', 'Opening a network port', 'Defining a database'], answer: 0, explanation: 'It distinguishes direct execution from importing a module.' },
  { prompt: 'What should you catch in an exception handler?', choices: ['Expected specific exception types', 'Every exception silently', 'Keyboard input only', 'No exceptions ever'], answer: 0, explanation: 'Specific handling avoids hiding unexpected programming errors.' },
  { prompt: 'Why use a virtual environment?', choices: ['Isolate project dependencies', 'Make code run without Python', 'Encrypt source files', 'Replace automated tests'], answer: 0, explanation: 'Virtual environments isolate package versions between projects.' },
  { prompt: 'What is a unit test intended to check?', choices: ['A small unit of behavior in isolation', 'The whole internet', 'Only screen colors', 'Production secrets'], answer: 0, explanation: 'Unit tests focus on a small function or component behavior.' },
  { prompt: 'Which module is commonly used for command-line arguments?', choices: ['argparse', 'turtle', 'pickle only', 'colorsys'], answer: 0, explanation: 'argparse provides structured command-line argument parsing.' }
]
questionSets['Cloud deployment and DevOps basics'] = [
  { prompt: 'What does a container image contain?', choices: ['Application and its runtime dependencies', 'A physical server', 'A DNS provider', 'Only a source code URL'], answer: 0, explanation: 'An image packages the application and the filesystem/runtime it needs.' },
  { prompt: 'What is a CI pipeline commonly used for?', choices: ['Automatically build and validate code changes', 'Manually edit production data', 'Replace source control', 'Design logos'], answer: 0, explanation: 'Continuous integration automates checks on code changes.' },
  { prompt: 'Where should production secrets be stored?', choices: ['A managed secret store or protected environment', 'Committed in source code', 'Inside a public image', 'In the README'], answer: 0, explanation: 'Secrets must be kept outside source and protected by access controls.' },
  { prompt: 'What does horizontal scaling add?', choices: ['More application instances', 'More code comments', 'A longer password', 'A larger response body'], answer: 0, explanation: 'Horizontal scaling adds instances to share workload.' },
  { prompt: 'Why define health checks?', choices: ['Detect whether a service is ready and healthy', 'Choose CSS fonts', 'Disable monitoring', 'Generate user passwords'], answer: 0, explanation: 'Health checks help operators and orchestrators detect service state.' },
  { prompt: 'What is infrastructure as code?', choices: ['Versioned configuration that provisions infrastructure', 'A graphic design file', 'An undocumented manual process', 'A database query'], answer: 0, explanation: 'Infrastructure as code describes repeatable infrastructure in source files.' },
  { prompt: 'What should a deployment rollback do?', choices: ['Return to a known-good release', 'Delete monitoring history', 'Disable backups', 'Change user permissions randomly'], answer: 0, explanation: 'A rollback restores a previous release if a deployment has problems.' },
  { prompt: 'Why collect application metrics?', choices: ['Understand performance and operational behavior', 'Replace all security checks', 'Hide service errors', 'Compile frontend assets'], answer: 0, explanation: 'Metrics help teams spot trends and diagnose service behavior.' }
]
questionSets['Accessible UI and UX foundations'] = [
  { prompt: 'What is the purpose of user research?', choices: ['Understand user needs and context', 'Prove the designer is always right', 'Avoid usability testing', 'Choose a framework'], answer: 0, explanation: 'Research helps teams make decisions based on users and their context.' },
  { prompt: 'What does sufficient color contrast improve?', choices: ['Text readability for more people', 'Database speed', 'Network encryption', 'Image file size'], answer: 0, explanation: 'Contrast helps people read content, including users with low vision.' },
  { prompt: 'Why provide visible keyboard focus?', choices: ['Show keyboard users where they are', 'Make mouse use mandatory', 'Hide interactive controls', 'Animate every page'], answer: 0, explanation: 'A visible focus indicator supports keyboard navigation.' },
  { prompt: 'What should a good empty state include?', choices: ['Context and a useful next action', 'Only a blank screen', 'An unrelated advertisement', 'A hidden error'], answer: 0, explanation: 'Empty states should explain what is happening and help users proceed.' },
  { prompt: 'What is a usability test best for?', choices: ['Observe users attempting realistic tasks', 'Measure server uptime only', 'Replace all analytics', 'Choose a company name'], answer: 0, explanation: 'Usability tests reveal where users struggle with real tasks.' },
  { prompt: 'How should form errors be presented?', choices: ['Clearly near the field with a correction hint', 'Only in a console', 'After the user leaves', 'As color alone'], answer: 0, explanation: 'Clear inline messages help users find and fix input issues.' },
  { prompt: 'What does semantic HTML help with?', choices: ['Meaningful structure for browsers and assistive technology', 'Only decorative styling', 'Faster database writes', 'Password storage'], answer: 0, explanation: 'Semantic elements communicate the purpose and structure of page content.' },
  { prompt: 'Why test designs at mobile sizes?', choices: ['Check layout and interaction across screen sizes', 'Make desktop inaccessible', 'Replace content writing', 'Skip user feedback'], answer: 0, explanation: 'Responsive checks reveal layout and touch interaction issues on small screens.' }
]
questionSets['Data science and machine learning basics'] = [
  { prompt: 'Why split data into training and test sets?', choices: ['Estimate performance on unseen examples', 'Increase the number of labels', 'Remove all uncertainty', 'Encrypt the dataset'], answer: 0, explanation: 'A held-out test set estimates how a model performs on unseen data.' },
  { prompt: 'What is data leakage?', choices: ['Training uses information unavailable at prediction time', 'A dataset has a backup', 'A chart has a legend', 'A row has missing values'], answer: 0, explanation: 'Leakage makes evaluation unrealistically optimistic.' },
  { prompt: 'When is accuracy a poor metric?', choices: ['When classes are highly imbalanced', 'When every class is balanced', 'When there is one feature', 'When data is stored as CSV'], answer: 0, explanation: 'A model can score high accuracy by ignoring a rare class.' },
  { prompt: 'What does a confusion matrix summarize?', choices: ['Predicted versus actual class counts', 'Feature names only', 'Cloud costs', 'User research notes'], answer: 0, explanation: 'It shows true and false predictions by class.' },
  { prompt: 'What is overfitting?', choices: ['Learning training details that do not generalize', 'A model using too few features', 'Cleaning a dataset', 'Deploying a model'], answer: 0, explanation: 'An overfit model performs well on training data but poorly on new examples.' },
  { prompt: 'Why inspect data before modeling?', choices: ['Find quality issues, missingness, and distributions', 'Guarantee a perfect model', 'Avoid documenting assumptions', 'Choose a color palette'], answer: 0, explanation: 'Exploration helps identify data issues and informs sensible modeling choices.' },
  { prompt: 'What is a feature?', choices: ['An input variable used by a model', 'A model prediction only', 'A deployment server', 'A test case name'], answer: 0, explanation: 'Features are the input variables used to make predictions.' },
  { prompt: 'What should responsible ML evaluation consider?', choices: ['Performance, limitations, and potential harms', 'Only a single accuracy number', 'Only training speed', 'The model file size only'], answer: 0, explanation: 'Evaluation should include limits and possible impacts on people.' }
]
questionSets['Product thinking and prioritization'] = [
  { prompt: 'What is a product outcome?', choices: ['A measurable change for users or the business', 'A list of meetings', 'A number of code commits', 'A color in a mockup'], answer: 0, explanation: 'Outcomes describe a meaningful change, not just shipped output.' },
  { prompt: 'What is a useful first step before building a feature?', choices: ['Understand the user problem', 'Choose a database at random', 'Write a press release', 'Add every requested option'], answer: 0, explanation: 'A clear problem statement helps teams choose the right solution.' },
  { prompt: 'What does an MVP help a team do?', choices: ['Learn with the smallest useful solution', 'Ship every planned feature', 'Avoid user feedback', 'Guarantee revenue'], answer: 0, explanation: 'A minimum viable product tests important assumptions with limited scope.' },
  { prompt: 'What does prioritization balance?', choices: ['Value, effort, risk, and strategic fit', 'Only team preferences', 'Only color and typography', 'The order requests arrive'], answer: 0, explanation: 'Prioritization considers impact and cost alongside strategic context.' },
  { prompt: 'What is an experiment hypothesis?', choices: ['A testable statement about an expected outcome', 'A permanent requirement', 'A design file', 'A customer password'], answer: 0, explanation: 'A hypothesis predicts what change may produce and can be tested.' },
  { prompt: 'Why define success metrics before a launch?', choices: ['Know how to evaluate the result', 'Make the feature larger', 'Avoid measuring user impact', 'Replace accessibility checks'], answer: 0, explanation: 'Predefined measures clarify what evidence will show whether a change helped.' },
  { prompt: 'What does a product roadmap communicate?', choices: ['Direction and planned outcomes over time', 'A fixed promise that nothing can change', 'Only individual task assignments', 'A source code diff'], answer: 0, explanation: 'A roadmap communicates direction while allowing plans to adapt as evidence changes.' },
  { prompt: 'How should conflicting stakeholder requests be handled?', choices: ['Compare them against user needs and product goals', 'Build all immediately', 'Ignore all feedback', 'Pick the loudest request'], answer: 0, explanation: 'Use evidence and goals to make tradeoffs visible.' }
]
questionSets['Software testing and quality assurance'] = [
  { prompt: 'What does a unit test usually isolate?', choices: ['A small function or behavior', 'The entire production network', 'Only the visual theme', 'A company department'], answer: 0, explanation: 'Unit tests check a small part of behavior in isolation.' },
  { prompt: 'What is a regression test for?', choices: ['Catch previously fixed behavior breaking again', 'Measure customer satisfaction only', 'Replace code review', 'Encrypt a database'], answer: 0, explanation: 'Regression tests protect existing behavior from accidental changes.' },
  { prompt: 'What makes a bug report useful?', choices: ['Reproduction steps, expected and actual behavior', 'Only the word broken', 'A screenshot with no context', 'A guess about the developer'], answer: 0, explanation: 'Clear steps and results help others reproduce and diagnose an issue.' },
  { prompt: 'What is boundary-value testing?', choices: ['Testing values at and around input limits', 'Checking page borders', 'Testing only typical values', 'Reviewing logo alignment'], answer: 0, explanation: 'Boundary tests target edges where errors commonly occur.' },
  { prompt: 'What should a test assert?', choices: ['The expected observable behavior', 'Private implementation details only', 'A random value', 'That no code runs'], answer: 0, explanation: 'Behavior-based assertions are robust and describe what users depend on.' },
  { prompt: 'Why automate repetitive checks?', choices: ['Run them consistently and quickly', 'Avoid investigating failures', 'Guarantee zero bugs', 'Replace all manual exploration'], answer: 0, explanation: 'Automation makes repeatable checks fast, though it does not guarantee defect-free software.' },
  { prompt: 'What does exploratory testing emphasize?', choices: ['Learning and testing while interacting with the product', 'Only running a fixed script', 'Compiling source code', 'Changing requirements'], answer: 0, explanation: 'Exploratory testing uses observation and learning to guide test ideas.' },
  { prompt: 'What should happen when a test fails in CI?', choices: ['Review the failure and block unsafe changes as appropriate', 'Ignore every failure', 'Delete the test', 'Deploy without review'], answer: 0, explanation: 'Failures need investigation so regressions do not silently ship.' }
]
Object.values(questionSets).forEach((questions) => questions.forEach((question, index) => {
  const shift = index % question.choices.length
  question.choices = [...question.choices.slice(shift), ...question.choices.slice(0, shift)]
  question.answer = (question.answer - shift + question.choices.length) % question.choices.length
}))
const categories = ['All skills', 'Backend', 'Frontend', 'Data', 'Security', 'Cloud & DevOps', 'UI/UX', 'Data Science', 'Product', 'Quality Assurance']

export default function App() {
  const [publicProfileId] = useState(() => window.location.pathname.match(/^\/profile\/([^/]+)/)?.[1] || null)
  const [theme, setTheme] = useState(() => ['light', 'ocean', 'lavender', 'sunset', 'dark'].includes(window.localStorage.getItem('skillproof-theme')) ? window.localStorage.getItem('skillproof-theme') : 'light')
  const [items, setItems] = useState(samples)
  const [category, setCategory] = useState('All skills')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [saved, setSaved] = useState([])
  const [connected, setConnected] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [practice, setPractice] = useState(null)
  const [user, setUser] = useState(null)
  const [page, setPage] = useState(publicProfileId ? 'public' : 'proving')
  const [authMode, setAuthMode] = useState('login')
  const [notice, setNotice] = useState('')
  const [attempts, setAttempts] = useState([])
  const [savingAttempt, setSavingAttempt] = useState(false)
  const [attemptSaveMessage, setAttemptSaveMessage] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('skillproof-theme', theme)
  }, [theme])

  useEffect(() => {
    fetch('/api/v1/assessments').then((r) => { if (!r.ok) throw Error(); return r.json() }).then((data) => {
      if (data.length) {
        setItems(data.map((item, i) => ({ ...item, mark: ['J', '↗', '⚛', '⌘', '◈'][i % 5], tone: ['lavender', 'mint', 'peach', 'blue', 'rose'][i % 5], completed: ['2.4k', '1.8k', '3.1k', '1.2k', '860'][i % 5] })))
        setConnected(true)
      }
    }).catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    api('/api/v1/auth/me').then(setUser).catch(() => setUser(null))
  }, [])
  useEffect(() => {
    if (!user) { setSaved([]); return }
    api('/api/v1/saved-assessments').then((data) => setSaved(data.map((item) => item.id))).catch(() => setSaved([]))
    api('/api/v1/practice-attempts').then(setAttempts).catch(() => setAttempts([]))
  }, [user])

  const filtered = useMemo(() => items.filter((item) => (category === 'All skills' || item.category === category) && `${item.title} ${item.summary} ${item.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [items, category, query])
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((total, attempt) => total + (attempt.totalQuestions ? attempt.score / attempt.totalQuestions * 100 : 0), 0) / attempts.length)
    : 0
  const toggleSaved = async (id) => {
    if (!user) { setAuthMode('login'); setPage('auth'); setNotice('Sign in or create a free account to save assessments.'); return }
    try {
      if (saved.includes(id)) { await api(`/api/v1/saved-assessments/${id}`, { method: 'DELETE' }); setSaved((current) => current.filter((key) => key !== id)) }
      else { await api(`/api/v1/saved-assessments/${id}`, { method: 'POST' }); setSaved((current) => [...current, id]) }
    } catch (e) { setNotice(e.message) }
  }
  const quiz = selected ? questionSets[selected.title] || (selected.title.toLowerCase().startsWith('react') ? questionSets['React state & component thinking'] : questionSets['Java fundamentals: collections and streams']) : []
  const closeChallenge = () => { setSelected(null); setPractice(null) }
  const startPractice = () => { setAttemptSaveMessage(''); setPractice({ questionIndex: 0, answers: [], completed: false }) }
  const chooseAnswer = (choiceIndex) => setPractice((current) => { const answers = [...current.answers]; answers[current.questionIndex] = choiceIndex; return { ...current, answers } })
  const score = quiz.reduce((total, question, index) => total + (practice?.answers[index] === question.answer ? 1 : 0), 0)
  const finishPractice = async () => {
    setPractice((current) => ({ ...current, completed: true }))
    if (user && selected?.id) {
      setSavingAttempt(true)
      setAttemptSaveMessage('Saving your result and answer review…')
      const answerReviews = quiz.map((question, index) => ({
        question: question.prompt,
        selectedAnswer: question.choices[practice.answers[index]],
        correctAnswer: question.choices[question.answer],
        explanation: question.explanation,
      }))
      try {
        const attempt = await api('/api/v1/practice-attempts', { method: 'POST', body: JSON.stringify({ assessmentId: selected.id, score, totalQuestions: quiz.length, answerReviews }) })
        setAttempts((current) => [attempt, ...current])
        setAttemptSaveMessage('Saved to My proof. You can reopen this review from your practice history.')
      }
      catch (e) { setAttemptSaveMessage(`Could not save this result: ${e.message}`) }
      finally { setSavingAttempt(false) }
    } else setAttemptSaveMessage('This result is only in this session. Sign in before your next practice to save its review.')
  }
  const saveProvingAttempt = async (request) => {
    const attempt = await api('/api/v1/practice-attempts', { method: 'POST', body: JSON.stringify(request) })
    setAttempts((current) => [attempt, ...current])
    return attempt
  }

  if (page === 'auth') return <><AuthPage mode={authMode} onMode={setAuthMode} onBack={() => { setPage('proving'); setNotice('') }} onAuthenticated={(account) => { setUser(account); setPage('proving'); setNotice(`Welcome, ${account.displayName}!`) }} theme={theme} onChangeTheme={setTheme}/>{notice && <div className="toast-message">{notice}</div>}</>
  if (page === 'public') return <PublicProfilePage id={publicProfileId} theme={theme} onChangeTheme={setTheme}/>
  if (page === 'profile') return <ProfilePage user={user} onBack={() => setPage('explore')} onUpdated={(updated) => { setUser(updated); setNotice('Your profile has been saved.') }} theme={theme} onChangeTheme={setTheme}/>
  const openPage = (destination) => {
    if (!user) { setAuthMode('login'); setPage('auth'); setNotice('Sign in or create a free account to access your workspace.'); return }
    setPage(destination)
  }
  const signOut = async () => { try { await api('/api/v1/auth/logout', { method: 'POST' }); setUser(null); setSaved([]); setNotice('You have signed out.') } catch (e) { setNotice(e.message) } }

  return <div className="shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-icon"><ShieldCheck size={20} /></span><span>skillproof</span><button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <p className="side-label">WORKSPACE</p>
      <nav className="side-nav"><button className={`nav-item ${page === 'proving' ? 'selected' : ''}`} onClick={() => { setPage('proving'); setSelected(null) }}><Compass size={18} />Proving Ground</button><button className={`nav-item ${page === 'explore' ? 'selected' : ''}`} onClick={() => { setPage('explore'); setSelected(null) }}><Target size={18}/>Explore assessments</button><button className={`nav-item ${page === 'proof' ? 'selected' : ''}`} onClick={() => openPage('proof')}><Trophy size={18} />My proof{attempts.length > 0 && <span className="nav-count">{attempts.length}</span>}</button><button className="nav-item" onClick={() => openPage('profile')}><FileText size={18} />Career workspace{!user && <LockKeyhole className="lock" size={14} />}</button><button className="nav-item" onClick={() => openPage('saved')}><Bookmark size={18} />Saved{saved.length > 0 && <span className="nav-count">{saved.length}</span>}</button><button className={`nav-item ${page === 'compiler' ? 'selected' : ''}`} onClick={() => openPage('compiler')}><Code2 size={18}/>Code playground</button></nav>
      <div className="side-bottom"><div className="side-promo"><span className="promo-icon"><Sparkles size={17} /></span><h3>Your skills deserve<br/>to be seen.</h3><p>Build a profile recruiters<br/>can trust.</p><button onClick={() => user ? setPage('profile') : (setAuthMode('register'), setPage('auth'))}>Explore how <ArrowUpRight size={14} /></button></div><div className="user-row"><span className="user-avatar">{user?.displayName?.[0]?.toUpperCase() || 'G'}</span><span><b>{user?.displayName || 'Guest'}</b><small>{user ? <button className="inline-action" onClick={signOut}>Sign out</button> : <button className="inline-action" onClick={() => { setAuthMode('login'); setPage('auth') }}>Sign in</button>}</small></span><ChevronDown size={16} /></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{page === 'compiler' ? 'Code playground' : page === 'proof' ? 'My proof' : page === 'saved' ? 'Saved assessments' : page === 'proving' ? 'Proving Ground' : page === 'explore' ? 'Explore assessments' : 'Explore'}</b></div><div className="top-actions"><span className={`connection ${connected ? 'is-connected' : ''}`}><i/>{connected ? 'Connected' : 'Preview mode'}</span>{!user && <button className="top-login" onClick={() => { setAuthMode('login'); setPage('auth') }}>Sign in</button>}<ThemePicker theme={theme} onChange={setTheme}/><button className="bell" aria-label="Notifications"><Bell size={18}/><i/></button><span className="user-avatar small">{user?.displayName?.[0]?.toUpperCase() || 'G'}</span></div></header>
      {notice && <button className="toast-message" onClick={() => setNotice('')}>{notice} <X size={14}/></button>}
      {page === 'proving' && <ProvingGround assessments={items} attempts={attempts} user={user} onOpenMcqs={() => setPage('explore')} onSaveAttempt={saveProvingAttempt}/>}
      {page === 'saved' && <section className="catalog saved-view"><div className="section-head"><div><div className="section-kicker">YOUR WORKSPACE</div><h2>Saved assessments<span>.</span></h2><p>Challenges you have bookmarked for later.</p></div><button className="view-all" onClick={() => setPage('explore')}>Explore <ArrowRight size={16}/></button></div><div className="card-grid">{items.filter((item) => saved.includes(item.id)).map((item) => <article className="challenge-card" key={item.id}><div className="card-top"><span className={`skill-mark ${item.tone}`}>{item.mark}</span><button className="save saved" onClick={() => toggleSaved(item.id)}><Bookmark size={17} fill="currentColor"/></button></div><div className="meta"><b>{item.category}</b><i/> {item.level}</div><h3>{item.title}</h3><p className="description">{item.summary}</p><button className="card-link" onClick={() => { setPage('explore'); setSelected(item) }}>View challenge <ArrowUpRight size={15}/></button></article>)}</div>{saved.length === 0 && <div className="empty"><Bookmark size={22}/><b>No saved assessments yet</b><span>Use the bookmark on a challenge to keep it here.</span><button onClick={() => setPage('explore')}>Explore challenges</button></div>}</section>}
      {page === 'proof' && <section className="catalog saved-view"><div className="section-head"><div><div className="section-kicker">YOUR WORKSPACE</div><h2>My proof<span>.</span></h2><p>Practice history saved to your account. These scores are practice results, not verified credentials.</p></div><button className="view-all" onClick={() => setPage('explore')}>Explore <ArrowRight size={16}/></button></div>{attempts.length ? <div className="attempt-list">{attempts.map((attempt) => <article className="attempt-card" key={attempt.id}><span className="result-icon"><Trophy size={20}/></span><div className="attempt-summary"><b>{attempt.assessmentTitle}</b><small>{new Date(attempt.completedAt).toLocaleString()} · Practice</small>{attempt.answerReviews?.length ? <details className="attempt-review"><summary>Review {attempt.answerReviews.length} answers</summary><ol>{attempt.answerReviews.map((answer, index) => <li className={answer.correct ? 'answer-review-correct' : 'answer-review-incorrect'} key={`${attempt.id}-${index}`}><b>{answer.question}</b><small>Your answer: {answer.selectedAnswer}</small>{!answer.correct && <small>Correct answer: {answer.correctAnswer}</small>}<p>{answer.explanation}</p></li>)}</ol></details> : <small className="attempt-review-legacy">Question review is unavailable for this earlier result.</small>}</div><strong>{attempt.score}/{attempt.totalQuestions}<small>{Math.round(attempt.score / attempt.totalQuestions * 100)}%</small></strong></article>)}</div> : <div className="empty"><Trophy size={22}/><b>Your proof portfolio is ready to grow</b><span>Complete a challenge to start building your SkillProof story.</span><button onClick={() => setPage('explore')}>Find a challenge</button></div>}</section>}
      {page === 'compiler' && <CodePlayground/>}
      {page === 'explore' && <>
      {user ? <section className="learner-dashboard">
        <div className="dashboard-heading"><div><div className="section-kicker"><Sparkles size={13}/> YOUR LEARNING SPACE</div><h1>Welcome back, {user.displayName?.split(' ')[0] || 'learner'}.</h1><p>Every challenge you finish adds another piece to your SkillProof story.</p></div><button className="primary-button" onClick={() => document.getElementById('challenge-list')?.scrollIntoView({ behavior: 'smooth' })}>Find a challenge <ArrowRight size={16}/></button></div>
        <div className="dashboard-stats">
          <article><span className="dashboard-stat-icon"><Trophy size={17}/></span><div><b>{attempts.length}</b><small>Practice attempts</small></div></article>
          <article><span className="dashboard-stat-icon"><Target size={17}/></span><div><b>{attempts.length ? `${averageScore}%` : '—'}</b><small>Average score</small></div></article>
          <article><span className="dashboard-stat-icon"><Bookmark size={17}/></span><div><b>{saved.length}</b><small>Saved challenges</small></div></article>
        </div>
        <div className="dashboard-next"><div><span className="dashboard-next-icon"><Compass size={17}/></span><span><b>{attempts.length ? 'Keep your momentum going' : 'Start building your portfolio'}</b><small>{attempts.length ? 'Try another challenge and keep growing your practice history.' : 'Complete a practice assessment to see your progress here.'}</small></span></div><button onClick={() => attempts.length ? openPage('proof') : document.getElementById('challenge-list')?.scrollIntoView({ behavior: 'smooth' })}>{attempts.length ? 'View practice history' : 'Browse challenges'} <ArrowRight size={15}/></button></div>
        <p className="dashboard-note"><ShieldCheck size={14}/> These are practice results to help track learning. They are not verified credentials.</p>
      </section> : <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span><Sparkles size={13}/></span> YOUR NEXT CHAPTER STARTS HERE</div><h1>Don't just say it.<br/><em>Show your skills.</em></h1><p className="hero-subtitle">Practice real-world skills, track your progress, and build a profile that tells your story.</p><div className="hero-buttons"><button className="primary-button" onClick={() => document.getElementById('challenge-list')?.scrollIntoView({ behavior: 'smooth' })}>Find your first challenge <ArrowRight size={16}/></button><div className="learner-proof"><div className="avatar-stack"><span>AR</span><span>MK</span><span>JS</span><span>LP</span></div><small><b>2,400+</b> learners started</small></div></div></div>
        <div className="hero-visual" aria-label="Practice badge preview"><div className="dot-grid"/><div className="float-label float-top"><span><Check size={12}/></span> Practice badge</div><div className="proof-card"><div className="proof-head"><span className="profile-avatar">SP</span><span className="profile-name"><b>Your portfolio</b><small>Learning progress</small></span><BadgeCheck className="badge" size={18}/></div><div className="divider"/><small className="label">CAREER PATH</small><div className="proof-item"><span className="java-icon">J</span><span><b>Backend development</b><small>Java · APIs · Databases</small></span></div><div className="score-row"><span className="score">3</span><span><b>Committed learner</b><small>Practice assessments</small></span><ArrowUpRight size={17}/></div><div className="proof-foot"><span><ShieldCheck size={13}/> Shareable profile</span><small>SKILLPROOF</small></div></div><div className="float-label float-bottom"><Sparkles size={14}/> Progress worth sharing</div><span className="star star-a">✳</span><span className="star star-b">✳</span></div>
        <div className="stats"><div><span className="stat-icon green"><Users size={17}/></span><b>Learn</b><small>build proof as you go</small></div><div><span className="stat-icon yellow"><Target size={17}/></span><b>{items.length}+</b><small>practice assessments</small></div><div><span className="stat-icon purple"><BriefcaseBusiness size={17}/></span><b>{categories.length - 1}</b><small>career path options</small></div><div className="stat-message"><Flame size={15}/> Your next opportunity<br/>starts with one challenge</div></div>
      </section>}
      <section className="catalog" id="challenge-list"><div className="section-head"><div><div className="section-kicker">THE SKILL LIBRARY</div><h2>Find your proving ground<span>.</span></h2><p>Short, practical challenges built around the work you want to do.</p></div><button className="view-all" onClick={() => { setCategory('All skills'); setQuery('') }}>View all challenges <ArrowRight size={16}/></button></div>
        <div className="toolbar"><div className="pills" role="group" aria-label="Filter by career path">{categories.map((label) => <button key={label} className={category === label ? 'active' : ''} onClick={() => setCategory(label)}>{label === 'All skills' && <Layers3 size={14}/>} {label}</button>)}</div><label className="search"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills or topics" aria-label="Search assessments"/><kbd>⌘ K</kbd></label></div>
        <div className="card-grid">{filtered.map((item) => <article className="challenge-card" key={item.id}><div className="card-top"><span className={`skill-mark ${item.tone || 'lavender'}`}>{item.mark}</span><button className={`save ${saved.includes(item.id) ? 'saved' : ''}`} onClick={() => toggleSaved(item.id)} aria-label={saved.includes(item.id) ? 'Unsave assessment' : 'Save assessment'}><Bookmark size={17} fill={saved.includes(item.id) ? 'currentColor' : 'none'}/></button></div><div className="meta"><b>{item.category}</b><i/> {item.level}</div><h3>{item.title}</h3><p className="description">{item.summary}</p><div className="tags">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="card-foot"><span><Clock3 size={14}/> {item.durationMinutes} min</span><span className="done"><i/> {item.completed || '840'} completed</span></div><button className="card-link" onClick={() => setSelected(item)}>View challenge <ArrowUpRight size={15}/></button></article>)}</div>
        {filtered.length === 0 && <div className="empty"><Search size={22}/><b>No challenges found</b><span>Try a different skill or category.</span><button onClick={() => { setQuery(''); setCategory('All skills') }}>Clear filters</button></div>}
        <div className="bottom-banner"><span className="banner-icon"><GraduationCap size={21}/></span><span className="banner-copy"><b>Not sure where to start?</b><small>Choose a career path to see focused practice assessments.</small></span><button onClick={() => { setCategory('Backend'); document.getElementById('challenge-list')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore career paths <ArrowRight size={15}/></button></div>
      </section>
      <footer className="footer"><span>© 2026 SkillProof</span><span>Built to make skills visible.</span><div><a href="#">About</a><a href="#">For recruiters</a><a href="#">Privacy</a></div></footer>
      </>}
    </main>
    {selected && <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeChallenge() }}>
      {!practice && <section className="modal" role="dialog" aria-modal="true" aria-labelledby="challenge-title"><button className="modal-close" onClick={closeChallenge} aria-label="Close"><X size={18}/></button><span className={`skill-mark modal-mark ${selected.tone}`}>{selected.mark}</span><div className="meta"><b>{selected.category}</b><i/> {selected.level}</div><h2 id="challenge-title">{selected.title}</h2><p>{selected.summary}</p><div className="modal-info"><span><Clock3 size={16}/> About {selected.durationMinutes} minutes</span><span><BadgeCheck size={16}/> Practice assessment</span></div><div className="tags">{selected.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><button className="primary-button modal-start" onClick={startPractice}>Start practice <ArrowRight size={16}/></button><small className="coming-soon">Practice scores are saved only in this browser session. Verified public proof comes later.</small></section>}
      {practice && !practice.completed && <section className="modal quiz-modal" role="dialog" aria-modal="true" aria-labelledby="question-title"><button className="modal-close" onClick={closeChallenge} aria-label="Exit practice"><X size={18}/></button><div className="quiz-topline"><span>{selected.category} · Practice</span><span>Question {practice.questionIndex + 1} of {quiz.length}</span></div><div className="quiz-progress"><span style={{ width: `${((practice.questionIndex + 1) / quiz.length) * 100}%` }}/></div><h2 id="question-title">{quiz[practice.questionIndex].prompt}</h2><div className="answer-list" role="radiogroup" aria-labelledby="question-title">{quiz[practice.questionIndex].choices.map((choice, index) => <button key={choice} className={`answer-option ${practice.answers[practice.questionIndex] === index ? 'chosen' : ''}`} role="radio" aria-checked={practice.answers[practice.questionIndex] === index} onClick={() => chooseAnswer(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{choice}</span>{practice.answers[practice.questionIndex] === index && <Check size={17}/>}</button>)}</div><div className="quiz-controls"><button className="quiz-back" disabled={practice.questionIndex === 0} onClick={() => setPractice((current) => ({ ...current, questionIndex: current.questionIndex - 1 }))}>Back</button>{practice.questionIndex < quiz.length - 1 ? <button className="primary-button" disabled={practice.answers[practice.questionIndex] === undefined} onClick={() => setPractice((current) => ({ ...current, questionIndex: current.questionIndex + 1 }))}>Next question <ArrowRight size={16}/></button> : <button className="primary-button" disabled={practice.answers[practice.questionIndex] === undefined || savingAttempt} onClick={finishPractice}>{savingAttempt ? 'Saving…' : 'Finish practice'} <Check size={16}/></button>}</div><small className="coming-soon">Practice results are stored for signed-in users, but are not verified proof of skill.</small></section>}
      {practice?.completed && <section className="modal result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title"><button className="modal-close" onClick={closeChallenge} aria-label="Close results"><X size={18}/></button><span className="result-icon"><Trophy size={25}/></span><div className="section-kicker">PRACTICE COMPLETE</div><h2 id="result-title">You scored {score} of {quiz.length}</h2><p className="result-percent">{Math.round((score / quiz.length) * 100)}% correct</p><p className="attempt-save-message" role="status" aria-live="polite">{attemptSaveMessage}</p><div className="review-list">{quiz.map((question, index) => <div className="review-item" key={question.prompt}><span className={practice.answers[index] === question.answer ? 'review-correct' : 'review-wrong'}>{practice.answers[index] === question.answer ? <Check size={15}/> : <X size={15}/>}</span><div><b>{question.prompt}</b><small>{question.explanation}</small></div></div>)}</div><button className="primary-button modal-start" onClick={closeChallenge}>Back to challenges <ArrowRight size={16}/></button><small className="coming-soon">This is a practice result, not verified proof of skill.</small></section>}
    </div>}
    <Chatbot user={user} onLogin={() => { setAuthMode('login'); setPage('auth') }}/>
  </div>
}


