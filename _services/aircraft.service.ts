import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Aircraft, AircraftUploadResult} from '@/_models';
import {HttpClient} from '@angular/common/http';
import * as _ from "lodash";
import * as moment from "moment";
import {FilterQuery} from "@/components/shared/unified-filter-menu/filter-option";
import {AircraftBulkUpdateDto} from "@/_models/AircraftBulkUpdateDto";

const bulkAddUrl = 'api/aircrafts/bulk-add';
const collectionUrl = 'api/aircrafts';
const itemUrl = (id: string) => `api/aircrafts/${id}`;

@Injectable({providedIn: 'root'})
export class AircraftService {

  constructor(
    private httpClient: HttpClient) {
  }

  getAircraft(id: string): Observable<Aircraft> {
    return this.httpClient.get<Aircraft>(itemUrl(id));
  }

  listAircraft(filters?: FilterQuery): Observable<Array<Aircraft>> {
    const query = {
      sort: 'dateAdded:desc'
    };
    if (filters) {
      Object.assign(query, filters)
    }
    return this.httpClient.get<Aircraft[]>(collectionUrl, {params: query});
  }

  addAircraft(aircraft: Aircraft, onboarding: boolean = false): Observable<Aircraft> {
    aircraft["onboarding"] = onboarding;
    return this.httpClient.post<Aircraft>(collectionUrl, aircraft);
  }

  bulkAddAircraft(file: File, onboarding: boolean = false): Observable<AircraftUploadResult> {
    const formData = new FormData();
    formData.append('aircraft', file, file.name);
    formData.append('onboarding', `${onboarding}`);
    return this.httpClient.post<AircraftUploadResult>(bulkAddUrl, formData);
  }

  updateAircraft(aircraft: Aircraft): Observable<Aircraft> {
    return this.httpClient.put<Aircraft>(itemUrl(aircraft._id), aircraft);
  }

  deleteAircraft(aircraft: Aircraft) {
    return this.httpClient.delete(itemUrl(aircraft._id));
  }

  sortAircraft(aircrafts: Aircraft[]): Aircraft[] {
    return _.chain(aircrafts)
      .map(aircraft => {
        if (!aircraft.dateAdded) {
          aircraft.dateAdded = moment(0);
        }
        return aircraft;
      })
      .sortBy('dateAdded')
      .reverse()
      .value();
  }

  bulkUpdate(update: AircraftBulkUpdateDto) {
    return this.httpClient.put(collectionUrl, update);
  }
}
