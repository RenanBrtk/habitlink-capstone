import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllHabitsPage } from './all-habits.page';

describe('AllHabitsPage', () => {
  let component: AllHabitsPage;
  let fixture: ComponentFixture<AllHabitsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllHabitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
