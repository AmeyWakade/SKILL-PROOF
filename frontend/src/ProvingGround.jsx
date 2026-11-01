import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, Code2, FileText, Play, RotateCcw, Search, Sparkles, Target } from 'lucide-react'
import { codingChallenges, practiceSets, quizTopics, scoreQuiz, topicNotes } from './provingGroundContent'

const sections = [
  { id: 'home', label: 'Overview', icon: Sparkles },
  { id: 'mcqs', label: 'MCQs', icon: Target },
  { id: 'quizzes', label: 'Quizzes', icon: Check },
  { id: 'coding', label: 'Coding', icon: Code2 },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'practice', label: 'Practice', icon: RotateCcw },
]
const draftKey = 'skillproof-proving-ground-drafts-v1'

export default function ProvingGround({ assessments = [], attempts = [], user, onOpenMcqs, onSaveAttempt }) {
  const [section, setSection] = useState('home')
  const [search, setSearch] = useState('')
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [challengeId, setChallengeId] = useState(codingChallenges[0].id)
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem(draftKey) || '{}') } catch { return {} }
  })
  const visibleNotes = useMemo(() => topicNotes.filter((note) => `${note.title} ${note.topic} ${note.body} ${note.bullets.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [search])
  const challenge = codingChallenges.find((item) => item.id === challengeId) || codingChallenges[0]
  const code = drafts[challenge.id] ?? challenge.starter

  function openQuiz(quiz) {
    setActiveQuiz(quiz); setAnswers([]); setQuestionIndex(0); setResult(null); setSaveMessage('')
  }
  async function finishQuiz() {
    const score = scoreQuiz(activeQuiz.questions, answers)
    setResult({ score, answers: [...answers] })
    if (!user) { setSaveMessage('This result is available for this session only. Sign in to save practice history.'); return }
    const parent = assessments.find((item) => item.title?.toLowerCase().replaceAll('&', 'and') === activeQuiz.assessmentTitle.toLowerCase().replaceAll('&', 'and'))
    if (!parent) { setSaveMessage('Could not find the related assessment in the catalog, so this result was not saved.'); return }
    setSaving(true); setSaveMessage('Saving your practice result…')
    try {
      const answerReviews = activeQuiz.questions.map((question, index) => ({
        question: `${activeQuiz.title}: ${question.prompt}`,
        selectedAnswer: question.choices[answers[index]],
        correctAnswer: question.choices[question.answer],
        explanation: question.explanation,
      }))
      await onSaveAttempt({ assessmentId: parent.id, score, totalQuestions: activeQuiz.questions.length, answerReviews })
      setSaveMessage('Saved to My proof as a practice result. It is grouped under the related assessment.')
    } catch (error) { setSaveMessage(`Your result is shown here, but it could not be saved: ${error.message}`) }
    finally { setSaving(false) }
  }
  function saveCode(value) {
    const next = { ...drafts, [challenge.id]: value }
    setDrafts(next)
    try { window.localStorage.setItem(draftKey, JSON.stringify(next)) } catch { /* The editor still works if browser storage is unavailable. */ }
  }
  function saveSubmission() {
    saveCode(code)
    setSaveMessage('Submission draft saved in this browser. Code execution is unavailable, so no correctness check was run.')
  }

  return <section className="proving-ground" aria-labelledby="proving-title">
    <header className="proving-heading">
      <div><div className="section-kicker"><Sparkles size={13}/> LEARN BY DOING</div><h1 id="proving-title">Proving Ground<span>.</span></h1><p>Build understanding with focused questions, notes, and coding practice.</p></div>
      <span className="proving-storage"><BookOpen size={15}/> {user ? 'Practice history saves to your account' : 'Guest practice stays in this session'}</span>
    </header>

    <nav className="proving-tabs" aria-label="Proving Ground sections">
      {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={section === id ? 'page' : undefined} className={section === id ? 'active' : ''} onClick={() => { setSection(id); setResult(null); setSaveMessage('') }}><Icon size={15}/>{label}</button>)}
    </nav>

    {section === 'home' && <>
      <div className="proving-intro"><div><h2>Choose how you want to learn</h2><p>Start with a short activity. You can repeat quizzes and practice sets whenever you like.</p></div><span>{assessments.length} MCQ assessments</span></div>
      <div className="proving-card-grid">
        <article><span className="proving-icon mcq"><Target size={19}/></span><h3>MCQs</h3><p>Open the existing assessment catalog and its full practice flow.</p><button onClick={onOpenMcqs}>Browse assessments <ArrowRight size={15}/></button></article>
        <article><span className="proving-icon quiz"><Check size={19}/></span><h3>Quizzes</h3><p>Take short, topic-based quizzes and review each answer.</p><button onClick={() => setSection('quizzes')}>Explore quizzes <ArrowRight size={15}/></button></article>
        <article><span className="proving-icon coding"><Code2 size={19}/></span><h3>Coding</h3><p>Read problems, examples, and starter code. Save a draft to this browser.</p><button onClick={() => setSection('coding')}>Browse challenges <ArrowRight size={15}/></button></article>
        <article><span className="proving-icon notes"><FileText size={19}/></span><h3>Notes</h3><p>Review concise topic notes linked to related learning activities.</p><button onClick={() => setSection('notes')}>Read topic notes <ArrowRight size={15}/></button></article>
        <article><span className="proving-icon practice"><RotateCcw size={19}/></span><h3>Practice</h3><p>Repeat a focused set and track your signed-in results in My proof.</p><button onClick={() => setSection('practice')}>Start a practice set <ArrowRight size={15}/></button></article>
      </div>
    </>}

    {section !== 'home' && <div className="proving-section">
      {section === 'mcqs' && <section className="proving-panel"><div className="proving-panel-heading"><div><h2>Multiple-choice assessments</h2><p>Your existing assessments, saved challenges, and question review remain available.</p></div></div><div className="proving-empty"><Target size={24}/><b>{assessments.length ? `${assessments.length} assessments ready` : 'Assessment catalog is empty'}</b><span>{assessments.length ? 'Continue to the existing assessment catalog to search, save, and practice.' : 'The catalog will appear here when assessment data is available.'}</span>{assessments.length > 0 && <button onClick={onOpenMcqs}>Open MCQ catalog <ArrowRight size={15}/></button>}</div></section>}

      {(section === 'quizzes' || section === 'practice') && <section className="proving-panel">
        {!activeQuiz && <><div className="proving-panel-heading"><div><h2>{section === 'quizzes' ? 'Topic quizzes' : 'Focused practice sets'}</h2><p>{section === 'quizzes' ? 'Short quizzes are distinct from the longer catalog assessments.' : 'Repeat these sets for a quick refresher; every run creates a separate attempt.'}</p></div></div><div className="proving-list">{(section === 'quizzes' ? quizTopics : practiceSets.map((set) => ({ ...set, ...quizTopics.find((quiz) => quiz.id === set.quizId), title: set.title }))).map((quiz) => {
          const set = section === 'practice' ? practiceSets.find((item) => item.quizId === quiz.id) : null
          const runCount = attempts.filter((attempt) => attempt.assessmentTitle === quiz.assessmentTitle).length
          return <article className="proving-list-card" key={`${section}-${quiz.id}`}><span className="proving-icon quiz"><Check size={18}/></span><div><small>{quiz.topic} · {quiz.questions.length} questions</small><h3>{quiz.title}</h3><p>{set?.description || `A quick knowledge check on ${quiz.topic.toLowerCase()}.`}</p><small>{user ? `${runCount} saved ${runCount === 1 ? 'attempt' : 'attempts'} under related assessment` : 'Guest result stays in this session'}</small></div><button onClick={() => openQuiz(quiz)}><Play size={15}/>{section === 'quizzes' ? 'Start quiz' : 'Practice again'}</button></article>
        })}</div></>}
        {activeQuiz && !result && <div className="proving-quiz"><div className="proving-panel-heading"><div><small>{section === 'practice' ? 'REPEATABLE PRACTICE' : 'TOPIC QUIZ'} · {activeQuiz.topic}</small><h2>{activeQuiz.title}</h2><p>Question {questionIndex + 1} of {activeQuiz.questions.length}</p></div><button className="text-button" onClick={() => setActiveQuiz(null)}><ArrowLeft size={15}/> All {section}</button></div><div className="quiz-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax={activeQuiz.questions.length} aria-valuenow={questionIndex + 1}><span style={{ width: `${((questionIndex + 1) / activeQuiz.questions.length) * 100}%` }}/></div><h3>{activeQuiz.questions[questionIndex]?.prompt}</h3><div className="proving-answers" role="group" aria-label="Answer choices">{activeQuiz.questions[questionIndex]?.choices.map((choice, index) => <button key={choice} className={answers[questionIndex] === index ? 'chosen' : ''} aria-pressed={answers[questionIndex] === index} onClick={() => setAnswers((current) => { const next = [...current]; next[questionIndex] = index; return next })}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}</div><div className="proving-controls"><button className="text-button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}><ArrowLeft size={15}/> Back</button>{questionIndex < activeQuiz.questions.length - 1 ? <button className="primary-button" disabled={answers[questionIndex] === undefined} onClick={() => setQuestionIndex((current) => current + 1)}>Next question <ArrowRight size={15}/></button> : <button className="primary-button" disabled={answers[questionIndex] === undefined || saving} onClick={finishQuiz}>{saving ? 'Saving…' : 'See results'} <Check size={15}/></button>}</div><p className="proving-hint">A practice quiz is a learning activity, not a verified credential.</p></div>}
        {activeQuiz && result && <div className="proving-result"><span className="proving-icon quiz"><Check size={19}/></span><div className="section-kicker">{section === 'practice' ? 'PRACTICE COMPLETE' : 'QUIZ COMPLETE'}</div><h2>{activeQuiz.title}</h2><strong>{result.score}/{activeQuiz.questions.length} correct · {Math.round(result.score / activeQuiz.questions.length * 100)}%</strong><p role="status" aria-live="polite">{saveMessage}</p><ol>{activeQuiz.questions.map((question, index) => <li key={question.prompt}><b>{question.prompt}</b><small className={result.answers[index] === question.answer ? 'correct' : 'incorrect'}>{result.answers[index] === question.answer ? 'Correct' : `Your answer: ${question.choices[result.answers[index]] || 'Not answered'}`}</small><p>{question.explanation}</p></li>)}</ol><button className="primary-button" onClick={() => openQuiz(activeQuiz)}><RotateCcw size={15}/> Repeat</button><button className="text-button" onClick={() => { setActiveQuiz(null); setResult(null) }}>Back to {section}</button></div>}
      </section>}

      {section === 'coding' && <section className="proving-panel"><div className="proving-panel-heading"><div><h2>Coding challenges</h2><p>Explore a problem, study the examples, then draft your solution.</p></div><span className="unavailable-pill">Execution unavailable</span></div><label className="proving-select-label">Choose a challenge<select value={challengeId} onChange={(event) => { setChallengeId(event.target.value); setSaveMessage('') }}>{codingChallenges.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><article className="coding-problem"><div className="coding-meta"><span>{challenge.topic}</span><span>{challenge.difficulty}</span><span>{challenge.language}</span></div><h3>{challenge.title}</h3><p>{challenge.statement}</p><h4>Example</h4>{challenge.examples.map((example) => <div className="coding-example" key={example.input}><p><b>Input</b><code>{example.input}</code></p><p><b>Expected output</b><code>{example.output}</code></p><small>{example.explanation}</small></div>)}<label htmlFor="challenge-editor">Starter code · {challenge.language}</label><textarea id="challenge-editor" className="challenge-editor" value={code} onChange={(event) => saveCode(event.target.value)} spellCheck="false" /> <div className="coding-actions"><span>Drafts save in this browser only.</span><button className="primary-button" onClick={saveSubmission}>Save submission draft</button></div><p className="proving-warning" role="status">{saveMessage || 'Execution is unavailable. Saving a draft does not run or verify your code.'}</p></article></section>}

      {section === 'notes' && <section className="proving-panel"><div className="proving-panel-heading"><div><h2>Topic notes</h2><p>Short reference notes to reinforce the concepts behind practice.</p></div></div><label className="proving-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes or topics" aria-label="Search topic notes"/></label>{visibleNotes.length ? <div className="notes-list">{visibleNotes.map((note) => <article className="topic-note" key={note.id}><small>{note.topic}</small><h3>{note.title}</h3><p>{note.body}</p><ul>{note.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul><div className="note-links"><button onClick={() => { setSection('quizzes'); const quiz = quizTopics.find((item) => item.id === note.quizId); if (quiz) openQuiz(quiz) }}>Related quiz <ArrowRight size={14}/></button>{note.challengeId && <button onClick={() => { setChallengeId(note.challengeId); setSection('coding') }}>Related challenge <ArrowRight size={14}/></button>}</div></article>)}</div> : <div className="proving-empty"><Search size={22}/><b>No notes match that search</b><span>Try another topic or clear your search.</span><button onClick={() => setSearch('')}>Clear search</button></div>}</section>}
    </div>}
  </section>
}
