import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-datatable-component',
  standalone: true,
  templateUrl: './datatable-component.component.html',
  imports: [DecimalPipe, CommonModule],
  styleUrls: ['./datatable-component.component.scss'],
})
export class DatatableComponent implements OnChanges {
  @Input() imageData: any[] = [];
  previewUrls: { [key: string]: string } = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageData'] && this.imageData) {
      this.previewUrls = {};
      for (const pair of this.imageData) {
        if (pair.img1?.file) {
          this.previewUrls[pair.img1.hash + '_1'] = URL.createObjectURL(
            pair.img1.file
          );
        }
        if (pair.img2?.file) {
          this.previewUrls[pair.img2.hash + '_2'] = URL.createObjectURL(
            pair.img2.file
          );
        }
      }
    }
  }

  getFileUrl(hash: string, folder: '1' | '2'): string | undefined {
    return this.previewUrls[hash + '_' + folder];
  }
}
