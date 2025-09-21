'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  ChevronDown,
  HelpCircle,
  Shield,
  MessageSquare,
  FileText,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'security' | 'chat' | 'documents' | 'admin';
  tags: string[];
}

export function FAQSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqItems: FAQItem[] = [
    {
      id: 'privacy-guarantee',
      question: 'How can I be sure my data stays private?',
      answer:
        'Stealth AI processes all data locally on your infrastructure. We never send your documents or queries to external APIs. All AI processing happens on your own servers using local models, ensuring 100% data privacy.',
      category: 'security',
      tags: ['privacy', 'security', 'local processing'],
    },
    {
      id: 'supported-formats',
      question: 'What document formats are supported?',
      answer:
        'We support PDF, Microsoft Word (.docx, .doc), and plain text (.txt) files. Maximum file size is 50MB per document. PDFs are recommended for best results.',
      category: 'documents',
      tags: ['formats', 'upload', 'pdf', 'word'],
    },
    {
      id: 'ai-accuracy',
      question: 'How accurate are the AI responses?',
      answer:
        'Our AI provides analysis based on your uploaded documents with source citations. Always verify AI responses against original documents. The AI is designed to assist with research and analysis, not replace legal judgment.',
      category: 'chat',
      tags: ['accuracy', 'verification', 'sources'],
    },
    {
      id: 'user-roles',
      question: 'What are the different user roles?',
      answer:
        'There are two roles: Admin (full platform access, user management, system settings) and Employee (document upload, AI chat, company document access). Admins can change user roles as needed.',
      category: 'admin',
      tags: ['roles', 'permissions', 'admin', 'employee'],
    },
    {
      id: 'company-documents',
      question: 'What are company-wide documents?',
      answer:
        'Company-wide documents are accessible to all employees and can be used for AI analysis by anyone in the organization. These are typically templates, policies, or reference materials.',
      category: 'documents',
      tags: ['company-wide', 'sharing', 'access'],
    },
    {
      id: 'data-export',
      question: 'Can I export my data?',
      answer:
        'Yes, you can export all your personal data including documents, chat history, and profile information. Go to Profile > Data Export to request a complete data export.',
      category: 'general',
      tags: ['export', 'gdpr', 'data portability'],
    },
    {
      id: 'session-security',
      question: 'How are user sessions secured?',
      answer:
        'Sessions use secure tokens with configurable timeouts. Admins can monitor active sessions, detect suspicious activity, and terminate sessions remotely. All session data is encrypted.',
      category: 'security',
      tags: ['sessions', 'tokens', 'monitoring'],
    },
    {
      id: 'document-processing',
      question: 'How long does document processing take?',
      answer:
        'Document processing typically takes 1-5 minutes depending on file size and content. You can use documents for AI chat immediately after upload, with full processing completing in the background.',
      category: 'documents',
      tags: ['processing', 'time', 'background'],
    },
    {
      id: 'chat-context',
      question: 'How do I select documents for AI context?',
      answer:
        'Use the document selector in the chat sidebar to choose which documents the AI should reference. You can select multiple documents for comprehensive analysis across your document library.',
      category: 'chat',
      tags: ['context', 'selection', 'multiple documents'],
    },
    {
      id: 'audit-logs',
      question: 'What activities are logged for security?',
      answer:
        'We log all authentication events, document uploads/downloads, user management actions, and system configuration changes. Logs include timestamps, user information, and IP addresses for security monitoring.',
      category: 'security',
      tags: ['audit', 'logging', 'monitoring', 'compliance'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'admin', label: 'Admin', icon: Users },
  ];

  const filteredFAQs = faqItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find((cat) => cat.id === category);
    return categoryData?.icon || HelpCircle;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold flex items-center gap-2'>
          <HelpCircle className='h-8 w-8' />
          Frequently Asked Questions
        </h1>
        <p className='text-muted-foreground mt-2'>
          Find answers to common questions about Stealth AI
        </p>
      </div>

      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Search FAQ...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Categories */}
      <div className='flex flex-wrap gap-2'>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent border-border'
            )}>
            <category.icon className='h-4 w-4' />
            <span className='text-sm font-medium'>{category.label}</span>
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className='space-y-3'>
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className='p-8 text-center'>
              <HelpCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='font-semibold mb-2'>No questions found</h3>
              <p className='text-muted-foreground'>
                Try adjusting your search terms or category filter
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const isExpanded = expandedItems.includes(item.id);

            return (
              <Card key={item.id}>
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleItem(item.id)}>
                  <CollapsibleTrigger asChild>
                    <CardContent className='p-4 cursor-pointer hover:bg-accent/50 transition-colors'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex items-start gap-3 flex-1'>
                          <CategoryIcon className='h-5 w-5 text-primary mt-0.5 shrink-0' />
                          <div className='flex-1'>
                            <h3 className='font-medium text-left mb-2'>
                              {item.question}
                            </h3>
                            <div className='flex flex-wrap gap-1'>
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant='secondary'
                                  className='text-xs'>
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 text-muted-foreground transition-transform shrink-0',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className='pt-0 pb-4 px-4'>
                      <div className='pl-8'>
                        <div className='prose prose-sm max-w-none dark:prose-invert'>
                          <p className='text-muted-foreground leading-relaxed'>
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
