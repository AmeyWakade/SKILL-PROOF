import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Clock3, Code2, ListFilter, Play, Search, Send, ShieldAlert, Trophy } from 'lucide-react'
import { api } from './api'
import './CodingArena.css'
import { codingChallenges as previousPrompts } from './provingGroundContent'
import { arenaDifficulties, arenaTopics, codingArenaProblems, filterArenaProblems } from './codingArenaContent'

const progressKey = 'skillproof-coding-arena-progress-v1'
const oldDraftKey = 'skillproof-proving-ground-drafts-v1'
const statusOptions = ['All status', 'Not attempted', 'Attempted', 'Solved']
const legacyProblems = previousPrompts.map((item) => ({
  ...item, description: item.statement, language: item.language, minutes: 15, examples: item.examples, constraints: ['An original starter prompt carried forward from the first Proving Ground version.'],
  hints: ['Break the prompt into small steps before changing the starter.'], approach: 'This earlier prompt is retained for its existing draft. Its original starter is not compatible with the Java test runner.',
  complexity: 'Not supplied for this earlier prompt.', executable: false, legacy: true,
}))
const allProblems = [...codingArenaProblems, ...legacyProblems]

function readProgress() {
  try {
    const value = JSON.parse(window.localStorage.getItem(progressKey) || '{}')
    return { drafts: {}, problems: {}, history: [], ...(value && typeof value === 'object' ? value : {}) }
  } catch { return { drafts: {}, problems: {}, history: [] } }
}
function normalizeOutput(value) { return String(value ?? '').replace(/\r\n/g, '\n').trim() }
function dayKey(value = new Date()) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CodingArena({ user, onLogin, initialProblemId }) {
  const [progress, setProgress] = useState(readProgress)
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('All topics')
  const [difficulty, setDifficulty] = useState('All difficulties')
  const [status, setStatus] = useState('All status')
  const [problemId, setProblemId] = useState(null)
  const [code, setCode] = useState('')
  const [hintCount, setHintCount] = useState(0)
  const [showApproach, setShowApproach] = useState(false)
  const [compilerState, setCompilerState] = useState('checking')
  const [activity, setActivity] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [statusError, setStatusError] = useState('')

  const problem = allProblems.find((item) => item.id === problemId)
  const filteredProblems = useMemo(() => filterArenaProblems(allProblems, { search, topic, difficulty, status, progress: progress.problems }), [search, topic, difficulty, status, progress.problems])
  const attempted = Object.values(progress.problems).filter((item) => item.attempts?.length).length
  const solved = Object.values(progress.problems).filter((item) => item.solved).length
  const attemptsToday = progress.history.filter((item) => dayKey(item.at) === dayKey()).length
  const topicProgress = arenaTopics.slice(1).map((name) => ({
    topic: name,
    total: codingArenaProblems.filter((item) => item.topic === name).length,
    done: codingArenaProblems.filter((item) => item.topic === name && progress.problems[item.id]?.solved).length,
  }))

  useEffect(() => {
    if (!user) { setCompilerState('signin'); return }
    let live = true
    api('/api/v1/compiler/status').then((result) => { if (live) setCompilerState(result.enabled ? 'ready' : 'unavailable') })
      .catch((exception) => { if (live) { setCompilerState('error'); setStatusError(exception.message) } })
    return () => { live = false }
  }, [user])

  useEffect(() => {
    if (!initialProblemId) return
    const target = allProblems.find((item) => item.id === initialProblemId)
    if (target) begin(target)
  }, [initialProblemId])

  function persist(next) {
    setProgress(next)
    try { window.localStorage.setItem(progressKey, JSON.stringify(next)) } catch { setError('Browser storage is unavailable. Your progress may not remain after you leave this page.') }
  }
  function begin(problemItem) {
    let oldDraft = {}
    if (!progress.drafts[problemItem.id]) {
      try { oldDraft = JSON.parse(window.localStorage.getItem(oldDraftKey) || '{}') } catch { oldDraft = {} }
    }
    setProblemId(problemItem.id)
    setCode(progress.drafts[problemItem.id] ?? oldDraft[problemItem.id] ?? problemItem.starter)
    setHintCount(0); setShowApproach(false); setActivity(null); setError('')
  }
  function saveDraft(value) {
    setCode(value)
    persist({ ...progress, drafts: { ...progress.drafts, [problem.id]: value } })
  }
  function addHistory(entry, solvedNow = false) {
    const existing = progress.problems[problem.id] || { solved: false, attempts: [] }
    const attempt = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, problemId: problem.id, at: new Date().toISOString(), ...entry }
    const next = {
      ...progress,
      problems: { ...progress.problems, [problem.id]: { solved: existing.solved || solvedNow, attempts: [...existing.attempts, attempt] } },
      history: [...progress.history, attempt].slice(-500),
    }
    persist(next)
    return attempt
  }
  async function runSamples() {
    if (!problem?.executable) return
    setBusy(true); setError(''); setActivity(null)
    try {
      const tests = []
      for (let index = 0; index < problem.examples.length; index += 1) {
        const example = problem.examples[index]
        const result = await api('/api/v1/compiler/run', { method: 'POST', body: JSON.stringify({ language: 'java', source: code, stdin: example.input }) })
        tests.push({ index: index + 1, passed: normalizeOutput(result.output) === normalizeOutput(example.output), expected: example.output, actual: result.output || '(no output)' })
      }
      const passed = tests.filter((item) => item.passed).length
      const summary = { kind: 'sample', passed, total: tests.length, accepted: false, tests }
      addHistory(summary)
      setActivity(summary); setShowApproach(true)
    } catch (exception) {
      setError(exception.message)
      addHistory({ kind: 'sample', passed: 0, total: problem.examples.length, accepted: false, error: exception.message })
    } finally { setBusy(false) }
  }
  async function submitSolution() {
    if (!problem?.executable) return
    setBusy(true); setError(''); setActivity(null)
    try {
      const result = await api(`/api/v1/coding-arena/${problem.id}/submit`, { method: 'POST', body: JSON.stringify({ source: code }) })
      const attempt = { kind: 'hidden', passed: result.passed, total: result.total, accepted: result.accepted }
      addHistory(attempt, result.accepted)
      setActivity(attempt); setShowApproach(true)
    } catch (exception) {
      setError(exception.message)
      addHistory({ kind: 'hidden', passed: 0, total: 0, accepted: false, error: exception.message })
    } finally { setBusy(false) }
  }
  function previousProblem() {
    const index = allProblems.findIndex((item) => item.id === problemId)
    begin(allProblems[(index - 1 + allProblems.length) % allProblems.length])
  }
  function nextProblem() {
    const index = allProblems.findIndex((item) => item.id === problemId)
    begin(allProblems[(index + 1) % allProblems.length])
  }

  if (problem) {
    const saved = progress.problems[problem.id]
    const history = [...(saved?.attempts || [])].reverse()
    return <section className="arena-shell" aria-labelledby="arena-problem-title">
      <button className="arena-back" onClick={() => { setProblemId(null); setError(''); setActivity(null) }}><ArrowLeft size={15}/> Problem browser</button>
      <div className="arena-problem-heading"><div><div className="arena-meta"><span>{problem.topic}</span><span>{problem.difficulty}</span><span><Clock3 size={13}/>{problem.minutes} min</span><span>{problem.language}</span></div><h2 id="arena-problem-title">{problem.title}</h2></div><span className={`arena-status ${saved?.solved ? 'solved' : saved?.attempts?.length ? 'attempted' : ''}`}>{saved?.solved ? 'Solved' : saved?.attempts?.length ? 'Attempted' : 'Not attempted'}</span></div>
      <div className="arena-split">
        <div className="arena-description">
          <section><h3>Problem</h3><p>{problem.description}</p><h4>Constraints</h4><ul>{problem.constraints.map((item) => <li key={item}>{item}</li>)}</ul><h4>Examples</h4>{problem.examples.map((example, index) => <article className="arena-example" key={`${example.input}-${index}`}><b>Example {index + 1}</b><p><span>Input</span><code>{example.input}</code></p><p><span>Output</span><code>{example.output || '(empty line)'}</code></p><small>{example.explanation}</small></article>)}</section>
          <section className="arena-hints"><h3>Hints</h3>{problem.hints.slice(0, hintCount).map((hint, index) => <p key={hint}><b>Hint {index + 1}:</b> {hint}</p>)}{hintCount < problem.hints.length && <button onClick={() => setHintCount((count) => count + 1)}><CircleHelp size={14}/> Reveal hint {hintCount + 1} of {problem.hints.length}</button>}</section>
          <section className="arena-approach"><button className="arena-approach-toggle" aria-expanded={showApproach} onClick={() => setShowApproach((shown) => !shown)}><span>Expected approach and complexity</span><ChevronDown size={15}/></button>{showApproach && <div><p>{problem.approach}</p><b>{problem.complexity}</b></div>}</section>
        </div>
        <div className="arena-editor-panel">
          <label htmlFor="arena-java-editor">{problem.language} solution</label><textarea id="arena-java-editor" className="arena-editor" maxLength={12000} spellCheck="false" value={code} onChange={(event) => saveDraft(event.target.value)} aria-describedby="arena-storage-note" />
          <div className="arena-editor-meta"><span id="arena-storage-note">Draft and progress are saved in this browser.</span><span>{code.length}/12,000</span></div>
          {compilerState === 'checking' && <p className="arena-state" role="status">Checking Java runner…</p>}
          {compilerState === 'signin' && <div className="arena-run-notice"><p>Sign in to run code. Java execution uses the existing backend JDoodle integration.</p><button onClick={onLogin}>Sign in</button></div>}
          {compilerState === 'unavailable' && <p className="arena-run-notice" role="status">JDoodle is not configured for this backend. Draft editing still works. Add the server-side credentials as described in the README.</p>}
          {compilerState === 'error' && <p className="arena-run-notice" role="alert">Could not check Java runner status: {statusError}</p>}
          {problem.executable && compilerState === 'ready' && <div className="arena-actions"><button className="secondary-button" onClick={runSamples} disabled={busy}><Play size={14}/>{busy ? 'Running…' : 'Run sample tests'}</button><button className="primary-button" onClick={submitSolution} disabled={busy}><Send size={14}/>{busy ? 'Submitting…' : 'Submit solution'}</button></div>}
          {!problem.executable && <p className="arena-run-notice">This original starter is preserved from the previous hub. Its custom runner format is not yet available.</p>}
          {error && <p className="arena-error" role="alert">{error}</p>}
          {activity && <div className={`arena-result ${activity.accepted ? 'accepted' : ''}`} role="status" aria-live="polite"><b>{activity.kind === 'hidden' ? (activity.accepted ? 'Accepted' : 'Not accepted yet') : `${activity.passed}/${activity.total} sample tests passed`}</b><p>{activity.kind === 'hidden' ? (activity.accepted ? 'All server-side tests passed. This marks the problem solved in this browser.' : 'The hidden tests did not all pass. Review your code and try again.') : 'Sample results do not mark a problem solved. Submit to run the server-side tests.'}</p>{activity.tests?.map((test) => <div className="arena-sample-outcome" key={test.index}><b>Example {test.index}: {test.passed ? 'Passed' : 'Did not match'}</b><small>Expected: {test.expected || '(empty output)'}</small><small>Received: {test.actual || '(empty output)'}</small></div>)}</div>}
          {history.length > 0 && <details className="arena-history"><summary>Attempt history ({history.length})</summary><ol>{history.map((item) => <li key={item.id}><b>{item.kind === 'hidden' ? 'Submission' : 'Sample run'}</b><span>{new Date(item.at).toLocaleString()}</span><small>{item.error ? 'Execution unavailable' : `${item.passed}/${item.total} passed${item.accepted ? ' · Accepted' : ''}`}</small></li>)}</ol></details>}
          <p className="arena-privacy"><ShieldAlert size={14}/> Source code is sent to JDoodle through SkillProof’s backend when you run or submit. Do not include credentials or private code. Each run and each hidden case uses provider quota.</p>
          <div className="arena-nav-problems"><button onClick={previousProblem}><ArrowLeft size={14}/> Previous</button><button onClick={nextProblem}>Next problem <ArrowRight size={14}/></button></div>
        </div>
      </div>
    </section>
  }

  return <section className="arena-shell" aria-labelledby="arena-title">
    <header className="arena-heading"><div><div className="section-kicker"><Code2 size={13}/> JAVA PRACTICE</div><h2 id="arena-title">Coding Arena<span>.</span></h2><p>Original Java problems, progressive hints, sample runs, and server-side submissions.</p></div><div className="arena-goal"><Trophy size={18}/><span><b>Daily goal</b><small>{attemptsToday ? '1 / 1 problem attempted today' : '0 / 1 · Attempt one problem today'}</small></span></div></header>
    <div className="arena-progress-summary"><article><b>{attempted}</b><span>Attempted</span></article><article><b>{solved}</b><span>Solved</span></article><article><b>{progress.history.length}</b><span>Total runs</span></article><p>Progress stays in this browser. It is not a verified credential.</p></div>
    <section className="arena-topic-progress" aria-label="Practice by topic">{topicProgress.map((item) => <button type="button" key={item.topic} aria-pressed={topic === item.topic} className={topic === item.topic ? 'active' : ''} onClick={() => { setTopic(item.topic); setProblemId(null) }}>{item.topic}<b>{item.done}/{item.total}</b></button>)}</section>
    <div className="arena-filters"><label className="arena-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems" aria-label="Search problems"/></label><label>Topic<select value={topic} onChange={(event) => setTopic(event.target.value)}>{arenaTopics.map((item) => <option key={item}>{item}</option>)}</select></label><label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{arenaDifficulties.map((item) => <option key={item}>{item}</option>)}</select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label><span><ListFilter size={14}/>{filteredProblems.length} problems</span></div>
    {filteredProblems.length ? <div className="arena-problem-list">{filteredProblems.map((item) => {
      const state = progress.problems[item.id]
      return <button className="arena-problem-card" key={item.id} onClick={() => begin(item)}><span className={`arena-problem-mark ${state?.solved ? 'is-solved' : state?.attempts?.length ? 'is-attempted' : ''}`}>{state?.solved ? <Check size={15}/> : <Code2 size={15}/>}</span><span className="arena-problem-info"><b>{item.title}</b><small>{item.topic}{item.legacy ? ' · Existing prompt' : ''}</small></span><span className={`arena-difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span><span className="arena-time"><Clock3 size={13}/>{item.minutes} min</span><span className="arena-problem-status">{state?.solved ? 'Solved' : state?.attempts?.length ? 'Attempted' : 'Not attempted'}</span><ArrowRight className="arena-open" size={16}/></button>
    })}</div> : <div className="proving-empty"><Search size={22}/><b>No problems found</b><span>Try another search or change the filters.</span><button onClick={() => { setSearch(''); setTopic('All topics'); setDifficulty('All difficulties'); setStatus('All status') }}>Clear filters</button></div>}
    {progress.history.length > 0 && <section className="arena-recent" aria-labelledby="arena-recent-title"><h3 id="arena-recent-title">Recent attempts</h3><ol>{[...progress.history].reverse().slice(0, 8).map((item) => { const itemProblem = allProblems.find((entry) => entry.id === item.problemId); return <li key={item.id}><button onClick={() => itemProblem && begin(itemProblem)}><b>{itemProblem?.title || 'Coding problem'}</b><span>{item.kind === 'hidden' ? 'Submission' : 'Sample run'} · {item.error ? 'Execution unavailable' : `${item.passed}/${item.total} passed${item.accepted ? ' · Accepted' : ''}`}</span><small>{new Date(item.at).toLocaleString()}</small></button></li> })}</ol></section>}
    <p className="arena-footnote">Java 21 sample and hidden runs use the existing JDoodle backend integration. Hidden cases stay on the server. Completion and attempt history are browser-local.</p>
  </section>
}
