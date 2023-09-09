import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupPointDialogComponent } from './pickup-point-dialog.component';

describe('PickupPointDialogComponent', () => {
  let component: PickupPointDialogComponent;
  let fixture: ComponentFixture<PickupPointDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PickupPointDialogComponent]
    });
    fixture = TestBed.createComponent(PickupPointDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
