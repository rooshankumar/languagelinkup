
import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Globe2, Languages, Target, Activity } from 'lucide-react';

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
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && 
    value !== 'all' && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label>Gender</Label>
            </div>
            <RadioGroup 
              value={filters.gender} 
              onValueChange={(value) => onFilterChange('gender', value)} 
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</Label>
            </div>
            <Slider
              value={filters.ageRange}
              min={18}
              max={80}
              step={1}
              onValueChange={(value) => onFilterChange('ageRange', value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              <Label>Country</Label>
            </div>
            <Select value={filters.country} onValueChange={(value) => onFilterChange('country', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <Label>Native Language</Label>
            </div>
            <Select value={filters.nativeLanguage} onValueChange={(value) => onFilterChange('nativeLanguage', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <Label>Learning Language</Label>
            </div>
            <Select value={filters.learningLanguage} onValueChange={(value) => onFilterChange('learningLanguage', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <Label>Online Status</Label>
            </div>
            <RadioGroup 
              value={filters.onlineStatus} 
              onValueChange={(value) => onFilterChange('onlineStatus', value)} 
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">🟢 Active Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recent" id="recent" />
                <Label htmlFor="recent">🟡 Recently Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">🔘 All Users</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={() => onFilterChange('reset', null)}
          >
            Reset Filters
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
