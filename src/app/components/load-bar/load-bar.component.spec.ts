import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadBarComponent } from './load-bar.component';

describe('LoadBarComponent', () => {
  let component: LoadBarComponent;
  let fixture: ComponentFixture<LoadBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
