import { render, screen } from '@testing-library/react';
import AgentPipelineTimeline, { AgentEvent } from '../components/AgentPipelineTimeline';

const events: AgentEvent[] = [
  {
    id: '1',
    stage: 'media.uploaded',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    stage: 'transcription.completed',
    timestamp: new Date().toISOString(),
    data: {
      lang: 'mr',
      confidence: 0.98,
      text: 'test'
    }
  }
];

describe('AgentPipelineTimeline', () => {
  it('renders events with stage names', () => {
    render(<AgentPipelineTimeline events={events} />);
    expect(screen.getByText(/media · uploaded/i)).toBeInTheDocument();
    expect(screen.getByText(/transcription · completed/i)).toBeInTheDocument();
  });
});

