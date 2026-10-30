import { useEffect, useRef, useState } from 'react'
import { Bot, Send, X, Sparkles, UserRound, RotateCcw } from 'lucide-react'
import { api } from './api'

export default function Chatbot({ user, onLogin }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [messages, setMessages] = useState([{ role: 'model', content: 'Hi! I’m your SkillProof Career Coach. Ask about a career path, a study plan, interview practice, or a project you’re building.' }])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    if (!open || !user || status) return
    api('/api/v1/ai/status').then(setStatus).catch((e) => setStatusError(e.message))
  }, [open, user, status])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, open])

  async function sendMessage(text = draft) {
    const content = text.trim()
    if (!content || busy || !status?.enabled) return
    const conversation = [...messages, { role: 'user', content }]
    setMessages(conversation); setDraft(''); setBusy(true); setError('')
    try {
      const history = conversation.slice(1).slice(-12).map(({ role, content: message }) => ({ role, content: message }))
      while (history.length && history[0].role === 'model') history.shift()
      const result = await api('/api/v1/ai/chat', { method: 'POST', body: JSON.stringify({ messages: history }) })
      setMessages((current) => [...current, { role: 'model', content: result.reply }])
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  function resetChat() { setMessages([{ role: 'model', content: 'Hi! I’m your SkillProof Career Coach. Ask about a career path, a study plan, interview practice, or a project you’re building.' }]); setError('') }

  return <div className="chat-assistant">
    {open && <section className="chat-panel" aria-label="SkillProof AI career coach">
      <header className="chat-header"><span className="chat-icon"><Bot size={18}/></span><div><b>Career Coach</b><small>{status?.enabled ? `Powered by ${status.provider}` : 'SkillProof AI assistant'}</small></div><button onClick={resetChat} aria-label="Clear conversation"><RotateCcw size={15}/></button><button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18}/></button></header>
      {!user ? <div className="chat-login"><Bot size={28}/><b>Your career coach is ready</b><p>Sign in to get guidance for your learning and portfolio.</p><button onClick={onLogin}>Sign in to chat</button></div> : <>
        <div className="chat-privacy">Messages are sent to Google Gemini to generate replies. Don’t include passwords or private information.</div>
        <div className="chat-messages" aria-live="polite">{messages.map((message, index) => <article className={`chat-message ${message.role === 'user' ? 'from-user' : 'from-ai'}`} key={`${index}-${message.role}`}><span>{message.role === 'user' ? <UserRound size={14}/> : <Sparkles size={14}/>}</span><p>{message.content}</p></article>)}{busy && <article className="chat-message from-ai"><span><Sparkles size={14}/></span><p className="typing">Thinking…</p></article>}<div ref={endRef}/></div>
        {!status && <div className="chat-config-message">{statusError || 'Checking AI setup…'}</div>}
        {status && !status.enabled && <div className="chat-config-message"><b>AI key needed to start chatting.</b><br/>Set <code>GEMINI_API_KEY</code> in the backend environment, then restart the API. Your key stays on the server.</div>}
        {status?.enabled && messages.length === 1 && <div className="chat-suggestions">{['Help me choose a career path', 'Make me a study plan', 'How can I improve my portfolio?'].map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>)}</div>}
        {error && <p className="chat-error" role="alert">{error}</p>}
        <form className="chat-compose" onSubmit={(event) => { event.preventDefault(); sendMessage() }}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={status?.enabled ? 'Ask your career coach…' : 'AI setup required'} maxLength={1500} rows={2} disabled={!status?.enabled || busy} aria-label="Message the career coach"/><button aria-label="Send message" disabled={!draft.trim() || !status?.enabled || busy}><Send size={17}/></button></form>
      </>}
    </section>}
    <button className={`chat-launch ${open ? 'chat-launch-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close career coach' : 'Open AI career coach'} aria-expanded={open}>{open ? <X size={20}/> : <><Bot size={20}/><span>AI Career Coach</span></>}</button>
  </div>
}
