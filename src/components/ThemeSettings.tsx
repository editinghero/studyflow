
import React, { useState } from 'react';
import { Moon, Sun, Palette, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme, ColorScheme } from '@/contexts/ThemeContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const colorSchemes: { name: string; value: ColorScheme; colors: string[] }[] = [
  { name: 'Ocean Blue', value: 'blue', colors: ['#3B82F6', '#1D4ED8', '#0EA5E9'] },
  { name: 'Royal Purple', value: 'purple', colors: ['#8B5CF6', '#7C3AED', '#A855F7'] },
  { name: 'Forest Green', value: 'green', colors: ['#10B981', '#059669', '#34D399'] },
  { name: 'Sunset Rose', value: 'rose', colors: ['#F43F5E', '#E11D48', '#FB7185'] },
  { name: 'Warm Orange', value: 'orange', colors: ['#F97316', '#EA580C', '#FB923C'] },
];

const ThemeSettings: React.FC = () => {
  const { isDarkMode, colorScheme, toggleDarkMode, setColorScheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggleDarkMode}
        variant="outline"
        size="icon"
        className="glass-effect hover:scale-105 transition-all duration-200"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="glass-effect hover:scale-105 transition-all duration-200"
          >
            <Palette size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 z-50 glass-card" 
          align="end"
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Settings size={16} />
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3 text-foreground">Color Scheme</h4>
                <div className="grid grid-cols-1 gap-2">
                  {colorSchemes.map(({ name, value, colors }) => (
                    <button
                      key={value}
                      onClick={() => setColorScheme(value)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.02] text-foreground ${
                        colorScheme === value 
                          ? 'border-primary bg-primary/10 scale-[1.02]' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      {colorScheme === value && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ThemeSettings;
