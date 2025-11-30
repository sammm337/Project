type EventHandler<T> = (data: T) => void;

export function connectWebSocket<T>(
  path: string,
  onMessage: EventHandler<T>,
  onError?: (error: Event) => void
) {
  const ws = new WebSocket(path.startsWith('ws') ? path : `ws://localhost:8000${path}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse WS event', error);
    }
  };

  if (onError) {
    ws.onerror = onError;
  }

  return () => ws.close();
}

export function connectSSE<T>(
  path: string,
  onMessage: EventHandler<T>,
  onError?: (error: Event) => void
) {
  const source = new EventSource(path);

  source.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch (error) {
      console.error('Failed to parse SSE event', error);
    }
  };

  if (onError) {
    source.onerror = onError;
  }

  return () => source.close();
}

