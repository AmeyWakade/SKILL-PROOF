import { useEffect, useState } from 'react'
import { Code2, Play, RotateCcw, ShieldAlert } from 'lucide-react'
import { api } from './api'

const languages = [
  { id: 'java', name: 'Java 21', example: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, SkillProof!");\n    }\n}' },
  { id: 'python', name: 'Python 3', example: 'name = input() or "SkillProof"\nprint(f"Hello, {name}!")' },
  { id: 'javascript', name: 'JavaScript (Node.js)', example: 'const name = process.stdin.read() || "SkillProof";\nconsole.log(`Hello, ${name.trim()}!`);' },
  { id: 'cpp', name: 'C++ 17', example: '#include <iostream>\nint main() {\n    std::cout << "Hello, SkillProof!\\n";\n    return 0;\n}' },
  { id: 'c', name: 'C', example: '#include <stdio.h>\nint main(void) {\n    printf("Hello, SkillProof!\\n");\n    return 0;\n}' },
]

export default function CodePlayground() {
  const isRender = window.location.hostname.endsWith('.onrender.com')
  const [language, setLanguage] = useState(languages[0])
  const [source, setSource] = useState(languages[0].example)
  const [stdin, setStdin] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [checking, setChecking] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [setupError, setSetupError] = useState('')

  async function checkSetup() {
    setChecking(true); setSetupError('')
    try { const status = await api('/api/v1/compiler/status'); setEnabled(status.enabled) }
    catch (exception) { setEnabled(false); setSetupError(exception.message) }
    finally { setChecking(false) }
  }
  useEffect(() => { checkSetup() }, [])
  function changeLanguage(event) {
    const next = languages.find((item) => item.id === event.target.value)
    setLanguage(next); setSource(next.example); setResult(null); setError('')
  }
  async function runCode() {
    setRunning(true); setError(''); setResult(null)
    try { setResult(await api('/api/v1/compiler/run', { method: 'POST', body: JSON.stringify({ language: language.id, source, stdin }) })) }
    catch (exception) { setError(exception.message) }
    finally { setRunning(false) }
  }

  return <section className="catalog playground-view">
    <div className="section-head"><div><div className="section-kicker">CODE PLAYGROUND</div><h2>Try code across languages<span>.</span></h2><p>Run a small sample to explore syntax and language behavior.</p></div><span className="playground-provider"><Code2 size={16}/> JDoodle</span></div>
    {!checking && !enabled && <div className="playground-setup"><b>One-time setup needed</b>{isRender
      ? <span>In Render, open your <b>SKILL-PROOF</b> web service → <b>Environment</b>. Add <code>JDOODLE_CLIENT_ID</code> and <code>JDOODLE_CLIENT_SECRET</code> using the values from your JDoodle account, then save and redeploy. Keep the secret in Render; never add it to the frontend or GitHub.</span>
      : <span>Set <code>JDOODLE_CLIENT_ID</code> and <code>JDOODLE_CLIENT_SECRET</code> in the same PowerShell window that starts the backend, then restart the API. The setup steps are in the project README.</span>}{setupError && <small>{setupError}</small>}<button className="playground-check" onClick={checkSetup}>I added the keys and restarted — check again</button></div>}
    <div className="playground-toolbar"><label>Language<select value={language.id} onChange={changeLanguage}>{languages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div><button className="playground-reset" onClick={() => { setSource(language.example); setResult(null); setError('') }}><RotateCcw size={14}/> Reset</button><button className="primary-button" disabled={running || !enabled} onClick={runCode}><Play size={14}/>{running ? 'Running…' : 'Run code'}</button></div></div>
    <label className="code-label">Your code<textarea className="code-editor" spellCheck="false" value={source} onChange={(event) => setSource(event.target.value)} maxLength={12000} /></label>
    <label className="code-label stdin-label">Standard input <small>Optional text passed to your program</small><textarea className="stdin-editor" value={stdin} onChange={(event) => setStdin(event.target.value)} maxLength={2000} placeholder="Type input for your program…" /></label>
    <section className="code-output"><h3>Output</h3>{error ? <p className="form-error">{error}</p> : result ? <><pre>{result.output || '(No output)'}</pre><small>CPU {result.cpuTime || '—'}s · Memory {result.memory || '—'} KB</small></> : <p>Run your code to see the result here.</p>}</section>
    <p className="compiler-privacy"><ShieldAlert size={14}/> Code is sent to JDoodle to execute. Do not paste passwords, API keys, or other private data. Free API access has a daily run limit.</p>
  </section>
}
