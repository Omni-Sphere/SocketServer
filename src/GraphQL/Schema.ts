import { buildSchema } from 'graphql';
import { CalendarEventController } from '../Controllers/CalendarEventController';
import { ConsultantController } from '../Controllers/ConsultantController';
import { EventTypeController } from '../Controllers/EventTypeController';
import { CalendarEvent } from '../Types/CalendarEvent';
import SocketServer from '../Utilities/SocketServer';

export const schema = buildSchema(`
  type Consultant {
    ConsultantEntry: Int!
    ConsultantName: String
  }

  type EventType {
    Code: String!
    Name: String!
  }

  type CalendarEvent {
    EventEntry: Int
    EventStartDate: String!
    EventEndDate: String!
    Consultant: Consultant!
    EventType: EventType!
  }

  input ConsultantInput {
    ConsultantEntry: Int!
    ConsultantName: String
  }

  input EventTypeInput {
    Code: String!
    Name: String
  }

  input CalendarEventInput {
    EventEntry: Int
    EventStartDate: String!
    EventEndDate: String!
    Consultant: ConsultantInput!
    EventType: EventTypeInput!
  }

  type Query {
    getAllEvents: [CalendarEvent]
    getEventTypes: [EventType]
    getConsultants: [Consultant]
  }

  type Mutation {
    createEvent(event: CalendarEventInput!): CalendarEvent
    updateEvent(event: CalendarEventInput!): CalendarEvent
    deleteEvent(event: CalendarEventInput!): CalendarEvent
  }
`);

const controller = new CalendarEventController();
const consultantController = new ConsultantController();
const eventTypeController = new EventTypeController();

export const root = {
  getEventTypes: async () => {
    return await eventTypeController.getAll();
  },
  getConsultants: async () => {
    return await consultantController.getAll();
  },
  getAllEvents: async () => {
    return await controller.getAll();
  },
  createEvent: async (args: { event: CalendarEvent }, context: { socketServer: SocketServer }) => {
    const { event } = args;
    await controller.create(event);
    const allEvents = await controller.getAll();
    if (context.socketServer) {
      context.socketServer.broadcastSync(allEvents);
    }
    return event;
  },
  updateEvent: async (args: { event: CalendarEvent }, context: { socketServer: SocketServer }) => {
    const { event } = args;
    await controller.update(event);
    const allEvents = await controller.getAll();
    if (context.socketServer) {
      context.socketServer.broadcastSync(allEvents);
    }
    return event;
  },
  deleteEvent: async (args: { event: CalendarEvent }, context: { socketServer: SocketServer }) => {
    const { event } = args;
    await controller.delete(event);
    const allEvents = await controller.getAll();
    if (context.socketServer) {
      context.socketServer.broadcastSync(allEvents);
    }
    return event;
  }
};
