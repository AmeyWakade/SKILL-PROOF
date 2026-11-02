import { useEffect, useRef, useState } from 'react'
import { Code2, Play, RotateCcw, ShieldAlert, SquareTerminal } from 'lucide-react'
import { api } from './api'

const languages = [
  { id: 'java', name: 'Java 21', file: 'Main.java', example: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, SkillProof!");\n    }\n}' },
  { id: 'python', name: 'Python 3', file: 'main.py', example: 'name = input() or "SkillProof"\nprint(f"Hello, {name}!")' },
  { id: 'javascript', name: 'JavaScript (Node.js)', file: 'index.js', example: 'const name = "SkillProof";\nconsole.log(`Hello, ${name}!`);' },
  { id: 'cpp', name: 'C++ 17', file: 'main.cpp', example: '#include <iostream>\nint main() {\n    std::cout << "Hello, SkillProof!\\n";\n    return 0;\n}' },
  { id: 'c', name: 'C', file: 'main.c', example: '#include <stdio.h>\nint main(void) {\n    printf("Hello, SkillProof!\\n");\n    return 0;\n}' },
]

export default function CodePlayground() {
  const isRender = window.location.hostname.endsWith('.onrender.com')
  const [language, setLanguage] = useState(languages[0])
  const [drafts, setDrafts] = useState(() => Object.fromEntries(languages.map((item) => [item.id, item.example])))
  const source = drafts[language.id] || language.example
  const [stdin, setStdin] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [checking, setChecking] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [setupError, setSetupError] = useState('')
  const [bottomPanel, setBottomPanel] = useState('output')
  const editorRef = useRef(null)
  const gutterRef = useRef(null)
  const lineCount = Math.max(1, source.split('\n').length)

  async function checkSetup() {
    setChecking(true); setSetupError('')
    try { const status = await api('/api/v1/compiler/status'); setEnabled(status.enabled) }
    catch (exception) { setEnabled(false); setSetupError(exception.message) }
    finally { setChecking(false) }
  }
  useEffect(() => { checkSetup() }, [])
  function changeLanguage(event) {
    const next = languages.find((item) => item.id === event.target.value)
    setLanguage(next); setResult(null); setError('')
  }
  async function runCode() {
    setRunning(true); setError(''); setResult(null); setBottomPanel('output')
    try { setResult(await api('/api/v1/compiler/run', { method: 'POST', body: JSON.stringify({ language: language.id, source, stdin }) })) }
    catch (exception) { setError(exception.message) }
    finally { setRunning(false) }
  }
  function resetCode() {
    setDrafts((current) => ({ ...current, [language.id]: language.example }))
    setResult(null); setError('')
  }
  function handleEditorKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      if (enabled && !running) runCode()
    }
  }

  return <section className="catalog playground-view" aria-labelledby="playground-title">
    <header className="ide-page-heading"><div><div className="section-kicker">CODE PLAYGROUND</div><h2 id="playground-title">Your coding workspace<span>.</span></h2><p>Write, provide input, and run code in a familiar editor layout.</p></div><span className="playground-provider"><Code2 size={16}/> JDoodle runtime</span></header>
    {!checking && !enabled && <div className="playground-setup" role="status"><b>One-time setup needed</b>{isRender
      ? <span>In Render, open your <b>SKILL-PROOF</b> web service → <b>Environment</b>. Add <code>JDOODLE_CLIENT_ID</code> and <code>JDOODLE_CLIENT_SECRET</code> using the values from your JDoodle account, then save and redeploy. Keep the secret in Render; never add it to the frontend or GitHub.</span>
      : <span>Set <code>JDOODLE_CLIENT_ID</code> and <code>JDOODLE_CLIENT_SECRET</code> in the same PowerShell window that starts the backend, then restart the API. The setup steps are in the project README.</span>}{setupError && <small>{setupError}</small>}<button className="playground-check" onClick={checkSetup}>I added the keys and restarted — check again</button></div>}
    <div className="ide-workbench">
      <div className="ide-window-bar"><div className="ide-window-dots" aria-hidden="true"><i/><i/><i/></div><span>SkillProof · Code Playground</span><span className={`ide-runtime-status ${enabled ? 'ready' : ''}`}><i/>{checking ? 'Checking runtime' : enabled ? 'Runtime ready' : 'Runtime setup needed'}</span></div>
      <div className="ide-layout">
        <aside className="ide-explorer" aria-label="Project files and runtime">
          <div className="ide-explorer-title">EXPLORER</div><div className="ide-project-name"><Code2 size={14}/> SKILLPROOF</div>
          <button type="button" className="ide-file-row active" aria-current="page"><span className="ide-file-icon">{language.id === 'java' ? 'J' : language.id === 'cpp' ? 'C+' : language.id === 'c' ? 'C' : language.id === 'python' ? 'Py' : 'JS'}</span>{language.file}</button>
          <div className="ide-runtime-card"><small>LANGUAGE RUNTIME</small><b>{language.name}</b><span>{enabled ? 'Connected to JDoodle' : 'Execution service unavailable'}</span></div>
          <div className="ide-explorer-hint"><ShieldAlert size={14}/><span>Code is sent to JDoodle. Never paste secrets or private information.</span></div>
        </aside>
        <div className="ide-editor-column">
          <div className="ide-editor-tab"><span className="ide-file-icon">{language.id === 'java' ? 'J' : language.id === 'cpp' ? 'C+' : language.id === 'c' ? 'C' : language.id === 'python' ? 'Py' : 'JS'}</span>{language.file}<span className="ide-tab-unsaved" aria-label="Draft editor">●</span></div>
          <div className="ide-toolbar"><label>Run with<select aria-label="Programming language" value={language.id} onChange={changeLanguage}>{languages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div><button className="playground-reset" onClick={resetCode}><RotateCcw size={14}/> Reset</button><button className="primary-button" disabled={running || !enabled} title="Shortcut: Ctrl or Command + Enter" onClick={runCode}><Play size={14}/>{running ? 'Running…' : 'Run code'}<kbd>Ctrl ↵</kbd></button></div></div>
          <div className="ide-editor-heading"><span>SOURCE CODE</span><span>{lineCount} lines · UTF-8</span></div>
          <div className="ide-code-canvas"><div className="ide-line-gutter" ref={gutterRef} aria-hidden="true">{Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}</div><textarea ref={editorRef} className="code-editor" spellCheck="false" wrap="off" value={source} onChange={(event) => setDrafts((current) => ({ ...current, [language.id]: event.target.value }))} onKeyDown={handleEditorKeyDown} onScroll={(event) => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop }} maxLength={12000} aria-label={`Code editor: ${language.file}`} /></div>
          <section className="ide-bottom-panel" aria-label="Program input and output"><div className="ide-panel-tabs" role="tablist" aria-label="Terminal panels"><button type="button" role="tab" aria-selected={bottomPanel === 'input'} className={bottomPanel === 'input' ? 'active' : ''} onClick={() => setBottomPanel('input')}>STANDARD INPUT</button><button type="button" role="tab" aria-selected={bottomPanel === 'output'} className={bottomPanel === 'output' ? 'active' : ''} onClick={() => setBottomPanel('output')}><SquareTerminal size={13}/> OUTPUT</button><span className="ide-panel-status">{running ? 'Running…' : result ? 'Finished' : 'Ready'}</span></div>
            {bottomPanel === 'input' ? <label className="ide-stdin-label">Text passed to your program<textarea className="stdin-editor" value={stdin} onChange={(event) => setStdin(event.target.value)} maxLength={2000} placeholder="Type input for your program…"/></label> : <div className="ide-output-content" role="tabpanel" aria-label="Program output" aria-live="polite">{error ? <p className="form-error">{error}</p> : result ? <><pre>{result.output || '(No output)'}</pre><small>CPU {result.cpuTime || '—'}s · Memory {result.memory || '—'} KB</small></> : <p>{running ? 'Your program is running…' : 'Run your code to see the program output here.'}</p>}</div>}
          </section>
          <div className="ide-statusbar"><span><i/> SkillProof Playground</span><span>{language.name}</span><span>Spaces: 4</span><span>UTF-8</span></div>
        </div>
      </div>
    </div>
  </section>
}
