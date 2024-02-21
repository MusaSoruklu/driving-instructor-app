import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachComponent } from './teach.component';

describe('TeachComponent', () => {
  let component: TeachComponent;
  let fixture: ComponentFixture<TeachComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeachComponent]
    });
    fixture = TestBed.createComponent(TeachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
