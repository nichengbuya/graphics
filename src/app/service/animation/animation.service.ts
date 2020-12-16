import { Injectable } from '@angular/core';
import { AnimationClip, AnimationMixer, KeyframeTrack } from 'three';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor() { }
  movePTP(robot) {
    const duration = 3;
    const values = [0,Math.PI/2];
    const track = new KeyframeTrack('rotation.y',[duration], values);
    const mix = new AnimationMixer(robot);
    const clip = new AnimationClip('movePTP',duration, [track]);
    const action = mix.clipAction(clip);
    action.play();
  }
}
