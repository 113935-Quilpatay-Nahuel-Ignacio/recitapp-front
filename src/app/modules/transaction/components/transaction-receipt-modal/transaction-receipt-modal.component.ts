import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionReceiptDTO } from '../../models/dto/transaction-receipt.dto';

@Component({
  selector: 'app-transaction-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-receipt-modal.component.html',
  styleUrls: ['./transaction-receipt-modal.component.scss']
})
export class TransactionReceiptModalComponent {
  @Input() receipt: TransactionReceiptDTO | null = null;
  @Output() closeModal = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }
} 