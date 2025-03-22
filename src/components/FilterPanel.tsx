
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Filter, Languages, Flag, User2, CalendarRange, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface FilterPanelProps {
  filters: {
    gender: string;
    ageRange: [number, number];
    country: string;
    nativeLanguage: string;
    learningLanguage: string;
    onlineStatus: string;
  };
  onFilterChange: (key: string, value: any) => void;
  countries: string[];
  languages: string[];
}

export function FilterPanel({ filters, onFilterChange, countries, languages }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="bg-card p-6 shadow-lg border rounded-xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {activeFiltersCount} Active
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-6">
            {/* Gender Filter */}
            <div className="filter-group">
              <Label className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-primary" />
                Gender
              </Label>
              <RadioGroup 
                value={filters.gender} 
                onValueChange={(value) => onFilterChange('gender', value)}
                className="flex gap-4 mt-2"
              >
                {['all', 'male', 'female', 'other'].map(gender => (
                  <div key={gender} className="flex items-center space-x-2">
                    <RadioGroupItem value={gender} id={`gender-${gender}`} />
                    <Label htmlFor={`gender-${gender}`} className="capitalize">
                      {gender}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Age Range Filter */}
            <div className="filter-group">
              <Label className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
              </Label>
              <Slider
                min={18}
                max={80}
                step={1}
                value={filters.ageRange}
                onValueChange={(value) => onFilterChange('ageRange', value)}
                className="mt-2"
              />
            </div>

            {/* Country Filter */}
            <div className="filter-group">
              <Label className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-primary" />
                Country
              </Label>
              <Select 
                value={filters.country} 
                onValueChange={(value) => onFilterChange('country', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Filters */}
            <div className="filter-group">
              <Label className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                Languages
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Select 
                  value={filters.nativeLanguage} 
                  onValueChange={(value) => onFilterChange('nativeLanguage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Native language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.learningLanguage} 
                  onValueChange={(value) => onFilterChange('learningLanguage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Learning language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Online Status Filter */}
            <div className="filter-group">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Online Status
              </Label>
              <RadioGroup 
                value={filters.onlineStatus} 
                onValueChange={(value) => onFilterChange('onlineStatus', value)}
                className="grid grid-cols-3 gap-4 mt-2"
              >
                {['all', 'online', 'offline'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem value={status} id={`status-${status}`} />
                    <Label htmlFor={`status-${status}`} className="capitalize">
                      {status === 'online' ? '🟢 Online' : status === 'offline' ? '⚫ Offline' : '🔘 All'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              className="w-full mt-4 flex items-center gap-2" 
              onClick={() => onFilterChange('reset', null)}
            >
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
