import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { createInterpolatorWithFallback, InterpolationMethod } from "commons-math-interpolation";
import { ChangeDetectorRef } from '@angular/core';
import { ShotInterface } from '../spline-editor/shot.interface';

@Component({
  selector: 'app-spline-chart',
  templateUrl: './spline-chart.component.html',
  styleUrls: ['./spline-chart.component.scss']
})
export class SplineChartComponent implements OnInit, OnChanges, AfterViewChecked {
  private _data: ShotInterface[] = [];
  @Input() public chosenIMethod: InterpolationMethod = "akima";
  @Input() public yAxisLabel: string = '';
  @Input() public xAxisLabel: string = '';

  dataChange = new EventEmitter<ShotInterface[]>();

  @Output()
  public onDrag = new EventEmitter<ShotInterface[]>();
  topInterpolator: any;
  bottomInterpolator: any;

  get data() {
    return this._data;
  }

  @Input('data')
  set data(v) {
    this._data = v;
    this.dataChange.emit(this._data);
    this.cd.detectChanges();
    this.cd.markForCheck();
  }

  private width = 700;
  private height = 700;
  private margin = 50;

  private isInitialized = false;

  public svg!: any;
  public svgInner!: any;
  public yScale!: any;
  public xScale!: any;
  public xAxis!: any;
  public yAxis!: any;
  public topSpeedLine!: any;
  public bottomSpeedLine!: any;
  public toolTipDiv: any;
  group: any;

