// import {
//   inject,
//   TestBed
// } from '@angular/core/testing';
// import { Component } from '@angular/core';
// import {
//   BaseRequestOptions,
//   ConnectionBackend,
//   Http
// } from '@angular/http';
// import { MockBackend } from '@angular/http/testing';
//
// // Load the implementations that should be tested
// import { FlightListComponent } from './flight-list.component';
// import { Title } from './title';
//
// describe('FlightList', () => {
//   // provide our implementations or mocks to the dependency injector
//   beforeEach(() => TestBed.configureTestingModule({
//     providers: [
//       BaseRequestOptions,
//       MockBackend,
//       {
//         provide: Http,
//         useFactory: function(backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
//           return new Http(backend, defaultOptions);
//         },
//         deps: [MockBackend, BaseRequestOptions]
//       },
//       Title,
//       FlightListComponent
//     ]
//   }));
//
//   it('should have default data', inject([ FlightListComponent ], (home: FlightListComponent) => {
//     expect(home.localState).toEqual({ value: '' });
//   }));
//
//   it('should have a title', inject([ FlightListComponent ], (home: FlightListComponent) => {
//     expect(!!home.title).toEqual(true);
//   }));
//
//   it('should log ngOnInit', inject([ FlightListComponent ], (home: FlightListComponent) => {
//     spyOn(console, 'log');
//     expect(console.log).not.toHaveBeenCalled();
//
//     home.ngOnInit();
//     expect(console.log).toHaveBeenCalled();
//   }));
//
// });
