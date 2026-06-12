import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusFilter } from '../../models/catalog.models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar card">
      <label>
        สถานะ
        <select [ngModel]="status()" (ngModelChange)="statusChange.emit($event)">
          <option value="all">ทั้งหมด</option>
          <option value="checked">มีแล้ว</option>
          <option value="unchecked">ยังไม่มี</option>
        </select>
      </label>

      <label>
        หมวดหมู่
        <select [ngModel]="category()" (ngModelChange)="categoryChange.emit($event)">
          <option value="">ทั้งหมด</option>
          @for (cat of categories(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
      </label>

      <label class="search-field">
        ค้นหา
        <input
          type="search"
          [ngModel]="search()"
          (ngModelChange)="searchChange.emit($event)"
          placeholder="ชื่อ..."
        />
      </label>
    </div>
  `,
  styleUrl: './filter-bar.component.scss',
})
export class FilterBarComponent {
  readonly categories = input.required<string[]>();
  readonly status = input<StatusFilter>('all');
  readonly category = input('');
  readonly search = input('');

  readonly statusChange = output<StatusFilter>();
  readonly categoryChange = output<string>();
  readonly searchChange = output<string>();
}
