export type Consultant = {
    ConsultantEntry: number;
    ConsultantName?: string;
  };
  
  export type CalendarEvent = {
    EventEntry?: number;
    EventStartDate: string;
    EventEndDate: string;
    Consultant: Consultant;
    EventType: 'C' | 'G' | 'D' | 'S' | 'T';
  };
  