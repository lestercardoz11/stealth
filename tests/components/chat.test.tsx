import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RAGChatInterface } from '@/components/chat/rag-chat-interface';
import { useChat } from '@/lib/hooks/use-chat';

// Mock the useChat hook
jest.mock('@/lib/hooks/use-chat');

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>;

const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Test Contract',
    created_at: '2024-01-01T00:00:00Z',
    is_company_wide: false,
    user_id: 'user-1',
  },
  {
    id: 'doc-2',
    title: 'Company Policy',
    created_at: '2024-01-02T00:00:00Z',
    is_company_wide: true,
    user_id: 'user-2',
  },
];

describe('RAGChatInterface', () => {
  const mockChatHook = {
    messages: [],
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    createNewConversation: jest.fn(),
    selectConversation: jest.fn(),
    deleteConversation: jest.fn(),
    clearError: jest.fn(),
    retryLastMessage: jest.fn(),
  };

  beforeEach(() => {
    mockUseChat.mockReturnValue(mockChatHook);
  });

  it('renders chat interface with welcome message', () => {
    render(<RAGChatInterface availableDocuments={mockDocuments} />);
    
    expect(screen.getByText('Welcome to Stealth AI')).toBeInTheDocument();
    expect(screen.getByText('Your intelligent legal document assistant.')).toBeInTheDocument();
  });

  it('displays document selector', () => {
    render(<RAGChatInterface availableDocuments={mockDocuments} />);
    
    expect(screen.getByText('Document Context')).toBeInTheDocument();
    expect(screen.getByText('Test Contract')).toBeInTheDocument();
    expect(screen.getByText('Company Policy')).toBeInTheDocument();
  });

  it('allows sending messages', async () => {
    render(<RAGChatInterface availableDocuments={mockDocuments} />);
    
    const input = screen.getByPlaceholderText(/Ask a question/);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockChatHook.sendMessage).toHaveBeenCalledWith('Test message', []);
    });
  });

  it('shows loading state', () => {
    mockUseChat.mockReturnValue({
      ...mockChatHook,
      isLoading: true,
    });

    render(<RAGChatInterface availableDocuments={mockDocuments} />);
    
    expect(screen.getByText('Stealth AI is analyzing documents...')).toBeInTheDocument();
  });

  it('displays error messages', () => {
    mockUseChat.mockReturnValue({
      ...mockChatHook,
      error: 'Test error message',
    });

    render(<RAGChatInterface availableDocuments={mockDocuments} />);
    
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
  });

  it('shows privacy badge', () => {
    render(<RAGChatInterface availableDocuments={mockDocuments} />);
    
    expect(screen.getByText('100% Private')).toBeInTheDocument();
  });
});