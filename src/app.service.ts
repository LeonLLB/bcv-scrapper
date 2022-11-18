import { Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import puppeter from 'puppeteer';
import { Tasa, Tasas } from './tasa.interface';

@Injectable()
export class AppService {

  redis = new Redis(process.env.REDIS_URL)

  getHello(): string {
    return 'Hello World!';
  }

  async getCurrentTasa(): Promise<Tasas> {
    const browser = await puppeter.launch()
    const page = await browser.newPage()

    await page.goto('https://www.bcv.org.ve/')

    const containerSelector = '.view-tipo-de-cambio-oficial-del-bcv .col-xs-6 > span, .view-tipo-de-cambio-oficial-del-bcv .col-xs-6 > strong , .view-tipo-de-cambio-oficial-del-bcv .date-display-single'

    await page.waitForSelector(containerSelector);

    const tasas = await page.evaluate(resultsSelector => {
      let lastTasa = ''

      const tasas = {
        eur: 0.0,
        cny: 0.0,
        try: 0.0,
        rub: 0.0,
        usd: 0.0,
        fecha: ''
      }

      const arrResult = [...document.querySelectorAll(resultsSelector)].map((data, i) => {

        if (document.querySelectorAll(resultsSelector).length - 1 === i) {
          tasas.fecha = data.getAttribute('content').trim().split('T')[0]
          return tasas
        }
        if (i % 2 === 0) {
          const tasa = data.innerHTML.trim().toLocaleLowerCase()
          lastTasa = tasa
        } else {
          const tasa = parseFloat(data.innerHTML.trim().replace(',', '.'))
          return tasas[lastTasa] = tasa
        }
      })

      return tasas

    }, containerSelector)
    await this.saveDBResult(tasas)
    return tasas
  }

  async saveDBResult(tasas:Tasas){
    this.redis.set(tasas.fecha,JSON.stringify(tasas))

    const fechaActual = new Date(tasas.fecha)
    const fechaVieja = new Date(fechaActual.getFullYear(),fechaActual.getMonth(),fechaActual.getDate()-7)
    const fechaString = `${fechaVieja.getFullYear()}-${fechaVieja.getMonth()+1}-${fechaVieja.getDate()}`
    
    const result = await this.redis.get(fechaString)
    if(result) this.redis.del()

  }

  async getOldTasa(fecha:string): Promise<Tasas>{
    const result = await this.redis.get(fecha)

    if(!result) throw new NotFoundException('No existe esa tasa BCV, por lo general se borran al pasar 7 días')

    return JSON.parse(result)
  }
}
