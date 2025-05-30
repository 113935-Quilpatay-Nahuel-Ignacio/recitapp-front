import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PromptModalData {
  title: string;
  message: string;
  placeholder: string;
  defaultValue: string;
  inputType: 'text' | 'textarea';
  confirmText: string;
  cancelText: string;
  required: boolean;
}

export interface PromptModalResult {
  confirmed: boolean;
  value?: string;
}

@Component({
  selector: 'app-prompt-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './prompt-modal.component.html',
  styleUrls: ['./prompt-modal.component.scss']
})
export class PromptModalComponent implements OnInit {
  promptForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PromptModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptModalData
  ) {
    this.promptForm = new FormGroup({
      inputValue: new FormControl(
        this.data.defaultValue || '', 
        this.data.required ? [Validators.required] : []
      )
    });
  }

  ngOnInit(): void {
    // Focus the input after view init
    setTimeout(() => {
      const inputElement = document.querySelector('.prompt-modal input, .prompt-modal textarea') as HTMLElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }

  onConfirm(): void {
    if (this.promptForm.valid) {
      const result: PromptModalResult = {
        confirmed: true,
        value: this.promptForm.get('inputValue')?.value || ''
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    const result: PromptModalResult = {
      confirmed: false
    };
    this.dialogRef.close(result);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && this.data.inputType !== 'textarea') {
      event.preventDefault();
      this.onConfirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }

  get inputValue() {
    return this.promptForm.get('inputValue');
  }

  get isValid(): boolean {
    return this.promptForm.valid;
  }
} 