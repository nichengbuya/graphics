import { CompileTemplateMetadata } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { observable, Observer, of, Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

const ESC_KEY = 27;
@Component({
  selector: 'app-observable',
  templateUrl: './observable.component.html',
  styleUrls: ['./observable.component.scss']
})
export class ObservableComponent implements OnInit {
  public subscription: Subscription;
  constructor() {
  }

  ngOnInit(): void {
    this.multicast();
  }
  // Observe geolocation updates
  observeGelocation() {
    const locations = new Observable((observer) => {
      let watchId: number;
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition((position: Position) => {
          observer.next(position);
        }, (error: PositionError) => {
          observer.error(error);
        });
      } else {
        observer.error('geolocation not available');
      }
      return {
        unsubscribe() {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    });
    const locationsSubscriptoin = locations.subscribe({
      next(position) {
        console.log('currentPosition :', position);
      },
      error(msg) {
        console.log('Error Getting Location ', msg);
      }
    });
    setTimeout(() => {
      locationsSubscriptoin.unsubscribe();
    }, 10000);
  }
  // Create simple observable that emit three values
  simple() {
    const myObservable = of(1, 2, 3);
    const myObserver = {
      next: x => console.log('Observer got a next value:' + x),
      errot: err => console.error('Observer got error:' + err),
      complete: () => console.log('Observer got a complete notification')
    };
    myObservable.subscribe(myObserver);
  }
  // Create observable with constructor
  sequence() {
    const sequenceSubscriber = (observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
      return { unsubscribe() { } };
    };
    const sequence = new Observable(sequenceSubscriber);
    sequence.subscribe({
      next(num) { console.log(num); },
      complete() { console.log('Finished sequence'); }
    });
  }
  custom() {
    const fromEvent = (target, eventName) => {
      return new Observable((observer) => {
        const handler = (e) => observer.next(e);
        target.addEventListener(eventName, handler);
        return () => {
          target.removeEventListener(eventName, handler);
        };
      });
    };
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const subscription = fromEvent(nameInput, 'keydown')
      .subscribe((e: KeyboardEvent) => {
        if (e.keyCode === ESC_KEY) {
          nameInput.value = '';
        }
      });
  }
  delay(){
    const sequenceSubscriber = (observer) => {
      const seq = [1, 2, 3];
      let timeoutId ;
      const doSequence = (arr, idx) => {
        timeoutId = setTimeout(() => {
          observer.next(arr[idx]);
          if (idx === arr.length - 1){
            observer.complete();
          }else{
            doSequence(arr, ++idx);
          }
        }, 1000);
      };
      doSequence(seq, 0);
      return {unsubscribe(){
        clearTimeout(timeoutId);
      }};
    };
    const sequence = new Observable(sequenceSubscriber);
    sequence.subscribe({
      next(num){console.log(num); },
      complete(){console.log('finished sequence'); }
    });
    setTimeout(() => {
      sequence.subscribe({
        next(num){console.log('2nd subscribe:' + num); },
        complete() { console.log('2nd sequence finished'); }
      });
    }, 500);

  }
  multicast(){
    const multicastSequenceSubscriber = () => {
      const seq = [1, 2, 3];
      // Keep track of each observer (one for every active subscription)
      const observers = [];
      // Still a single timeoutId because there will only ever be one
      // set of values being generated, multicasted to each subscriber
      let timeoutId;

      // Return the subscriber function (runs when subscribe()
      // function is invoked)
      return (observer) => {
        observers.push(observer);
        // When this is the first subscription, start the sequence
        if (observers.length === 1) {
          timeoutId = doSequence({
            next(val) {
              // Iterate through observers and notify all subscriptions
              observers.forEach(obs => obs.next(val));
            },
            complete() {
              // Notify all complete callbacks
              observers.slice(0).forEach(obs => obs.complete());
            }
          }, seq, 0);
        }

        return {
          unsubscribe() {
            // Remove from the observers array so it's no longer notified
            observers.splice(observers.indexOf(observer), 1);
            // If there's no more listeners, do cleanup
            if (observers.length === 0) {
              clearTimeout(timeoutId);
            }
          }
        };
      };
    };

    // Run through an array of numbers, emitting one value
    // per second until it gets to the end of the array.
    const doSequence = (observer, arr, idx) => {
      return setTimeout(() => {
        observer.next(arr[idx]);
        if (idx === arr.length - 1) {
          observer.complete();
        } else {
          doSequence(observer, arr, ++idx);
        }
      }, 1000);
    };

    // Create a new Observable that will deliver the above sequence
    const multicastSequence = new Observable(multicastSequenceSubscriber());

    // Subscribe starts the clock, and begins to emit after 1 second
    multicastSequence.subscribe({
      next(num) { console.log('1st subscribe: ' + num); },
      complete() { console.log('1st sequence finished.'); }
    });

    // After 1 1/2 seconds, subscribe again (should "miss" the first value).
    setTimeout(() => {
      multicastSequence.subscribe({
        next(num) { console.log('2nd subscribe: ' + num); },
        complete() { console.log('2nd sequence finished.'); }
      });
    }, 1500);
  }
}
