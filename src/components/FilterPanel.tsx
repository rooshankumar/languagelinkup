import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Globe2, Languages, Target, Activity, RefreshCw } from 'lucide-react';

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
    value !== '' && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-gradient-to-br from-white/60 to-gray-100/60 backdrop-blur-lg shadow-lg border border-gray-300 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-lg">
              {activeFiltersCount} Active
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          {/* Gender Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-blue-500" /> Gender
            </Label>
            <RadioGroup value={filters.gender} onValueChange={(value) => onFilterChange('gender', value)} className="flex gap-4">
              {['male', 'female', 'other'].map((gender) => (
                <div key={gender} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                  <RadioGroupItem value={gender} id={gender} />
                  <Label htmlFor={gender} className="capitalize">{gender}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Age Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Target className="h-5 w-5 text-green-500" /> Age: {filters.ageRange[0]} - {filters.ageRange[1]}
            </Label>
            <Slider value={filters.ageRange} min={18} max={80} step={1} onValueChange={(value) => onFilterChange('ageRange', value)} className="w-full" />
          </div>

          {/* Country Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Globe2 className="h-5 w-5 text-yellow-500" /> Country
            </Label>
            <Select value={filters.country} onValueChange={(value) => onFilterChange('country', value)}>
              <SelectTrigger className="w-full border-gray-300 rounded-lg shadow-sm hover:border-gray-400">
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

          {/* Native & Learning Language Filters */}
          {['nativeLanguage', 'learningLanguage'].map((langType) => (
            <div key={langType} className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <Languages className="h-5 w-5 text-purple-500" /> {langType === 'nativeLanguage' ? 'Native Language' : 'Learning Language'}
              </Label>
              <Select value={filters[langType]} onValueChange={(value) => onFilterChange(langType, value)}>
                <SelectTrigger className="w-full border-gray-300 rounded-lg shadow-sm hover:border-gray-400">
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
          ))}

          {/* Online Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <Activity className="h-5 w-5 text-red-500" /> Online Status
            </Label>
            <RadioGroup value={filters.onlineStatus} onValueChange={(value) => onFilterChange('onlineStatus', value)} className="space-y-2">
              {['online', 'recent', 'all'].map(status => (
                <div key={status} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                  <RadioGroupItem value={status} id={status} />
                  <Label htmlFor={status} className="capitalize">{status === 'online' ? '🟢 Active Now' : status === 'recent' ? '🟡 Recently Active' : '🔘 All Users'}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Reset Filters Button */}
          <Button variant="outline" className="w-full mt-4 flex items-center gap-2 text-gray-800 hover:bg-gray-200" onClick={() => onFilterChange('reset', null)}>
            <RefreshCw className="h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
