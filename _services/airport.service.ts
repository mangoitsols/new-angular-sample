import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from "rxjs";
import {Airport} from "@/_models/airport";
import {HttpClient} from "@angular/common/http";


const resultLimit = '10';
const airportUrl = '/api/airports';
const airportByIdUrl = '/api/airports';
const flownToAirportsUrl = '/api/airports/flown-to'

@Injectable({
  providedIn: 'root'
})
export class AirportService {


  constructor(private httpClient: HttpClient) { }

  getAirports(): Observable<Airport[]> {
    return this.httpClient.get<Airport[]>(airportUrl);
  }

  getAirportById(id: string): Observable<Airport> {
    if(!id || id === '') return of(null);
    const url = `${airportByIdUrl}/${id}`;
    return this.httpClient.get<Airport>(url);
  }

  findAirportByIcaoCode(icao: string): Observable<Airport> {
    return this.httpClient.get<Airport>(airportUrl, {
      params: {
        icao_code: icao
      }
    })
  }

  searchAirports(search: string): Observable<Airport[]> {
    const query = {params: {search: search, limit: resultLimit}};
    return this.httpClient.get<Airport[]>(airportUrl, query)
  }

  getFlownToAirports(): Observable<Airport[]> {
    return this.httpClient.get<Airport[]>(flownToAirportsUrl);
  }
}
