import { Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('/api/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('rooms')
  async createRoom() {
    const roomId = await this.gameService.createRoom();
    return { roomId };
  }
}
