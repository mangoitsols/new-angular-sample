import {AfterContentInit, ContentChild, Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {FeatureHighlightService} from "@/_services/feature-highlight.service";
import {FeatureHighlightBadgeComponent} from "@/components/shared/feature-highlight-badge/feature-highlight-badge.component";

@Directive({
  selector: '[appFeatureHighlight]'
})
export class FeatureHighlightDirective implements OnInit, AfterContentInit{

  @Input() feature: { tag: string; version: number };
  @ContentChild(FeatureHighlightBadgeComponent, {static: false}) badge: FeatureHighlightBadgeComponent;


  constructor(private element: ElementRef,
              private highlightService: FeatureHighlightService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.badge.shouldHighlight = this.highlightService.shouldHighlightFeature(this.feature);
  }

  @HostListener('click') onClick() {
    if (this.feature) {
      this.highlightService.markFeatureViewed(this.feature);
      this.badge? this.badge.shouldHighlight = false : null;
    }
  }

}
