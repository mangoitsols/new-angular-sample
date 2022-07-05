import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Route, RouterModule} from "@angular/router";
import {EditAssessmentComponent} from "@/components/assessment/edit-assessment/edit-assessment.component";
import {EditQuestionComponent} from "@/components/assessment/edit-question/edit-question.component";
import {SharedComponentsModule} from "@/components/shared/shared-components.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CreateAssessmentComponent} from './create-assessment/create-assessment.component';
import {ManageAssessmentComponent} from './manage-assessment/manage-assessment.component';
import {NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {AssessmentAccessComponent} from './assessment-access/assessment-access.component';
import {CopyAssessmentModalComponent} from './copy-assessment-modal/copy-assessment-modal.component';
import {DefaultAssessmentRedirectGuard} from "@/_guards/default-assessment-redirect.guard";
import {PreferencesSharedModule} from "@/components/preferences/preferences-shared/preferences-shared.module";
import {PreferenceContextResolver} from "@/resolver/PreferenceContextResolver";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {DragDropModule} from "@angular/cdk/drag-drop";


const ROUTES: Route[] = [
  {
    path: 'new',
    component: CreateAssessmentComponent,
  },
  {
    path: 'default',
    pathMatch: 'full',
    children: [],
    canActivate: [DefaultAssessmentRedirectGuard]
  },
  {
    path: ':assessmentId',
    component: ManageAssessmentComponent,
  },
  {
    path: ':assessmentId/edit',
    component: EditAssessmentComponent,
    children: [
      {
        path: 'section/:sectionId/question/:questionId',
        component: EditQuestionComponent
      },
    ]
  },
  {
    path: ':assessmentId/access',
    component: AssessmentAccessComponent,
    resolve: {context: PreferenceContextResolver}

  },
  {
    path: ':assessmentId/preferences',
    loadChildren: () => import('../preferences/preferences.module').then(m => m.PreferencesModule),
  },
];

@NgModule({
  declarations: [
    EditAssessmentComponent,
    EditQuestionComponent,
    CreateAssessmentComponent,
    ManageAssessmentComponent,
    AssessmentAccessComponent,
    CopyAssessmentModalComponent,
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
        FormsModule,
        ReactiveFormsModule,
        SharedComponentsModule,
        NgbTooltipModule,
        PreferencesSharedModule,
        MatSlideToggleModule,
        DragDropModule,
    ],
  entryComponents: [
    CopyAssessmentModalComponent
  ]
})
export class AssessmentModule {
}
