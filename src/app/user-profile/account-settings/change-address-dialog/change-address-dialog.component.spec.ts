import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAddressDialogComponent } from './change-address-dialog.component';

describe('ChangeAddressDialogComponent', () => {
  let component: ChangeAddressDialogComponent;
  let fixture: ComponentFixture<ChangeAddressDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeAddressDialogComponent]
    });
    fixture = TestBed.createComponent(ChangeAddressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
