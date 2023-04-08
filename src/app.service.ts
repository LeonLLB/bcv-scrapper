import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {Axios} from 'axios'
import * as https from 'https'
import * as cheerio from 'cheerio'
import { Tasa } from './tasa.interface';
import { TasaStoreService } from './tasa-store.service';

@Injectable()
export class AppService {

  constructor(public tasaStore: TasaStoreService){}

  agent = new https.Agent({
    rejectUnauthorized:false
  })
  axios = new Axios({baseURL:'https://bcv.org.ve',httpsAgent:this.agent})

  async getCurrentTasa(): Promise<Tasa> {

    const {data} = await this.axios.get('')

    const $ = cheerio.load(data)

    const query = '.view-tipo-de-cambio-oficial-del-bcv .col-xs-6 > span, .view-tipo-de-cambio-oficial-del-bcv .col-xs-6 > strong , .view-tipo-de-cambio-oficial-del-bcv .date-display-single'

    const amountOfResults = $(query).length

    const tasa: Tasa = {
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
        //TODO: VERIFICAR QUE LOS TIEMPOS EN LAS FECHAS SON DISTINTOS
        console.log($(element).attr('content'))
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

    await this.tasaStore.saveResult(tasa)
    return tasa
  }

  private validateDate(fecha:string){
    const date = new Date(fecha)
    if(isNaN(date.getTime())) throw new BadRequestException(`La fecha ${fecha} no es valida`)
  }

  async getOldTasa(fecha:string): Promise<Tasa>{

    //VALIDAR QUE FECHA SEA VALIDA
    this.validateDate(fecha)
    const result = await this.tasaStore.getSingleTasa(fecha)

    if(!result) throw new NotFoundException('No existe esa tasa BCV')

    return result
  }

  async getDateRangeTasas(desdeFecha: string, hastaFecha: string): Promise<Tasa[]>{
    //VALIDAR QUE LAS FECHAS SEAN VALIDAS
    this.validateDate(desdeFecha)
    this.validateDate(hastaFecha)
    
    //VALIDAR QUE EL RANGO DE FECHA SEA VALIDO

    const rangoDeFechas = {
      desde: new Date(desdeFecha),
      hasta: new Date(hastaFecha)
    }

    if(rangoDeFechas.hasta.getTime() < rangoDeFechas.desde.getTime()) throw new BadRequestException(`El rango de fecha no es valido: ${desdeFecha} / ${hastaFecha}`)

    return this.tasaStore.getRangeTasas(desdeFecha,hastaFecha)
  }
}
