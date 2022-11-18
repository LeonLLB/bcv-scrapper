import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('')
  getTasaActual(){
    return this.appService.getCurrentTasa()
  }

  @Get(':fecha')
  getTasaVieja(
    @Param('fecha') fecha:string
  ){ return this.appService.getOldTasa(fecha)}
}
