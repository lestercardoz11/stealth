'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  MessageSquare,
  FileText,
  Shield,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
  Play,
  CheckCircle,
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articles: GuideArticle[];
  category: 'getting-started' | 'features' | 'admin' | 'security';
}

interface GuideArticle {
  id: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  videoUrl?: string;
}

export function UserGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using Stealth AI',
      icon: Play,
      category: 'getting-started',
      articles: [
        {
          id: 'welcome',
          title: 'Welcome to Stealth AI',
          description: 'Overview of the platform and key features',
          readTime: '3 min',
          difficulty: 'beginner',
          content: `
# Welcome to Stealth AI

Stealth AI is a private LLM platform designed exclusively for law firms. This guide will help you get started with the platform.

## Key Features

- **100% Private Processing**: All AI processing happens locally on your infrastructure
- **Document Intelligence**: Upload and analyze legal documents with AI assistance
- **Secure Chat Interface**: Natural language queries with document context
- **Role-based Access**: Admin and employee roles with appropriate permissions

## Getting Started

1. **Upload Documents**: Start by uploading your legal documents
2. **Select Context**: Choose which documents to use for AI analysis
3. **Ask Questions**: Use natural language to query your documents
4. **Review Results**: Get AI-powered insights with source citations

## Privacy & Security

Your data never leaves your infrastructure. All processing is done locally with no external API calls.
          `,
        },
        {
          id: 'first-steps',
          title: 'Your First Steps',
          description: 'Complete your account setup and upload your first document',
          readTime: '5 min',
          difficulty: 'beginner',
          content: `
# Your First Steps

Follow these steps to get started with Stealth AI:

## 1. Complete Your Profile
- Add your full name and profile picture
- Review your account settings
- Set up notification preferences

## 2. Upload Your First Document
- Navigate to Documents > Upload
- Select a PDF, DOCX, or TXT file
- Add a descriptive title
- Choose whether to make it company-wide

## 3. Start Your First Chat
- Go to the AI Chat interface
- Select your uploaded document
- Ask a question about the document
- Review the AI response and sources

## Tips for Success
- Use descriptive document titles
- Ask specific questions for better results
- Review source citations for accuracy
          `,
        },
      ],
    },
    {
      id: 'chat-features',
      title: 'AI Chat Features',
      description: 'Master the AI chat interface and document analysis',
      icon: MessageSquare,
      category: 'features',
      articles: [
        {
          id: 'chat-basics',
          title: 'Chat Interface Basics',
          description: 'Learn how to effectively use the AI chat interface',
          readTime: '4 min',
          difficulty: 'beginner',
          content: `
# AI Chat Interface

The AI chat interface is your primary tool for document analysis and legal research.

## Document Selection
- Use the sidebar to select documents for context
- Choose multiple documents for comprehensive analysis
- Filter by personal or company-wide documents

## Asking Questions
- Be specific in your queries
- Reference particular sections or clauses
- Ask for summaries, analysis, or comparisons

## Understanding Responses
- Review source citations for accuracy
- Check relevance scores for context quality
- Use follow-up questions for clarification

## Best Practices
- Start with broad questions, then get specific
- Verify AI responses against source documents
- Use the chat for research, not legal advice
          `,
        },
        {
          id: 'advanced-queries',
          title: 'Advanced Query Techniques',
          description: 'Advanced techniques for better AI responses',
          readTime: '6 min',
          difficulty: 'intermediate',
          content: `
# Advanced Query Techniques

Improve your AI interactions with these advanced techniques:

## Query Types

### Analysis Queries
- "Analyze the liability clauses in this contract"
- "What are the key risks in this agreement?"
- "Compare the terms between these two contracts"

### Research Queries
- "Find all references to intellectual property"
- "What precedents support this argument?"
- "Summarize the compliance requirements"

### Drafting Assistance
- "Draft a clause for data protection"
- "Suggest improvements to this section"
- "What's missing from this agreement?"

## Context Optimization
- Select relevant documents only
- Use document titles that describe content
- Organize documents by topic or case

## Response Evaluation
- Always verify against source documents
- Check for potential biases or limitations
- Use multiple queries for complex topics
          `,
        },
      ],
    },
    {
      id: 'document-management',
      title: 'Document Management',
      description: 'Organize and manage your legal documents effectively',
      icon: FileText,
      category: 'features',
      articles: [
        {
          id: 'uploading-docs',
          title: 'Uploading Documents',
          description: 'Best practices for document uploads and organization',
          readTime: '4 min',
          difficulty: 'beginner',
          content: `
# Document Upload Guide

Learn how to effectively upload and organize your documents.

## Supported Formats
- PDF files (recommended)
- Microsoft Word (.docx, .doc)
- Plain text (.txt)
- Maximum file size: 50MB

## Upload Process
1. Navigate to Documents > Upload
2. Drag and drop files or click to browse
3. Add descriptive titles
4. Set company-wide sharing if needed
5. Wait for processing to complete

## Organization Tips
- Use clear, descriptive titles
- Include case names or matter numbers
- Organize by practice area or client
- Use consistent naming conventions

## Company-wide Documents
- Mark important documents as company-wide
- These are accessible to all employees
- Use for templates, policies, and references
- Admins can manage all company documents
          `,
        },
        {
          id: 'document-security',
          title: 'Document Security',
          description: 'Understanding document privacy and security features',
          readTime: '3 min',
          difficulty: 'beginner',
          content: `
# Document Security

Your documents are protected with enterprise-grade security.

## Privacy Features
- All processing happens locally
- No external API calls or data sharing
- Documents never leave your infrastructure
- End-to-end encryption for all data

## Access Controls
- Personal documents are private by default
- Company-wide documents accessible to all employees
- Admins can access all documents
- Role-based permissions enforced

## Data Protection
- Automatic backups and versioning
- Audit logs for all document actions
- Secure file storage with encryption
- GDPR and compliance ready

## Best Practices
- Regular review of document access
- Use company-wide sharing judiciously
- Monitor document usage through admin panel
- Report any security concerns immediately
          `,
        },
      ],
    },
    {
      id: 'admin-features',
      title: 'Admin Features',
      description: 'Administrative tools and user management',
      icon: Users,
      category: 'admin',
      articles: [
        {
          id: 'user-management',
          title: 'User Management',
          description: 'Managing users, roles, and permissions',
          readTime: '5 min',
          difficulty: 'intermediate',
          content: `
# User Management

Comprehensive guide to managing users and permissions.

## User Approval Process
1. New users register and await approval
2. Review pending users in Admin > Users > Pending
3. Approve or reject based on your criteria
4. Approved users gain access to the platform

## Role Management
- **Admin**: Full platform access and management
- **Employee**: Standard user with document and chat access
- Change roles as needed through user management

## User Status
- **Pending**: Awaiting approval
- **Approved**: Active platform access
- **Rejected**: Access denied

## Best Practices
- Review new users promptly
- Use employee role for most users
- Limit admin access to necessary personnel
- Regular audit of user permissions
          `,
        },
        {
          id: 'security-monitoring',
          title: 'Security Monitoring',
          description: 'Monitor security events and system health',
          readTime: '6 min',
          difficulty: 'advanced',
          content: `
# Security Monitoring

Keep your platform secure with comprehensive monitoring.

## Security Dashboard
- Overall security score and metrics
- Active session monitoring
- Failed login attempt tracking
- System health indicators

## Audit Logs
- Complete audit trail of all actions
- User authentication events
- Document access and modifications
- Administrative actions

## Session Management
- View all active user sessions
- Monitor device and location information
- Terminate suspicious sessions
- Set session timeout policies

## Threat Detection
- Automated monitoring for suspicious activity
- Rate limiting for API endpoints
- IP-based access controls
- Real-time security alerts

## Response Procedures
1. Monitor security dashboard regularly
2. Investigate unusual activity patterns
3. Take immediate action on threats
4. Document and report security incidents
          `,
        },
      ],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'features', label: 'Features' },
    { id: 'admin', label: 'Admin' },
    { id: 'security', label: 'Security' },
  ];

  const filteredSections = guideSections.filter(section => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.articles.some(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesCategory && matchesSearch;
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (selectedArticle) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            onClick={() => setSelectedArticle(null)}
          >
            ← Back to Guide
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{selectedArticle.title}</h1>
            <div className='flex items-center gap-2 mt-1'>
              <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                {selectedArticle.difficulty}
              </Badge>
              <span className='text-sm text-muted-foreground'>
                {selectedArticle.readTime} read
              </span>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className='p-6'>
            <div className='prose prose-sm max-w-none dark:prose-invert'>
              <div dangerouslySetInnerHTML={{ 
                __html: selectedArticle.content.replace(/\n/g, '<br>') 
              }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold flex items-center gap-2'>
          <BookOpen className='h-8 w-8' />
          User Guide
        </h1>
        <p className='text-muted-foreground mt-2'>
          Learn how to use Stealth AI effectively and securely
        </p>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search help articles...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        
        <div className='flex gap-2 flex-wrap'>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <Card className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Play className='h-5 w-5 text-blue-600' />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                1
              </div>
              <div>
                <h4 className='font-medium'>Upload Documents</h4>
                <p className='text-sm text-muted-foreground'>
                  Start by uploading your legal documents
                </p>
              </div>
            </div>
            
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                2
              </div>
              <div>
                <h4 className='font-medium'>Select Context</h4>
                <p className='text-sm text-muted-foreground'>
                  Choose documents for AI analysis
                </p>
              </div>
            </div>
            
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                3
              </div>
              <div>
                <h4 className='font-medium'>Ask Questions</h4>
                <p className='text-sm text-muted-foreground'>
                  Get AI-powered insights and analysis
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Sections */}
      <div className='space-y-4'>
        {filteredSections.map((section) => (
          <Card key={section.id}>
            <Collapsible
              open={expandedSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className='cursor-pointer hover:bg-accent/50 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                        <section.icon className='h-5 w-5 text-primary' />
                      </div>
                      <div className='text-left'>
                        <CardTitle className='text-lg'>{section.title}</CardTitle>
                        <p className='text-sm text-muted-foreground'>
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      'h-5 w-5 transition-transform',
                      expandedSections.includes(section.id) && 'rotate-180'
                    )} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className='pt-0'>
                  <div className='space-y-3'>
                    {section.articles.map((article) => (
                      <div
                        key={article.id}
                        className='p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer'
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <h4 className='font-medium mb-1'>{article.title}</h4>
                            <p className='text-sm text-muted-foreground mb-2'>
                              {article.description}
                            </p>
                            <div className='flex items-center gap-2'>
                              <Badge className={getDifficultyColor(article.difficulty)}>
                                {article.difficulty}
                              </Badge>
                              <span className='text-xs text-muted-foreground'>
                                {article.readTime}
                              </span>
                              {article.videoUrl && (
                                <Badge variant='outline' className='text-xs'>
                                  Video
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Help Footer */}
      <Card>
        <CardContent className='p-6'>
          <div className='text-center space-y-4'>
            <HelpCircle className='h-12 w-12 text-muted-foreground mx-auto' />
            <div>
              <h3 className='font-semibold mb-2'>Need More Help?</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Can't find what you're looking for? Contact your administrator or check our FAQ.
              </p>
              <div className='flex justify-center gap-2'>
                <Button variant='outline' size='sm'>
                  <ExternalLink className='h-4 w-4 mr-2' />
                  Contact Support
                </Button>
                <Button variant='outline' size='sm'>
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}