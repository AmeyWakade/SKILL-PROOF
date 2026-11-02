import { ExternalLink, ShieldCheck } from 'lucide-react'
import ThemePicker from './ThemePicker'

export default function PublicProfileView({ profile, theme, onChangeTheme, appearance, onChangeAppearance, preview = false }) {
  return <main className="public-screen">
    <header className="public-brand"><span className="brand-icon"><ShieldCheck size={20}/></span> skillproof {theme && <ThemePicker theme={theme} onChange={onChangeTheme} appearance={appearance} onChangeAppearance={onChangeAppearance}/>} {!preview && <a href="/">Explore assessments</a>}</header>
    <section className="public-card">
      {preview && <p className="preview-label" role="status">Preview of the same fields visitors can see. Practice history stays private.</p>}
      <div className="public-identity"><span className="public-avatar">{profile.displayName?.slice(0, 1)?.toUpperCase()}</span><div><div className="section-kicker">SKILLPROOF PORTFOLIO</div><h1>{profile.displayName}</h1>{(profile.headline || profile.targetRole || profile.location) && <p>{profile.headline || profile.targetRole}{profile.location ? ` · ${profile.location}` : ''}</p>}</div></div>
      {profile.bio && <p className="public-bio">{profile.bio}</p>}
      {profile.skills?.length > 0 && <div className="public-section"><h2>Skills the candidate chose to share</h2><div className="tags">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>}
      {profile.projects?.length > 0 && <div className="public-section"><h2>Projects they chose to share</h2><div className="public-projects">{profile.projects.map((project) => <article className="public-project" key={project.id}><div><h3>{project.title}</h3><p>{project.description}</p><small className="project-status">{project.status?.replace('_', ' ') || 'PLANNED'}</small>{project.skills && <div className="tags">{project.skills.split(',').map((skill) => <span key={skill}>{skill.trim()}</span>)}</div>}<div className="public-project-links">{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub <ExternalLink size={13}/></a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer">Demo <ExternalLink size={13}/></a>}{!project.githubUrl && !project.demoUrl && project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer">Project link <ExternalLink size={13}/></a>}</div></div></article>)}</div></div>}
      {!profile.skills?.length && !profile.projects?.length && !profile.headline && !profile.targetRole && !profile.bio && <p className="public-muted">The candidate has not selected career details, skills, or projects to share yet.</p>}
      <p className="public-muted">Career details, selected skills, and project descriptions are self-reported. SkillProof does not verify them.</p>
    </section>
    {!preview && <footer className="public-footer">Built with SkillProof · Show what you are learning.</footer>}
  </main>
}
