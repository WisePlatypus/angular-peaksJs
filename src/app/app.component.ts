import { AfterViewInit, Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'peaksJs';

  blob: Blob = undefined;
  
  trackNb: number = 0;

  get nextTrackLink(): string
  {
    this.trackNb++;
    return `${document.URL}assets/${this.trackNb % 3}.mp3`;
  }

  constructor(private httpClient: HttpClient) {}


  ngAfterViewInit(): void 
  {
    // setInterval(()=>this.getNextTrackBlob(), 5000)
    this.getNextTrackBlob()
  }


  getNextTrackBlob()
  {
    return this.httpClient.get(this.nextTrackLink, {responseType: 'blob'}).subscribe(blob =>
    {
      this.blob = blob;
    });
  }

}
