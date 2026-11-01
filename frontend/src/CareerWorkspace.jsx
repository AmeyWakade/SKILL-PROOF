import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Eye, ExternalLink, Plus, Save, ShieldCheck, Target, Trash2 } from 'lucide-react'
import { api } from './api'
import PublicProfileView from './PublicProfileView'
import ThemePicker from './ThemePicker'

const emptyProject = () => ({ title: '', description: '', skills: '', projectUrl: '', githubUrl: '', demoUrl: '', status: 'PLANNED', publicVisible: false })
const statusLabels = { PLANNED: 'Planned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }

function profileForm(profile) {
  return { ...profile, skills: (profile.skills || []).join(', ') }
}

export default function CareerWorkspace({ onBack, onContinueLearning = () => {}, user, onUpdated, theme, onChangeTheme }) {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [editForm, setEditForm] = useState(null)
  const [projectDraft, setProjectDraft] = useState(emptyProject())
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [mode, setMode] = useState('loading')
  const [loadingError, setLoadingError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [projectError, setProjectError] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')

  async function loadWorkspace() {
    setMode('loading')
    setLoadingError('')
    try {
      const [savedProfile, savedProjects] = await Promise.all([api('/api/v1/profile'), api('/api/v1/portfolio-projects')])
      setProfile(savedProfile)
      setEditForm(profileForm(savedProfile))
      setProjects(savedProjects)
      const hasWorkspace = Boolean(savedProfile.targetRole || savedProfile.headline || savedProfile.bio || savedProfile.skills?.length || savedProjects.length)
      setMode(hasWorkspace ? 'workspace' : 'details')
    } catch (error) {
      setLoadingError(error.message)
      setMode('error')
    }
  }

  useEffect(() => { loadWorkspace() }, [])

  const skillList = useMemo(() => (profile?.skills || []).filter(Boolean), [profile])
  const incompleteProject = projects.find((project) => project.status !== 'COMPLETED')
  const recommendedAction = !profile?.targetRole
    ? { label: 'Set your career goal', action: () => setMode('details') }
    : skillList.length === 0
      ? { label: 'Choose skills to focus on', action: () => setMode('details') }
    : projects.length === 0
      ? { label: 'Add a project from your experience', action: () => beginProject() }
      : incompleteProject
        ? { label: `Update “${incompleteProject.title}”`, action: () => editProject(incompleteProject) }
          : { label: 'Practice your selected skills', action: onContinueLearning }

  async function saveProfile(continueLater = false) {
    setBusy(true)
    setProfileError('')
    const payload = {
      ...editForm,
      skills: (editForm.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
    }
    try {
      const saved = await api('/api/v1/profile', { method: 'PUT', body: JSON.stringify(payload) })
      setProfile(saved)
      setEditForm(profileForm(saved))
      onUpdated(saved)
      if (continueLater) onBack()
      else setMode('workspace')
    } catch (error) { setProfileError(error.message) } finally { setBusy(false) }
  }

  function beginProject() {
    setProjectDraft(emptyProject())
    setEditingProjectId(null)
    setProjectError('')
    setMode('project')
  }

  function editProject(project) {
    setProjectDraft({
      title: project.title || '', description: project.description || '', skills: project.skills || '',
      projectUrl: project.projectUrl || '', githubUrl: project.githubUrl || '', demoUrl: project.demoUrl || '',
      status: project.status || 'PLANNED', publicVisible: Boolean(project.publicVisible),
    })
    setEditingProjectId(project.id)
    setProjectError('')
    setMode('project')
  }

  async function saveProject(event) {
    event.preventDefault()
    setBusy(true)
    setProjectError('')
    const payload = {
      ...projectDraft,
      skills: projectDraft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    }
    try {
      const saved = await api(editingProjectId ? `/api/v1/portfolio-projects/${editingProjectId}` : '/api/v1/portfolio-projects', {
        method: editingProjectId ? 'PUT' : 'POST', body: JSON.stringify(payload),
      })
      setProjects((current) => editingProjectId ? current.map((project) => project.id === saved.id ? saved : project) : [saved, ...current])
      setMode('workspace')
    } catch (error) { setProjectError(error.message) } finally { setBusy(false) }
  }

  async function removeProject(project) {
    setProjectError('')
    try {
      await api(`/api/v1/portfolio-projects/${project.id}`, { method: 'DELETE' })
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch (error) { setProjectError(error.message) }
  }

  async function openPreview() {
    setPreview({ status: 'loading' })
    setPreviewError('')
    try { setPreview({ status: 'ready', profile: await api('/api/v1/profile/preview') }) }
    catch (error) { setPreview(null); setPreviewError(error.message) }
  }

  if (mode === 'loading') return <section className="career-shell" aria-busy="true"><p role="status">Loading your Career Workspace…</p></section>
  if (mode === 'error') return <section className="career-shell"><button className="account-back" onClick={onBack}><ArrowLeft size={16}/> Back</button><div className="career-state" role="alert"><b>We couldn’t load your saved career details.</b><p>{loadingError}</p><button className="primary-button" onClick={loadWorkspace}>Try again</button></div></section>

  return <section className="career-shell">
    <ThemePicker className="career-theme" theme={theme} onChange={onChangeTheme}/>
    <button className="account-back" onClick={onBack}><ArrowLeft size={16}/> Back to explore</button>
    <header className="career-heading"><div><span className="section-kicker">YOUR CAREER PLAN</span><h1>Career Workspace</h1><p>Organize your goal, chosen skills, and project work. Your details stay private until you choose what to share.</p></div><div className="career-avatar"><BriefcaseBusiness size={20}/></div></header>

    {mode === 'details' && <section className="career-card" aria-labelledby="career-details-title">
      <span className="section-kicker">START WITH YOUR DIRECTION</span><h2 id="career-details-title">Your career details</h2><p>Use your own words. Skills you select and projects you add are self-reported, not verified credentials.</p>
      <form className="career-form" onSubmit={(event) => { event.preventDefault(); saveProfile(false) }}>
        <label>Display name<input required maxLength="80" value={editForm.displayName || ''} onChange={(event) => setEditForm({ ...editForm, displayName: event.target.value })}/></label>
        <label>Career goal or target role<input maxLength="100" value={editForm.targetRole || ''} onChange={(event) => setEditForm({ ...editForm, targetRole: event.target.value })} placeholder="e.g. Junior Java developer"/></label>
        <label>Professional headline<input maxLength="120" value={editForm.headline || ''} onChange={(event) => setEditForm({ ...editForm, headline: event.target.value })} placeholder="A short introduction"/></label>
        <label>Location<input maxLength="100" value={editForm.location || ''} onChange={(event) => setEditForm({ ...editForm, location: event.target.value })} placeholder="City, country or remote"/></label>
        <label className="career-wide">About you<textarea rows="4" maxLength="1200" value={editForm.bio || ''} onChange={(event) => setEditForm({ ...editForm, bio: event.target.value })} placeholder="What are you learning or working toward?"/></label>
        <label className="career-wide">Skills you want to highlight <small>Separate your own skill descriptions with commas</small><input value={editForm.skills || ''} onChange={(event) => setEditForm({ ...editForm, skills: event.target.value })} placeholder="Java, React, SQL"/></label>
        <fieldset className="career-privacy career-wide"><legend>Public profile choices</legend>
          <label className="career-check"><input type="checkbox" checked={Boolean(editForm.publicProfileEnabled)} onChange={(event) => setEditForm({ ...editForm, publicProfileEnabled: event.target.checked })}/><span><b>Enable my public profile</b><small>Off by default. Only you can see the preview until you enable this.</small></span></label>
          <label className="career-check"><input type="checkbox" checked={Boolean(editForm.publicCareerDetailsEnabled)} onChange={(event) => setEditForm({ ...editForm, publicCareerDetailsEnabled: event.target.checked })}/><span><b>Share my career details</b><small>Headline, target role, location, and introduction.</small></span></label>
          <label className="career-check"><input type="checkbox" checked={Boolean(editForm.publicSkillsEnabled)} onChange={(event) => setEditForm({ ...editForm, publicSkillsEnabled: event.target.checked })}/><span><b>Share my selected skills</b><small>These remain self-reported; they are not verified by SkillProof.</small></span></label>
        </fieldset>
        {profileError && <p className="form-error career-wide" role="alert">{profileError}</p>}
        <div className="career-form-actions career-wide"><button className="primary-button" disabled={busy}><Save size={15}/>{busy ? 'Saving…' : 'Save and view workspace'}</button><button type="button" className="secondary-button" disabled={busy} onClick={() => saveProfile(true)}>Save and continue later</button></div>
      </form>
    </section>}

    {mode === 'workspace' && <>
      <section className="career-summary-grid">
        <article className="career-card career-goal-card"><span className="career-card-icon"><Target size={18}/></span><div><small>CAREER GOAL</small><h2>{profile.targetRole || 'Choose a career goal'}</h2><p>{profile.headline || 'Add details that explain what you are working toward.'}</p></div><button className="text-action" onClick={() => setMode('details')}>Edit details</button></article>
        <article className="career-card"><small>YOUR CHOSEN SKILLS</small><h2>{skillList.length ? `${skillList.length} selected` : 'No skills added yet'}</h2>{skillList.length ? <div className="tags">{skillList.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>Add skills you want to focus on; selecting them does not verify them.</p>}</article>
      </section>

      <section className="career-card roadmap-card"><div className="career-section-head"><div><span className="section-kicker">A SIMPLE ROADMAP</span><h2>Small steps toward your goal</h2></div><ShieldCheck size={20}/></div><ol className="roadmap-list">
        <li><span className={profile.targetRole ? 'roadmap-done' : ''}>{profile.targetRole ? <Check size={14}/> : '1'}</span><div><b>Choose a direction</b><small>{profile.targetRole ? `Your current goal is ${profile.targetRole}.` : 'Add the role or career direction you are exploring.'}</small></div></li>
        <li><span className={skillList.length ? 'roadmap-done' : ''}>{skillList.length ? <Check size={14}/> : '2'}</span><div><b>Pick skills to focus on</b><small>{skillList.length ? `You selected ${skillList.slice(0, 3).join(', ')}${skillList.length > 3 ? ' and more' : ''}.` : 'Add skills you want to develop or demonstrate.'}</small></div></li>
        <li><span className={projects.length ? 'roadmap-done' : ''}>{projects.length ? <Check size={14}/> : '3'}</span><div><b>Describe your project work</b><small>{projects.length ? `${projects.length} project${projects.length === 1 ? '' : 's'} saved. Status describes progress you entered; it is not verification.` : 'Add a project idea or work you have already done. You decide its status.'}</small></div></li>
      </ol><p className="career-honesty-note">This roadmap organizes your own plan. It does not certify your skills or project work.</p></section>

      <section className="career-card projects-card"><div className="career-section-head"><div><span className="section-kicker">YOUR WORK</span><h2>Projects</h2><p>Keep ideas, work in progress, and completed projects together.</p></div><button className="primary-button" onClick={beginProject}><Plus size={15}/> Add project</button></div>
        {projectError && <p className="form-error" role="alert">{projectError}</p>}
        {projects.length ? <div className="career-project-list">{projects.map((project) => <article className="career-project" key={project.id}><div className="career-project-content"><div className="career-project-title"><h3>{project.title}</h3><span className={`project-status status-${project.status?.toLowerCase() || 'planned'}`}>{statusLabels[project.status] || 'Planned'}</span></div><p>{project.description}</p>{project.skills && <div className="tags">{project.skills.split(',').map((skill) => <span key={skill}>{skill.trim()}</span>)}</div>}<small className="project-sharing">{project.publicVisible ? 'Selected for public profile' : 'Private project'}</small></div><div className="career-project-actions"><button className="secondary-button" onClick={() => editProject(project)}>Edit</button><button className="icon-button" aria-label={`Remove ${project.title}`} onClick={() => removeProject(project)}><Trash2 size={16}/></button></div></article>)}</div> : <div className="career-empty"><BriefcaseBusiness size={22}/><b>No projects yet</b><span>Add an idea or something you have worked on. We won’t create project content for you.</span><button className="secondary-button" onClick={beginProject}>Add your first project</button></div>}
      </section>

      <section className="career-next-action" aria-labelledby="career-next-title"><div><span className="career-card-icon"><ArrowRight size={17}/></span><div><small>RECOMMENDED NEXT ACTION</small><h2 id="career-next-title">{recommendedAction.label}</h2><p>{!profile.targetRole ? 'A goal gives your workspace a focus.' : skillList.length === 0 ? 'Choose the skills you want your next practice session to focus on.' : projects.length === 0 ? 'Start with real work you have done or a project idea you plan to build.' : incompleteProject ? 'Update the project status when your progress changes.' : 'Take this career plan into Proving Ground and practice the skills you selected.'}</p></div></div><button className="primary-button" aria-label={`Continue: ${recommendedAction.label}`} onClick={recommendedAction.action}>{recommendedAction.label.startsWith('Preview') ? <Eye size={15}/> : <ArrowRight size={15}/>} Continue</button></section>

      <section className="career-sharing"><div><b>Public profile</b><small>{profile.publicProfileEnabled ? 'Enabled. Only the details and projects you selected are shown.' : 'Private. Your preview is visible only to you.'}</small></div><button className="secondary-button" onClick={() => setMode('details')}>Edit sharing choices</button></section>
      <div className="career-footer-actions"><button className="secondary-button" onClick={() => setMode('details')}>Edit details</button><button className="secondary-button" onClick={openPreview}><Eye size={15}/> Preview profile</button><button className="text-action" onClick={onBack}>Continue later <ArrowRight size={15}/></button></div>
      {previewError && <p className="form-error" role="alert">Could not load your profile preview: {previewError}</p>}
    </>}

    {mode === 'project' && <section className="career-card" aria-labelledby="project-form-title"><button className="account-back" onClick={() => setMode('workspace')}><ArrowLeft size={15}/> Back to workspace</button><span className="section-kicker">SHOW WHAT YOU HAVE BUILT</span><h2 id="project-form-title">{editingProjectId ? 'Edit project' : 'Add a project'}</h2><p>Enter only details that describe your own work. Status and selected skills are self-reported.</p><form className="career-form" onSubmit={saveProject}>
      <label>Project title<input required maxLength="100" value={projectDraft.title} onChange={(event) => setProjectDraft({ ...projectDraft, title: event.target.value })} placeholder="Project name"/></label>
      <label>Status<select value={projectDraft.status} onChange={(event) => setProjectDraft({ ...projectDraft, status: event.target.value })}><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></label>
      <label className="career-wide">Short description<textarea required maxLength="1000" rows="4" value={projectDraft.description} onChange={(event) => setProjectDraft({ ...projectDraft, description: event.target.value })} placeholder="What did you build or plan to build?"/></label>
      <label className="career-wide">Skills demonstrated<input maxLength="300" value={projectDraft.skills} onChange={(event) => setProjectDraft({ ...projectDraft, skills: event.target.value })} placeholder="Only skills you used or intend to use"/><small>Separate skills with commas. These are not verified.</small></label>
      <label>GitHub link <small>Optional</small><input type="url" maxLength="500" value={projectDraft.githubUrl} onChange={(event) => setProjectDraft({ ...projectDraft, githubUrl: event.target.value })} placeholder="https://github.com/you/project"/></label>
      <label>Demo link <small>Optional</small><input type="url" maxLength="500" value={projectDraft.demoUrl} onChange={(event) => setProjectDraft({ ...projectDraft, demoUrl: event.target.value })} placeholder="https://example.com"/></label>
      <label className="career-wide">Other project link <small>Optional. Existing links are preserved here.</small><input type="url" maxLength="500" value={projectDraft.projectUrl} onChange={(event) => setProjectDraft({ ...projectDraft, projectUrl: event.target.value })} placeholder="https://…"/></label>
      <label className="career-check career-wide"><input type="checkbox" checked={Boolean(projectDraft.publicVisible)} onChange={(event) => setProjectDraft({ ...projectDraft, publicVisible: event.target.checked })}/><span><b>Show this project on my public profile</b><small>Hidden by default. Your public profile must also be enabled.</small></span></label>
      {projectError && <p className="form-error career-wide" role="alert">{projectError}</p>}
      <div className="career-form-actions career-wide"><button className="primary-button" disabled={busy}><Save size={15}/>{busy ? 'Saving…' : editingProjectId ? 'Save project' : 'Add project'}</button><button className="secondary-button" type="button" disabled={busy} onClick={() => setMode('workspace')}>Cancel</button></div>
      </form></section>}

    {preview?.status === 'loading' && <div className="overlay" role="presentation"><section className="modal career-preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-loading"><p id="preview-loading" role="status">Loading the public profile preview…</p></section></div>}
    {preview?.status === 'ready' && <div className="overlay career-preview-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null) }}><section className="modal career-preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title"><button className="modal-close" onClick={() => setPreview(null)} aria-label="Close profile preview">×</button><h2 id="preview-title">Profile preview</h2>{!profile.publicProfileEnabled && <p className="preview-private-note">Your profile is private. Only you can see this preview until you enable it.</p>}<PublicProfileView profile={preview.profile} preview/><button className="primary-button" onClick={() => setPreview(null)}>Done</button></section></div>}
  </section>
}
