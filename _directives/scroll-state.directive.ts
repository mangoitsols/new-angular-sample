import {Directive, HostListener, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {debounceTime, map, pairwise, sample, sampleTime, shareReplay, startWith, throttleTime} from "rxjs/operators";

@Directive({
  selector: '[appScrollState]'
})
export class ScrollStateDirective {

  private scrollPosition$ = new BehaviorSubject<number>(0);
  @Output() scrollDirectionChange: Observable<LastScrollDirection>;

  constructor() {
    this.scrollDirectionChange = this.scrollPosition$.pipe(
      sampleTime(150),
      pairwise(),
      map(([prev, current]) => {
        return current > prev ? LastScrollDirection.Down : LastScrollDirection.Up
      }),
      startWith(LastScrollDirection.None),
      shareReplay(),
    )
  }

  @HostListener('scroll', ['$event'])
  onScroll($event) {
    //@ts-ignore
    this.scrollPosition$.next(event.srcElement.scrollTop);
  }

  @HostListener('document:scroll', ['$event'])
  onPageScroll($event) {
    //@ts-ignore
    this.scrollPosition$.next(event.srcElement.scrollingElement.scrollTop);
  }

}

export enum LastScrollDirection {
  None,
  Up,
  Down
}
