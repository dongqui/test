type EventType = string | number | symbol;
type Handler<T = any> = (args: T) => void;

interface EventManager<E = EventType> {
  on<T = any>(event: E, handler: Handler<T>): void;
  off<T = any>(event: E, handler?: Handler<T>): void;
  emit<T = any>(event: E, args?: T): void;
}

function createEventManager<E = EventType>(): EventManager<E> {
  const eventList = new Map<E, Set<Handler>>();

  return {
    on<T = any>(event: E, handler: Handler<T>) {
      eventList.has(event) ? eventList.get(event)?.add(handler) : eventList.set(event, new Set([handler]));
    },
    off<T = any>(event: E, handler?: Handler<T>) {
      handler ? eventList.get(event)!.delete(handler) : eventList.delete(event);
    },
    emit<T = any>(event: E, args: T) {
      eventList.has(event) &&
        eventList.get(event)!.forEach((handler: Handler<T>) => {
          handler(args);
        });
    },
  };
}

const eventManager = createEventManager();

export default eventManager;
