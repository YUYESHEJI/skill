import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

export function setupSocketIO(io: Server): void {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-task', (taskId: string) => {
      socket.join(`task:${taskId}`);
      logger.info(`Client ${socket.id} joined task: ${taskId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}

export function emitTaskProgress(io: Server, taskId: string, data: Record<string, unknown>): void {
  io.to(`task:${taskId}`).emit('task-progress', { taskId, ...data });
}

export function emitTaskComplete(io: Server, taskId: string, data: Record<string, unknown>): void {
  io.to(`task:${taskId}`).emit('task-complete', { taskId, ...data });
}

export function emitTaskError(io: Server, taskId: string, error: string): void {
  io.to(`task:${taskId}`).emit('task-error', { taskId, error });
}
