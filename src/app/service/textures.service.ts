import { Injectable } from '@angular/core';
import { CanvasTexture, Texture } from 'three';

@Injectable({
  providedIn: 'root'
})
export class TexturesService {
  buildingTexCanvas: HTMLCanvasElement;
  decoratorTexCanvas: HTMLCanvasElement;
  // 从底向上渐变
  bottomLightTexCanvas: HTMLCanvasElement;
  // 横条
  horiLineTexCanvas: HTMLCanvasElement;
  insideBuildingCanvas: HTMLCanvasElement;
  roadLightCanvas: HTMLCanvasElement;

  bottomLightTex: CanvasTexture;
  horiLineTex: CanvasTexture;
  insideBuildingTex: CanvasTexture;
  roadLightTex: CanvasTexture;
  constructor(
  ) {

    this.bottomLightTexCanvas = this.genCanvas(1, 512);
    this.bottomLightTex = new CanvasTexture(this.bottomLightTexCanvas);

    this.buildingTexCanvas = this.genCanvas(1, 512);

    this.decoratorTexCanvas = this.genCanvas(1, 512);

    this.horiLineTexCanvas = this.genCanvas(1, 512);
    this.horiLineTex = new CanvasTexture(this.horiLineTexCanvas);

    this.insideBuildingCanvas = this.genCanvas(1, 512);
    this.insideBuildingTex = new CanvasTexture(this.insideBuildingCanvas);

    this.roadLightCanvas = this.genCanvas(1, 512);
    this.roadLightTex = new CanvasTexture(this.roadLightCanvas);
  }

  drawBuildingTopLight(canvas: HTMLCanvasElement, range: number, startColor: string, endColor: string) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 0, range * height);
    grd.addColorStop(0, startColor);
    grd.addColorStop(1, endColor);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  }

  drawHoriLinesTex(canvas: HTMLCanvasElement, lineColor: string) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');

    const strokeWidth = 10;
    ctx.fillStyle = lineColor;
    let start = 0.25 * height;
    ctx.fillRect(0, start, width, strokeWidth);

    start = 0.3 * height;
    ctx.fillRect(0, start, width, strokeWidth);

    start = 0.5 * height;
    ctx.fillRect(0, start, width, strokeWidth);

    start = 0.9 * height;
    ctx.fillRect(0, start, width, strokeWidth);
  }

  drawHoriGaussianLine(canvas: HTMLCanvasElement, range: number, startColor: string, endColor: string) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'black';
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);
    const grd = ctx.createLinearGradient(0, 0, 1, range * height);
    grd.addColorStop(0, endColor);
    grd.addColorStop(.5, startColor);
    grd.addColorStop(1, endColor);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  }

  private genCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
