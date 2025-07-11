import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImageComparatorService {
  private http = inject(HttpClient);

  compareImages(folder1Files: File[], folder2Files: File[]) {
    const formData = new FormData();
    folder1Files.forEach((file) => formData.append('folder1', file));
    folder2Files.forEach((file) => formData.append('folder2', file));

    return this.http.post<any[]>('https://image-comparator.onrender.com/compare', formData);
  }
}
