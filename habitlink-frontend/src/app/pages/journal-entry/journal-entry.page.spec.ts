import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalEntryPage } from './journal-entry.page';

describe('JournalEntryPage', () => {
  let component: JournalEntryPage;
  let fixture: ComponentFixture<JournalEntryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