  constructor(public chartElem: ElementRef, public cd: ChangeDetectorRef) {
    this.onDrag.subscribe((d) => {
      this.data = d;
      this.drawChart();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    window.dispatchEvent(new Event('resize'));
  }

  ngOnInit(): void {
    this.initializeChart();
    this.drawChart();
    window.addEventListener('resize', () => {
      this.isInitialized = false;
      d3.selectAll('svg').remove();
      this.initializeChart();
      this.drawChart();
    });
  }

  private initializeChart(): void {
    if(this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    this.svg = d3
      .select(this.chartElem.nativeElement)
      .select('.spline-chart')
      .append('svg')
      .attr('height', this.height);

    this.toolTipDiv = d3.select('.tooltip');

    this.svgInner = this.svg
      .append('g')
      .style('transform', 'translate(' + this.margin + 'px, ' + this.margin + 'px)');

    this.yScale = d3
      .scaleLinear()
      .domain([d3.max(this.data!, d => d.topSpeed)! + 1, d3.min(this.data!, d => d.topSpeed)! - 1])
      // .domain([140, 0])
      .range([0, this.height - 2 * this.margin]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + this.margin + 'px,  0)');

    this.xScale = d3
      .scaleLinear()
      .domain([d3.min(this.data!, d => d.distance)!, d3.max(this.data!, d => d.distance)! + 1])
      // .domain([0, d3.max(this.data!, d => d.distance)! + 2])
      .range([0, this.width - 2 * this.margin]);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style('transform', 'translate(0, ' + (this.height - 2 * this.margin) + 'px)');

    this.group = this.svgInner
      .append('g')
      .attr('class', 'category');
    
    this.topSpeedLine = this.group
      .append('path')
      .attr('id', 'topSpeedLine')
      .attr('class', 'line topSpeedLine')
      .style('fill', 'none');

    this.topSpeedLine.on("click", (e: MouseEvent, d: any) => {
      const dist = Math.round(10*this.xScale.invert(e.x-this.margin))/10;
      var point = {
        distance: dist,
        topSpeed: Math.round(10*this.topInterpolator(dist))/10,
        bottomSpeed: Math.round(10*this.bottomInterpolator(dist))/10,
      };
      this.data.push(point);
      this.data = this.data.sort((_a, _b) => {
        return _a.distance - _b.distance;
      });
      this.onDrag.emit(this.data);
      this.drawChart();
    });

    this.bottomSpeedLine = this.group
      .append('path')
      .attr('id', 'bottomSpeedLine')
      .attr('class', 'line bottomSpeedLine');

      this.createLegend();
      this.createAxisLabels();
  }

  createAxisLabels() {
    // text label for the x axis
    this.svg.append("text")
        .attr("class", "xAxis-label")
        // .attr("transform", "rotate(-90)")
        .attr("y",0 + this.height - (this.margin/2))
        .attr("x", 0 + this.margin + (this.width/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(`${this.xAxisLabel}`);

    // text label for the y axis
    this.svg.append("text")
        .attr("class", "yAxis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 + this.margin)
        .attr("x",0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(`${this.yAxisLabel}`);    

  }

  appendCircles(line: any) {
    const lineId = line.node().id;
    const isTop = (lineId == 'topSpeedLine');
    this.group.selectAll("." + lineId + "-point")
    .data(this.data)
    .join('path')
    .attr("class", `${lineId}-point point`)
    .attr("transform", (d: any) => { return `translate(${this.xScale(d.distance)},${this.yScale(isTop ? d.topSpeed : d.bottomSpeed)}) ${isTop ? '' : 'rotate(180)'}`; })
    .attr('d', d3.symbol().type(d3.symbolTriangle).size(250))
      .on('mouseover', (e: MouseEvent, d: any) => {
        this.toolTipDiv.transition()
          .duration(200)
          .style('opacity', .9);
        this.toolTipDiv.html(d.distance + ', ' + d.bottomSpeed + ', ' + d.topSpeed)
          .style('left', (this.margin + this.xScale(d.distance)) + 'px')
          .style('top', (this.margin + this.yScale(isTop ? d.topSpeed : d.bottomSpeed) - 50) + 'px')
      })
      .on('mouseout', () => {
        this.toolTipDiv.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on("dblclick", (e: MouseEvent, d: any) => {
        this.data = this.data.filter(v => v!=d);
        self.onDrag.emit(self.data);
        this.drawChart();
      });

      let self = this;
      var dragHandler = d3.drag()
        .on("drag", function(e: DragEvent, d: any) {
          d.distance = Math.round(10*self.xScale.invert(e.x))/10;
          if(isTop) {
            d.topSpeed = Math.round(10*self.yScale.invert(e.y))/10;
          } else {
            d.bottomSpeed = Math.round(10*self.yScale.invert(e.y))/10;
          }
          self.toolTipDiv.transition()
            .style('opacity', .9);
          self.toolTipDiv.html(d.distance + ', ' + (isTop ? d.topSpeed : d.bottomSpeed))
            .style('left', e.x + 'px')
            .style('top', e.y + 'px');
          
          self.drawChart();
          self.onDrag.emit(self.data);
        });
  
      dragHandler(this.svg.selectAll("." + lineId + "-point"));
  }

  createLegend() {
    const triangle = d3.symbol().type(d3.symbolTriangle).size(100);

    const legend = this.svg.append("g").attr("class", "legend").attr("transform", `translate(200, 130)`);

    legend.append("path").attr("class", "topSpeedLine-point point").attr("transform", `translate(0,0)`).attr('d', triangle);
    legend.append("path").attr("class", "bottomSpeedLine-point point").attr("transform", `translate(0,30) rotate(180)`).attr('d', triangle);
    legend.append("text").attr("x", 20).attr("y", 0).text("Top Speed").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 20).attr("y", 30).text("Bottom Speed").style("font-size", "15px").attr("alignment-baseline","middle")    
  }

  ngAfterViewChecked() {
    this.initializeChart();
    this.drawChart();
  }

  public drawChart(): void {
    if(!this.svg) return;
    const _topSpeeds = this.data!.map(d=>d.topSpeed).join(",");
    const _bottomSpeeds = this.data!.map(d=>d.bottomSpeed).join(",");
    const _distances = this.data!.map(d=>d.distance).join(",");


    this.width = this.chartElem.nativeElement.getBoundingClientRect().width;
    this.svg.attr('width', this.width);

    this.xScale.range([this.margin, this.width - 2 * this.margin]);

    const xAxis = d3
      .axisBottom(this.xScale)
      .ticks(10);

    this.xAxis.call(xAxis);

    d3.select('.xAxis-label')
      .attr("y", 0 + this.height - (this.margin/2))
      .attr("x", 0 + this.margin + (this.width/2));



    const yAxis = d3
      .axisLeft(this.yScale);

    this.yAxis.call(yAxis);

    // text label for the y axis
    d3.select('.yAxis-label')
      .attr("y", 0 + this.margin)
      .attr("x", 0 - (this.height / 2));


    const line = d3
      .line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveMonotoneX);

    // Generate points
    var distances = _distances.split(",").map(n => parseFloat(n));
    this.topInterpolator = createInterpolatorWithFallback(this.chosenIMethod, _distances.split(",").map(n => parseFloat(n)), _topSpeeds.split(",").map(n => parseFloat(n)));
    let dataset_interpolation: [number, number][]  = []
    const xDomain = d3.max(distances)!;
    for (let i = 0; i <= 500; i++) {
      let xTemp = xDomain / 500 * i
      let yTemp = this.topInterpolator(xTemp);
      dataset_interpolation.push([this.xScale(xTemp), this.yScale(yTemp)])
    }

    this.topSpeedLine.attr('d', line(dataset_interpolation));
    this.appendCircles(this.topSpeedLine);

    // Generate points
    this.bottomInterpolator = createInterpolatorWithFallback(this.chosenIMethod, _distances.split(",").map(n => parseFloat(n)), _bottomSpeeds.split(",").map(n => parseFloat(n)));
    let dataset_bottom_interpolation: [number, number][]  = []
    for (let i = 0; i <= 500; i++) {
      let xTemp = xDomain / 500 * i
      let yTemp = this.bottomInterpolator(xTemp);
      dataset_bottom_interpolation.push([this.xScale(xTemp), this.yScale(yTemp)])
    }

    this.bottomSpeedLine.attr('d', line(dataset_bottom_interpolation));
    this.appendCircles(this.bottomSpeedLine);
  }

}