import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './components/spinner-component/spinner-component.component';
import { ImageComparatorService } from './services/image-comparator.service';
import { DatatableComponent } from './components/datatable-component/datatable-component.component';
import { HeaderComponent } from './components/header-component/header-component.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    DatatableComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private imageComparatorSerivice = inject(ImageComparatorService);

  loading = signal(false);
  totalImages = signal(0);

  folder1Files: File[] = [];
  folder2Files: File[] = [];
  results: any[] = [];

  onFolderSelect(event: Event, folderNumber: number) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      if (folderNumber === 1) this.folder1Files = Array.from(files);
      if (folderNumber === 2) this.folder2Files = Array.from(files);

      this.totalImages.set(this.folder1Files.length + this.folder2Files.length);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);

    this.imageComparatorSerivice
      .compareImages(this.folder1Files, this.folder2Files)
      .subscribe({
        next: (data) => {
          // Asocia el objeto File original usando originalName
          this.results = data.map((pair: any) => {
            const img1File = this.folder1Files.find(
              (f) => f.name === pair.img1.originalName
            );
            const img2File = this.folder2Files.find(
              (f) => f.name === pair.img2.originalName
            );
            return {
              ...pair,
              img1: { ...pair.img1, file: img1File },
              img2: { ...pair.img2, file: img2File },
            };
          });
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al comparar:', err);
          this.loading.set(false);
        },
      });
  }
}
