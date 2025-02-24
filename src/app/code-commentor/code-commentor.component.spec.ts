import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeCommenterComponent } from './code-commentor.component';

describe('CodeCommentorComponent', () => {
  let component: CodeCommenterComponent;
  let fixture: ComponentFixture<CodeCommenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeCommenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeCommenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
