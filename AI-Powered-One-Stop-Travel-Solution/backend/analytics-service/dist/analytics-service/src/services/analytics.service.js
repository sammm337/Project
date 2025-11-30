"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../../../shared/utils/logger");
class AnalyticsService {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'analytics-data');
        this.logger = new logger_1.Logger('analytics-service');
        // Ensure data directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    async recordInteraction(payload) {
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
        }
        catch (error) {
            this.logger.error('Error recording interaction', error);
            throw error;
        }
    }
    async getInteractions(date) {
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
exports.AnalyticsService = AnalyticsService;
