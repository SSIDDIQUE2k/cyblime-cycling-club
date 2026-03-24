import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Sliders, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AdvancedEventFilters({ filters, onFiltersChange, onReset }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sliders className="w-4 h-4" />
          Advanced Filters
          {Object.values(filters).some(v => v && v !== 'all') && (
            <Badge className="bg-[#ff6b35] text-white ml-2">Active</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Advanced Filters</h4>
            <Button variant="ghost" size="sm" onClick={() => { onReset(); setOpen(false); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-[var(--cy-text-muted)]">From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--cy-text-muted)]">To</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ride">Ride</SelectItem>
                <SelectItem value="trip">Trip</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="race">Race</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance/Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Search
            </Label>
            <Input
              placeholder="Enter city or area..."
              value={filters.location || ''}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            />
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label>Skill Level</Label>
            <Select 
              value={filters.level || 'all'} 
              onValueChange={(value) => onFiltersChange({ ...filters, level: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="All Levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance Range */}
          <div className="space-y-2">
            <Label>Distance (km)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-[var(--cy-text-muted)]">Min</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.distanceMin || ''}
                  onChange={(e) => onFiltersChange({ ...filters, distanceMin: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--cy-text-muted)]">Max</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.distanceMax || ''}
                  onChange={(e) => onFiltersChange({ ...filters, distanceMax: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-[#ff6b35] hover:bg-[#e55a2b]"
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}