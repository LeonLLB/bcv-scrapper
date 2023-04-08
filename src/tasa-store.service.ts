import { Injectable, Logger } from '@nestjs/common';
import Knex from 'knex';
import {Knex as KnexType} from 'knex'
import { Tasa } from './tasa.interface';

@Injectable()
export class TasaStoreService {

    private logger = new Logger('TasaService')

    private db = Knex({
        client: 'pg',
        connection: process.env.DB_URL,
        useNullAsDefault: true
    })

    constructor() {
        this.db.schema.hasTable('tasas')
            .then((exists) => {
                if (exists) return
                this.db.schema.createTable('tasas', this.generateTable).then(() => this.logger.log('tasa table created'))
            })
    }

    private generateTable(table: KnexType.CreateTableBuilder){
        table.increments('id').primary()
        table.string('eur').defaultTo(0.0).notNullable()
        table.string('cny').defaultTo(0.0).notNullable()
        table.string('try').defaultTo(0.0).notNullable()
        table.string('rub').defaultTo(0.0).notNullable()
        table.string('usd').defaultTo(0.0).notNullable()
        table.date('fecha').notNullable().unique()
    }

    async saveResult(tasa: Tasa){
        const result = await this.db('tasas').where({
            fecha:tasa.fecha
        })
        if(result.length === 0){
            //* NO EXISTE EL REGISTRO SEGUN LA FECHA
            return this.db('tasas').insert(tasa)
        }
        return this.db('tasas').where({fecha:tasa.fecha}).update(tasa)
    }

    async getSingleTasa(fecha:string):Promise<Tasa>{
        const result = await this.db<Tasa>('tasas').where({fecha}).select('*')
        return result[0]
    }

    async getRangeTasas(desdeFecha:string,hastaFecha:string):Promise<Tasa[]>{
        const result = await this.db<Tasa>('tasas').whereBetween('fecha',[
            desdeFecha,
            hastaFecha
        ]).select('*')
        return result
    }

}
