import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {FratAssessmentDto} from '@/_models';
import {PreflightError} from '@/_models';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map} from "rxjs/operators";
import {ReportExportResultDto} from "@/_models/stats-export-response";

export const listFratsUrl = `api/frats`;
export const fratUrl = (id) => `${listFratsUrl}/${id}`

@Injectable()
export class FratService {
  public static PATH = `api/frats`;
  private frats: BehaviorSubject<Array<FratAssessmentDto>>;

  constructor(private httpClient: HttpClient) {
    this.frats = new BehaviorSubject([]);
  }

  getFrat(fratId: string): Observable<FratAssessmentDto> {
    return this.httpClient.get<any>(`${FratService.PATH}/${fratId}`).pipe(
      map(parseFrat)
    );
  }

  saveFrat(frat: FratAssessmentDto) {
    return frat._id ? this.updateFrat(frat) : this.createFrat(frat);
  }

  deleteFrat(fratId: string): Observable<Response | PreflightError> {
    return this.httpClient.delete<Response | PreflightError>(`${FratService.PATH}/${fratId}`);
  }

  private createFrat(frat: FratAssessmentDto): Observable<FratAssessmentDto> {
    return this.httpClient.post<FratAssessmentDto>(`${FratService.PATH}`, JSON.stringify(frat)).pipe(
      map(parseFrat)
    );
  }

  private updateFrat(frat: FratAssessmentDto): Observable<FratAssessmentDto> {
    return this.httpClient.put<FratAssessmentDto>(`${FratService.PATH}/${frat._id}`, JSON.stringify(frat)).pipe(
      map(parseFrat)
    );
  }

  export(fratId: string, extended: boolean = false): Observable<ReportExportResultDto> {
    return this.httpClient.get(fratUrl(fratId), {
      params: {
        format: 'pdf',
        extended: '' + extended
      },
      responseType: "blob",
      observe: "response",
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        const dispositionHeader = response.headers.get('content-disposition');
        //@ts-ignore
        const filename = dispositionHeader.match(/filename="(?<filename>[\w\d\.\-\_]+)"/).groups.filename
        return {
          filename: filename,
          data: response.body
        }
      })
    )
  }
}

function parseFrat(body: any): FratAssessmentDto {
  try {
    const scoreInt = parseInt(body.score, 10);
    Object.assign(body, {score: scoreInt});
  } catch (err) {
    console.error('Failed to parse FRAT score');
  }
  return body as FratAssessmentDto;
}
