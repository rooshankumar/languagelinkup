
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Globe, Users } from 'lucide-react';

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
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="space-y-2">
        <Label>Gender</Label>
        <RadioGroup value={filters.gender} onValueChange={(value) => onFilterChange('gender', value)} className="flex gap-4">
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
        <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</Label>
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
        <Label>Country</Label>
        <Select value={filters.country} onValueChange={(value) => onFilterChange('country', value)}>
          <SelectTrigger>
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
        <Label>Native Language</Label>
        <Select value={filters.nativeLanguage} onValueChange={(value) => onFilterChange('nativeLanguage', value)}>
          <SelectTrigger>
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
        <Label>Learning Language</Label>
        <Select value={filters.learningLanguage} onValueChange={(value) => onFilterChange('learningLanguage', value)}>
          <SelectTrigger>
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
        <Label>Online Status</Label>
        <RadioGroup value={filters.onlineStatus} onValueChange={(value) => onFilterChange('onlineStatus', value)} className="space-y-2">
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

      <div className="pt-2">
        <Button variant="outline" className="w-full" onClick={() => {
          onFilterChange('reset', null);
        }}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
