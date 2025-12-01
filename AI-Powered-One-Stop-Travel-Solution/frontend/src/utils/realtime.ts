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

// type EventHandler<T> = (data: T) => void;

// export function connectWebSocket<T>(
//   path: string,
//   onMessage: EventHandler<T>,
//   onError?: (error: Event) => void
// ) {
//   // FIX: Use the current host (localhost:5173 -> proxy -> localhost:3000)
//   // or explicitly point to Gateway port 3000 if not using proxy for WS
//   const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//   const host = 'localhost:3000'; // Point to Gateway directly or use window.location.host for proxy
//   const url = `${protocol}//${host}${path}`;

//   console.log(`Connecting WS to: ${url}`);
//   const ws = new WebSocket(url);

//   ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       onMessage(data);
//     } catch (error) {
//       console.error('Failed to parse WS event', error);
//     }
//   };

//   if (onError) {
//     ws.onerror = onError;
//   }

//   return () => ws.close();
// }

// export function connectSSE<T>(
//   path: string,
//   onMessage: EventHandler<T>,
//   onError?: (error: Event) => void
// ) {
//   // Ensure path goes through /api if that's where your services live
//   const source = new EventSource(path);

//   source.onmessage = (event) => {
//     try {
//       onMessage(JSON.parse(event.data));
//     } catch (error) {
//       console.error('Failed to parse SSE event', error);
//     }
//   };

//   if (onError) {
//     source.onerror = onError;
//   }

//   return () => source.close();
// }