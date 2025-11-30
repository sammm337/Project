import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../../../shared/dist/utils/logger';
import { UserInteractionEvent } from '../../../shared/dist/types/events';

export class AnalyticsService {
  private dataDir: string;
  private logger: Logger;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'analytics-data');
    this.logger = new Logger('analytics-service');
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async recordInteraction(payload: UserInteractionEvent['payload']) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        ...payload
      };

      // Write to daily log file
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.dataDir, `interactions-${date}.jsonl`);

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
      
      this.logger.debug(`Recorded interaction: ${payload.action} for ${payload.entityType} ${payload.entityId}`);
    } catch (error) {
      this.logger.error('Error recording interaction', error);
      throw error;
    }
  }

  async getInteractions(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFile = path.join(this.dataDir, `interactions-${targetDate}.jsonl`);

    if (!fs.existsSync(logFile)) {
      return [];
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  }
}

