
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '@/components/Button';

interface UserSearchProps {
  onSearch: (filters: {
    query: string;
    nativeLanguage?: string;
    learningLanguage?: string;
  }) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      nativeLanguage: nativeLanguage || undefined,
      learningLanguage: learningLanguage || undefined,
    });
  };

  const clearFilters = () => {
    setQuery('');
    setNativeLanguage('');
    setLearningLanguage('');
    onSearch({ query: '' });
  };

  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4">
      <form onSubmit={handleSearch}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-input"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-4 w-4" />}
          >
            Filters
          </Button>
          <Button type="submit" size="sm">
            Search
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Native Language</label>
              <input
                type="text"
                placeholder="Filter by native language"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full p-2 rounded-md border border-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Learning Language</label>
              <input
                type="text"
                placeholder="Filter by learning language"
                value={learningLanguage}
                onChange={(e) => setLearningLanguage(e.target.value)}
                className="w-full p-2 rounded-md border border-input"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                icon={<X className="h-4 w-4" />}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserSearch;
