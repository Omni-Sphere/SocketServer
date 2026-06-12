export type Consultant = {
    ConsultantEntry: number;
    ConsultantName?: string;
  };
  
  export type EventType = {
    Code: string;
    Name: string;
  };

  export type CalendarEvent = {
    EventEntry?: number;
    EventStartDate: string;
    EventEndDate: string;
    Consultant: Consultant;
    EventType: EventType;
  };