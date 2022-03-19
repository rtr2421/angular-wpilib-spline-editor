import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { InterpolationMethod } from 'commons-math-interpolation';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ShooterService } from './shooter.service';

@Component({
  selector: 'app-spline-editor',
  templateUrl: './spline-editor.component.html',
  styleUrls: ['./spline-editor.component.scss']
})
export class SplineEditorComponent implements OnInit, AfterViewInit {
  // @ViewChild('drawer') public drawer!: MatSidenav
  
  public iMethodOptions: InterpolationMethod[] = ["akima", "cubic", "linear", "loess", "nearestNeighbor"];
  public chosenIMethod: InterpolationMethod = "akima";

  get distances(): string { return this.shooterService.arrayMap.distances.join(',') }
  set distances(value) { this.shooterService.arrayMap.distances = value.split(',').map(Number)}

  get topSpeeds(): string { return this.shooterService.arrayMap.topSpeeds.join(',') }
  set topSpeeds(value) { this.shooterService.arrayMap.topSpeeds = value.split(',').map(Number)}
  
  get bottomSpeeds(): string { return this.shooterService.arrayMap.bottomSpeeds.join(',') }
  set bottomSpeeds(value) { this.shooterService.arrayMap.bottomSpeeds = value.split(',').map(Number)}

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(private breakpointObserver: BreakpointObserver, public shooterService: ShooterService, public cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.shooterService.loadArrayMap();
    this.shooterService.loadCollection();
  }

  ngAfterViewInit(): void {
    this.shooterService.loadArrayMap();
    this.shooterService.loadCollection();
  }

  public reCreateData() {
    this.shooterService.storeArrayMap();
    this.shooterService.loadCollection();
    this.shooterService.storeCollection();
  }

  public reset() {
    localStorage.clear();
    this.shooterService.loadArrayMap();
    this.shooterService.loadCollection();
    this.shooterService.storeArrayMap();
  }

  public onChange() {
    // alert('onChange');
  }

  public onDrag(data: any) {
    this.shooterService.collection = data;
    this.shooterService.storeCollection();
  }
}
