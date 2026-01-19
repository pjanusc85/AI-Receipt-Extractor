import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { AIMockService } from './ai-mock.service';
import { AIGeminiService } from './ai-gemini.service';
import { AIClaudeService } from './ai-claude.service';

@Module({
  providers: [
    {
      provide: AIService,
      useFactory: (configService: ConfigService) => {
        const aiProvider = configService.get('AI_PROVIDER') || 'mock';

        switch (aiProvider) {
          case 'claude':
            return new AIClaudeService(configService);
          case 'gemini':
            return new AIGeminiService(configService);
          case 'openai':
            return new AIService(configService);
          case 'mock':
          default:
            return new AIMockService();
        }
      },
      inject: [ConfigService],
    },
    AIMockService,
    AIGeminiService,
    AIClaudeService,
  ],
  exports: [AIService],
})
export class AIModule {}
