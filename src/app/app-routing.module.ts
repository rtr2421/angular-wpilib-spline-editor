import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { SplineEditorComponent } from './spline-editor/spline-editor.component';


const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'spline-editor', component: SplineEditorComponent },
  { path: '**', component: SettingsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
