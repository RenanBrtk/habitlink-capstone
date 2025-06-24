import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalDetailPage } from './journal-detail.page';

describe('JournalDetailPage', () => {
  let component: JournalDetailPage;
  let fixture: ComponentFixture<JournalDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
