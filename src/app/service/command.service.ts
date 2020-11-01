import { Injectable } from '@angular/core';
import { WorldService } from './world.service';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  constructor(
    private worldService: WorldService
  ) { }
  
}
