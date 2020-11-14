import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointListComponent } from './point-list.component';

describe('PointListComponent', () => {
  let component: PointListComponent;
  let fixture: ComponentFixture<PointListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
