import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import CareerWorkspace from './CareerWorkspace'

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }))
vi.mock('./api', () => ({ api: apiMock }))

const initialProfile = {
  id: 'user-1', displayName: 'Amey', headline: '', targetRole: '', location: '', bio: '', skills: [],
  publicProfileEnabled: false, publicCareerDetailsEnabled: false, publicSkillsEnabled: false,
}
const project = { id: 'project-1', title: 'Study planner', description: 'A planner I am building.', projectUrl: '', githubUrl: '', demoUrl: '', skills: 'Java', status: 'IN_PROGRESS', publicVisible: false }
const props = { onBack: vi.fn(), user: { displayName: 'Amey' }, onUpdated: vi.fn(), theme: 'light', onChangeTheme: vi.fn() }

function boot(profile = initialProfile, projects = []) {
  apiMock.mockImplementation(async (url) => {
    if (url === '/api/v1/profile') return profile
    if (url === '/api/v1/portfolio-projects') return projects
    throw new Error(`Unexpected GET ${url}`)
  })
  return render(<CareerWorkspace {...props}/>)
}

afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('Career Workspace', () => {
  it('saves edited career details and selected skills, with sharing private by default', async () => {
    boot()
    expect(await screen.findByRole('heading', { name: 'Your career details' })).toBeInTheDocument()
    screen.getAllByRole('checkbox').slice(0, 3).forEach((checkbox) => expect(checkbox).not.toBeChecked())

    fireEvent.change(screen.getByLabelText('Career goal or target role'), { target: { value: 'Java developer' } })
    fireEvent.change(screen.getByPlaceholderText('Java, React, SQL'), { target: { value: 'Java, SQL' } })
    apiMock.mockImplementation(async (url, options) => url === '/api/v1/profile'
      ? { ...initialProfile, targetRole: 'Java developer', skills: ['Java', 'SQL'], ...(options ? JSON.parse(options.body) : {}) }
      : [])
    fireEvent.click(screen.getByRole('button', { name: 'Save and view workspace' }))
    expect(await screen.findByRole('heading', { name: 'Java developer' })).toBeInTheDocument()
    const put = apiMock.mock.calls.find(([url, options]) => url === '/api/v1/profile' && options?.method === 'PUT')
    expect(JSON.parse(put[1].body)).toMatchObject({ targetRole: 'Java developer', skills: ['Java', 'SQL'], publicProfileEnabled: false, publicSkillsEnabled: false })

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit details' })[0])
    fireEvent.change(screen.getByLabelText('Career goal or target role'), { target: { value: 'Backend developer' } })
    apiMock.mockImplementation(async (url, options) => url === '/api/v1/profile'
      ? { ...initialProfile, targetRole: 'Backend developer', skills: ['Java', 'SQL'], ...(options ? JSON.parse(options.body) : {}) }
      : [])
    fireEvent.click(screen.getByRole('button', { name: 'Save and view workspace' }))
    expect(await screen.findByRole('heading', { name: 'Backend developer' })).toBeInTheDocument()
  })

  it('creates a project and can update its status', async () => {
    boot({ ...initialProfile, targetRole: 'Java developer' })
    fireEvent.click(await screen.findByRole('button', { name: 'Add project' }))
    fireEvent.change(screen.getByLabelText('Project title'), { target: { value: 'Study planner' } })
    fireEvent.change(screen.getByLabelText('Short description'), { target: { value: 'A planner I am building.' } })
    fireEvent.change(screen.getByPlaceholderText('Only skills you used or intend to use'), { target: { value: 'Java' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'IN_PROGRESS' } })
    apiMock.mockImplementation(async (url, options) => {
      if (url === '/api/v1/profile') return { ...initialProfile, targetRole: 'Java developer' }
      if (url === '/api/v1/portfolio-projects') return options?.method === 'POST' ? { ...project, ...JSON.parse(options.body), id: project.id, skills: 'Java' } : []
      if (url === '/api/v1/portfolio-projects/project-1') return { ...project, ...JSON.parse(options.body), status: 'COMPLETED', skills: 'Java' }
      throw new Error(`Unexpected request ${url}`)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add project' }))
    expect(await screen.findByRole('heading', { name: 'Study planner' })).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    const createCall = apiMock.mock.calls.find(([url, options]) => url === '/api/v1/portfolio-projects' && options?.method === 'POST')
    expect(JSON.parse(createCall[1].body)).toMatchObject({ title: 'Study planner', status: 'IN_PROGRESS', githubUrl: '', demoUrl: '' })

    fireEvent.click(screen.getByRole('button', { name: 'Edit', exact: true }))
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'COMPLETED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save project' }))
    expect(apiMock.mock.calls.some(([url, options]) => url === '/api/v1/portfolio-projects/project-1' && options?.method === 'PUT' && JSON.parse(options.body).status === 'COMPLETED')).toBe(true)
    expect(await screen.findByRole('button', { name: 'Edit', exact: true })).toBeInTheDocument()
  })

  it('shows only the server-filtered public profile projection in preview', async () => {
    boot({ ...initialProfile, targetRole: 'Private goal' }, [project])
    apiMock.mockImplementation(async (url) => {
      if (url === '/api/v1/profile') return { ...initialProfile, targetRole: 'Private goal' }
      if (url === '/api/v1/portfolio-projects') return [project]
      if (url === '/api/v1/profile/preview') return { id: 'user-1', displayName: 'Amey', projects: [] }
      throw new Error(`Unexpected GET ${url}`)
    })
    await screen.findByRole('heading', { name: 'Private goal' })
    fireEvent.click(screen.getByRole('button', { name: 'Preview profile' }))
    expect(await screen.findByRole('heading', { name: 'Profile preview' })).toBeInTheDocument()
    const dialog = screen.getByRole('dialog', { name: 'Profile preview' })
    expect(within(dialog).getByText('Your profile is private. Only you can see this preview until you enable it.')).toBeInTheDocument()
    expect(within(dialog).queryByText('Private goal')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('Study planner')).not.toBeInTheDocument()
  })

  it('continues into Proving Ground practice after the goal, skills, and project are ready', async () => {
    const onContinueLearning = vi.fn()
    apiMock.mockImplementation(async (url) => {
      if (url === '/api/v1/profile') return { ...initialProfile, targetRole: 'Java developer', skills: ['Java'] }
      if (url === '/api/v1/portfolio-projects') return [{ ...project, status: 'COMPLETED' }]
      throw new Error(`Unexpected GET ${url}`)
    })
    render(<CareerWorkspace {...props} onContinueLearning={onContinueLearning}/>);

    expect(await screen.findByRole('heading', { name: 'Practice your selected skills' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continue: Practice your selected skills' }))
    expect(onContinueLearning).toHaveBeenCalledOnce()
  })
})
