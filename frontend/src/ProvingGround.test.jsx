import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import ProvingGround from './ProvingGround'

afterEach(() => { cleanup(); window.localStorage.clear() })

const assessments = [
  { id: 'assessment-java', title: 'Java fundamentals: collections and streams' },
  { id: 'assessment-react', title: 'React state and component thinking' },
  { id: 'assessment-api', title: 'Design a dependable REST API' },
]

describe('Proving Ground', () => {
  it('shows all learning sections and keeps the existing MCQ catalog reachable', () => {
    const onOpenMcqs = vi.fn()
    render(<ProvingGround assessments={assessments} onOpenMcqs={onOpenMcqs}/> )
    expect(screen.getByRole('heading', { name: 'Proving Ground.' })).toBeInTheDocument()
    for (const name of ['MCQs', 'Quizzes', 'Coding', 'Notes', 'Practice']) expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Browse assessments/ }))
    expect(onOpenMcqs).toHaveBeenCalledOnce()
  })

  it('scores and saves a short topic quiz through the existing attempt persistence callback', async () => {
    const onSaveAttempt = vi.fn().mockResolvedValue({ id: 'attempt-java' })
    render(<ProvingGround assessments={assessments} user={{ displayName: 'Amey' }} onSaveAttempt={onSaveAttempt}/>)
    fireEvent.click(screen.getByRole('button', { name: /Quizzes/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /Start quiz/ })[0])
    fireEvent.click(screen.getByRole('button', { name: /HashSet/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^C.*Map/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^B.*map/ }))
    fireEvent.click(screen.getByRole('button', { name: /See results/ }))
    expect(await screen.findByText('3/3 correct · 100%')).toBeInTheDocument()
    await waitFor(() => expect(onSaveAttempt).toHaveBeenCalledOnce())
    expect(onSaveAttempt.mock.calls[0][0]).toMatchObject({ assessmentId: 'assessment-java', score: 3, totalQuestions: 3 })
    expect(onSaveAttempt.mock.calls[0][0].answerReviews[0].question).toContain('Java collections')
    expect(await screen.findByText(/Saved to My proof/)).toBeInTheDocument()
  })

  it('keeps guest quiz attempts session-only and searches notes', async () => {
    const onSaveAttempt = vi.fn()
    render(<ProvingGround assessments={assessments} onSaveAttempt={onSaveAttempt}/>)
    fireEvent.click(screen.getByRole('button', { name: /Notes/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search topic notes' }), { target: { value: 'status codes' } })
    expect(screen.getByRole('heading', { name: 'HTTP methods and status codes' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Choosing Java collections' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Quizzes/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /Start quiz/ })[0])
    fireEvent.click(screen.getByRole('button', { name: /HashSet/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^C.*Map/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^B.*map/ }))
    fireEvent.click(screen.getByRole('button', { name: /See results/ }))
    expect(await screen.findByText(/available for this session only/)).toBeInTheDocument()
    expect(onSaveAttempt).not.toHaveBeenCalled()
  })

  it('opens the Coding Arena, preserves the previous prompt, and filters problems', async () => {
    window.localStorage.setItem('skillproof-proving-ground-drafts-v1', JSON.stringify({ 'word-frequency': 'class WordCounter { /* draft */ }' }))
    render(<ProvingGround assessments={assessments}/> )
    fireEvent.click(screen.getByRole('button', { name: /Coding Arena/ }))
    expect(await screen.findByRole('heading', { name: 'Coding Arena.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Best rise in a number series/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /First character that appears once/ }))
    expect(await screen.findByRole('heading', { name: 'First character that appears once' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Problem browser/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search problems' }), { target: { value: 'word frequencies' } })
    fireEvent.click(screen.getByRole('button', { name: /Count word frequencies/ }))
    expect(screen.getByRole('textbox', { name: 'Java solution' })).toHaveValue('class WordCounter { /* draft */ }')
    expect(screen.getByText(/custom runner format is not yet available/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Problem browser/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search problems' }), { target: { value: '' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Topic' }), { target: { value: 'Strings' } })
    expect(screen.getByRole('button', { name: /Case-free palindrome check/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Best rise/ })).not.toBeInTheDocument()
  })

  it('can repeat a practice set and stores each signed-in run separately', async () => {
    const onSaveAttempt = vi.fn().mockResolvedValue({ id: 'attempt' })
    render(<ProvingGround assessments={assessments} user={{ displayName: 'Amey' }} onSaveAttempt={onSaveAttempt}/>)
    fireEvent.click(screen.getByRole('button', { name: /Practice/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /Practice again/ })[0])
    fireEvent.click(screen.getByRole('button', { name: /HashSet/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^C.*Map/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^B.*map/ }))
    fireEvent.click(screen.getByRole('button', { name: /See results/ }))
    await screen.findByText(/Saved to My proof/)
    fireEvent.click(screen.getByRole('button', { name: /Repeat/ }))
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /HashSet/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^C.*Map/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next question/ }))
    fireEvent.click(screen.getByRole('button', { name: /^B.*map/ }))
    fireEvent.click(screen.getByRole('button', { name: /See results/ }))
    await waitFor(() => expect(onSaveAttempt).toHaveBeenCalledTimes(2))
  })
})
