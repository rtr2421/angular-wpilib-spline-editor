import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplineEditorComponent } from './spline-editor/spline-editor.component';


const routes: Routes = [
  { path: 'home', component: SplineEditorComponent },
  { path: '**', component: SplineEditorComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
