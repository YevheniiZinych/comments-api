import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { type Server, WebSocket } from 'ws';

@WebSocketGateway({ path: '/ws' })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  commentCreated(comment: unknown) {
    const payload = JSON.stringify({
      event: 'comment.created',
      data: comment,
    });

    for (const client of this.server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}