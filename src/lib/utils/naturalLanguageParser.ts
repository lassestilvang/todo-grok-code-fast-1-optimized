import * as chrono from 'chrono-node';

export interface ParsedTaskData {
  name?: string;
  description?: string;
  date?: string; // ISO date string
  time?: string; // HH:MM format
  priority?: number;
  estimateMinutes?: number;
  labels?: string[];
}

export function parseNaturalLanguage(input: string): ParsedTaskData {
  const result: ParsedTaskData = {};

  // Use chrono to parse dates and times
  const parsedDate = chrono.parseDate(input);
  if (parsedDate) {
    result.date = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeString = parsedDate.toTimeString().split(' ')[0]; // HH:MM:SS
    result.time = timeString.substring(0, 5); // HH:MM
  }

  // Extract task name: assume everything before "at" or date keywords
  const dateKeywords = ['tomorrow', 'today', 'yesterday', 'next week', 'next month', 'at', 'by', 'due'];
  let nameEndIndex = input.length;
  for (const keyword of dateKeywords) {
    const index = input.toLowerCase().indexOf(keyword);
    if (index !== -1 && index < nameEndIndex) {
      nameEndIndex = index;
    }
  }
  result.name = input.substring(0, nameEndIndex).trim();

  // Extract priority keywords
  if (input.toLowerCase().includes('urgent') || input.toLowerCase().includes('high priority')) {
    result.priority = 2;
  } else if (input.toLowerCase().includes('important') || input.toLowerCase().includes('medium')) {
    result.priority = 1;
  } else if (input.toLowerCase().includes('low priority')) {
    result.priority = 0;
  }

  // Extract time estimate (e.g., "30 minutes", "1 hour")
  const timeMatch = input.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
  if (timeMatch) {
    const value = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith('hour')) {
      result.estimateMinutes = value * 60;
    } else {
      result.estimateMinutes = value;
    }
  }

  // Extract labels (e.g., #work, #personal)
  const labelMatches = input.match(/#(\w+)/g);
  if (labelMatches) {
    result.labels = labelMatches.map(match => match.substring(1));
  }

  return result;
}

export function generateSmartSuggestions(parsedData: ParsedTaskData, existingTasks: ParsedTaskData[]): string[] {
  const suggestions: string[] = [];

  // Suggest based on time of day
  const now = new Date();
  const hour = now.getHours();
  if (parsedData.time) {
    // If time is specified, suggest alternatives
    const suggestedTimes = ['09:00', '14:00', '16:00', '18:00'];
    suggestedTimes.forEach(time => {
      if (time !== parsedData.time) {
        suggestions.push(`Schedule at ${time} instead`);
      }
    });
  } else {
    // Suggest common times based on current time
    if (hour < 12) {
      suggestions.push('Schedule for this afternoon at 2 PM');
    } else if (hour < 17) {
      suggestions.push('Schedule for tomorrow morning at 9 AM');
    } else {
      suggestions.push('Schedule for tomorrow at 10 AM');
    }
  }

  // Suggest based on patterns (simple: if many tasks at certain time)
  const timeCounts: { [key: string]: number } = {};
  existingTasks.forEach(task => {
    if (task.date) {
      const taskTime = new Date(task.date).toTimeString().substring(0, 5);
      timeCounts[taskTime] = (timeCounts[taskTime] || 0) + 1;
    }
  });
  const popularTime = Object.keys(timeCounts).reduce((a, b) => timeCounts[a] > timeCounts[b] ? a : b, '');
  if (popularTime && popularTime !== parsedData.time) {
    suggestions.push(`Based on your patterns, try ${popularTime}`);
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}