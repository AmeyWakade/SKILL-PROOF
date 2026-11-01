import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import CodingArena from './CodingArena'
import { codingArenaProblems, filterArenaProblems } from './codingArenaContent'
import { api } from './api'

vi.mock('./api', () => ({ api: vi.fn() }))
afterEach(() => { cleanup(); window.localStorage.clear(); vi.clearAllMocks() })

describe('Coding Arena', () => {
  it('seeds original coverage for all requested Java topics and filters by difficulty and status', () => {
    const topics = new Set(codingArenaProblems.map((problem) => problem.topic))
    for (const topic of ['Arrays', 'Strings', 'Hash Maps', 'Sorting', 'Binary Search', 'Stacks', 'Queues', 'Recursion', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming']) expect(topics).toContain(topic)
    const progress = { 'max-rise': { solved: true, attempts: [{ accepted: true }] } }
    expect(filterArenaProblems(codingArenaProblems, { difficulty: 'Beginner', status: 'Solved', progress }).map((problem) => problem.id)).toEqual(['max-rise'])
    expect(filterArenaProblems(codingArenaProblems, { search: 'graph', topic: 'Graphs' })).toHaveLength(1)
  })

  it('opens a problem, progressively reveals hints, and keeps independent draft/history state locally', async () => {
    render(<CodingArena />)
    fireEvent.click(screen.getByRole('button', { name: /Best rise in a number series/ }))
    expect(screen.getByRole('heading', { name: 'Best rise in a number series' })).toBeInTheDocument()
    expect(screen.queryByText(/Keep the smallest value/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Reveal hint 1 of 2/ }))
    expect(screen.getByText(/Keep the smallest value seen/)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Java 21 solution' }), { target: { value: 'public class Main {}' } })
    const saved = JSON.parse(window.localStorage.getItem('skillproof-coding-arena-progress-v1'))
    expect(saved.drafts['max-rise']).toBe('public class Main {}')
    fireEvent.click(screen.getByRole('button', { name: /Problem browser/ }))
    expect(screen.getByText(/Progress stays in this browser/)).toBeInTheDocument()
  })

  it('runs visible samples only through JDoodle and records them without marking a problem solved', async () => {
    api.mockResolvedValueOnce({ enabled: true })
      .mockResolvedValueOnce({ output: '5' })
      .mockResolvedValueOnce({ output: '0' })
    render(<CodingArena user={{ id: 'candidate-1' }} />)
    fireEvent.click(await screen.findByRole('button', { name: /Best rise in a number series/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Run sample tests/ }))
    expect(await screen.findByText('2/2 sample tests passed')).toBeInTheDocument()
    expect(api).toHaveBeenCalledWith('/api/v1/compiler/run', expect.objectContaining({ method: 'POST' }))
    const saved = JSON.parse(window.localStorage.getItem('skillproof-coding-arena-progress-v1'))
    expect(saved.problems['max-rise'].solved).toBe(false)
    expect(saved.problems['max-rise'].attempts[0]).toMatchObject({ kind: 'sample', passed: 2, total: 2 })
  })

  it('submits against hidden server tests and persists accepted completion separately from attempt history', async () => {
    api.mockResolvedValueOnce({ enabled: true }).mockResolvedValueOnce({ passed: 2, total: 2, accepted: true })
    const view = render(<CodingArena user={{ id: 'candidate-1' }} />)
    fireEvent.click(await screen.findByRole('button', { name: /Best rise in a number series/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Submit solution/ }))
    expect(await screen.findByText('Accepted')).toBeInTheDocument()
    expect(api).toHaveBeenCalledWith('/api/v1/coding-arena/max-rise/submit', expect.objectContaining({ method: 'POST' }))
    const saved = JSON.parse(window.localStorage.getItem('skillproof-coding-arena-progress-v1'))
    expect(saved.problems['max-rise'].solved).toBe(true)
    expect(saved.history).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: /Problem browser/ }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'Solved' } })
    expect(screen.getAllByRole('button', { name: /Best rise in a number series/ })).toHaveLength(2)
    await waitFor(() => expect(screen.getByText('1 / 1 problem attempted today')).toBeInTheDocument())
    view.unmount()
    render(<CodingArena />)
    expect(screen.getByText('Total runs').parentElement).toHaveTextContent('1')
    expect(screen.getByText(/Progress stays in this browser/)).toBeInTheDocument()
  })

  it('keeps runner credentials out of the client and gives signed-in users a clear setup/error state', async () => {
    api.mockRejectedValueOnce(new Error('Please sign in to continue.'))
    render(<CodingArena user={{ id: 'candidate-1' }} />)
    fireEvent.click(screen.getByRole('button', { name: /Best rise in a number series/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not check Java runner status/)
    expect(api).toHaveBeenCalledWith('/api/v1/compiler/status')
  })
})
