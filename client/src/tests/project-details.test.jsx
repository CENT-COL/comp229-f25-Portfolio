import { render, screen, waitFor } from '@testing-library/react';
import ProjectDetails from '../components/project-details';
import { createMockLocalStorage } from './test-helpers';

const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

// Mimic the hooks the component relies on so we can control navigation + params.
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams()
}));

describe('ProjectDetails', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockUseParams.mockReturnValue({});
    mockNavigate.mockClear();
    // Step 0: give the component its own isolated storage.
    Object.defineProperty(window, 'localStorage', {
      value: createMockLocalStorage(),
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows the create title when there is no project id', () => {
    render(<ProjectDetails />);

    expect(screen.getByRole('heading', { name: /create project/i })).toBeInTheDocument();
  });

  test('fetches and fills the form when an id is present', async () => {
    mockUseParams.mockReturnValue({ id: 'abc123' });
    window.localStorage.getItem.mockReturnValue('secret-token');

    const mockProject = {
      name: 'Portfolio',
      description: 'Class project',
      startDate: '2025-01-10T00:00:00.000Z',
      endDate: '2025-02-20T00:00:00.000Z'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProject
    });

    render(<ProjectDetails />);

    expect(global.fetch).toHaveBeenCalledWith('/api/projects/abc123', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer secret-token' })
    }));

    // Step 3: wait for the component to finish loading data.
    await waitFor(() => {
      expect(screen.getByDisplayValue('Portfolio')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Class project')).toBeInTheDocument();
  });
});
