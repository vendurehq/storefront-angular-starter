import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  standalone: false,
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);


  transform(html: string): unknown {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
