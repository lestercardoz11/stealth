'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Building2, 
  User, 
  FileText,
  Calendar
} from 'lucide-react';

export interface DocumentFilters {
  search: string;
  type: 'all' | 'personal' | 'company';
  fileType: 'all' | 'pdf' | 'docx' | 'doc' | 'txt';
  sortBy: 'newest' | 'oldest' | 'name' | 'size';
}

interface DocumentSearchProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  resultCount?: number;
}

export function DocumentSearch({ 
  filters, 
  onFiltersChange, 
  resultCount 
}: DocumentSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof DocumentFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      fileType: 'all',
      sortBy: 'newest',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.fileType !== 'all' || 
    filters.sortBy !== 'newest';

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="shrink-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="personal">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </div>
                </SelectItem>
                <SelectItem value="company">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Company-wide
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">File Type</label>
            <Select value={filters.fileType} onValueChange={(value) => updateFilter('fileType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="doc">DOC</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Name A-Z
                  </div>
                </SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters & Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.type === 'personal' ? (
                <>
                  <User className="h-3 w-3" />
                  Personal
                </>
              ) : (
                <>
                  <Building2 className="h-3 w-3" />
                  Company
                </>
              )}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('type', 'all')}
              />
            </Badge>
          )}
          {filters.fileType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.fileType.toUpperCase()}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('fileType', 'all')}
              />
            </Badge>
          )}
        </div>
        
        {resultCount !== undefined && (
          <span className="text-sm text-muted-foreground">
            {resultCount} document{resultCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  );
}