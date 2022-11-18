import { Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import fetch from 'node-fetch'
import {Axios} from 'axios'
import request from 'request'
import * as https from 'https'
import * as cheerio from 'cheerio'
import { Tasa, Tasas } from './tasa.interface';

@Injectable()
export class AppService {

  redis = new Redis(process.env.REDIS_URL)
  aget = new https.Agent({
    rejectUnauthorized:false
  })
  axios = new Axios({baseURL:'https://bcv.org.ve',httpsAgent:this.aget})

  getHello(): string {
    return 'Hello World!';
  }

  async getCurrentTasa(): Promise<Tasas> {

    // const res = await fetch('http://bcv.org.ve',{

    // })
    // const data = await res.text()
    // console.log(data)

    const {data} = await this.axios.get('')

    const $ = cheerio.load(data)

    const query = '.view-tipo-de-cambio-oficial-del-bcv .col-xs-6 > span, .view-tipo-de-cambio-oficial-del-bcv .col-xs-6 > strong , .view-tipo-de-cambio-oficial-del-bcv .date-display-single'

    const amountOfResults = $(query).length

    const tasa: Tasas = {
      eur: 0.0,
      cny: 0.0,
      try: 0.0,
      rub: 0.0,
      usd: 0.0,
      fecha: ''
    }
    let lastTasa = ''

    $(query)
    .map((i,element)=>{

      if(amountOfResults-1 === i){
        tasa.fecha = $(element).attr('content').split('T')[0]
        return
      }
      if(i%2 === 0){
        lastTasa = $(element).text().trim().toLocaleLowerCase()
      } else {
        tasa[lastTasa] = parseFloat($(element).text().replace(',','.'))
        return
      }

    })

    await this.saveDBResult(tasa)
    return tasa
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
