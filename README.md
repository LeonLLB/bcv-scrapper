# BCV Scrapper / Extractor BCV

https://bcv-scrapper.onrender.com

## ENG (English / Inglés)

This web service functions as a scrapper that will get the current official exchange from the [Central Bank of Venezuela](https://bcv.org.ve) website and turn it into an REST API that can work in other applications and system without the need of manually scrapping the information all over again. It's develop using Nest.JS, the main source code is located in the *src* folder. Along with the scrapping of the data, it also stores the results on a PostgreSQL database in case of requiring an older exchange from the bank, as an example for statistics

```
DATE FORMAT (YYYY-MM-DD)

Get actual exchange
https://bcv-scrapper.onrender.com

Get exchange from a specific date 
https://bcv-scrapper.onrender.com/<DATE>

Get exchanges from a date range 
https://bcv-scrapper.onrender.com/<FROM_DATE>/<UNTIL_DATE>

```

## SPA (Spanish / Español)

Este servicio web funciona como un raspador o extractor que obtiene la tasa oficial desde el sitio web del [Banco Central de Venezuela](https://bcv.org.ve) y lo convierte en una API REST que puede funcionar con otras aplicaciones y sistemas sin la necesidad de raspar o extraer la información manualmente de nuevo. Esta desarrollada usando Nest.JS, el codigo fuente principal se encuentra en la carpeta *src*. Incluyendo las funciones de extracción y raspado de información, tambien almacena los resultados en una base de datos de PostgreSQL en caso de requerir una tasa antigua del banco, como por ejemplo para estadisticas

```
FORMATO DE LA FECHA (AAAA-MM-DD)

Obtener tasa actual
https://bcv-scrapper.onrender.com

Obtener tasa de una fecha en especifico
https://bcv-scrapper.onrender.com/<FECHA>

Obtener tasas entre un rango de fechas
https://bcv-scrapper.onrender.com/<FECHA_DESDE>/<FECHA_HASTA>

```