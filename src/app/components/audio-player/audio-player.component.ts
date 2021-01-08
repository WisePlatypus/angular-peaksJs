import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as Peaks from 'peaks.js'
import { Subscription } from 'rxjs';
import { SyncEvent, Syncronizer } from 'src/app/util/syncronizer';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnDestroy {

  // our default peaks options are defined here
  readonly peaksOptions = {
    zoomWaveformColor: 'rgba(255, 255, 255, 0.35)',
    overviewWaveformColor: 'rgba(0, 0, 0, 0.35)',
    overviewHighlightColor: 'rgba(255, 255, 255, 1)',
    showPlayheadTime: true,
    axisGridlineColor: 'rgba(255, 255, 255, 1)',
    axisLabelColor: 'rgba(255, 255, 255, 0.7)',
  }



  // syncronizer used to syncronize blob arrival and child construction
  syncronizer: Syncronizer = new Syncronizer(4);

  // child element
  _audioEl: ElementRef < HTMLAudioElement > ;
  _zoomEl: ElementRef < HTMLDivElement > ;
  _overEl: ElementRef < HTMLDivElement > ;

  // audio blob
  _blob: Blob = undefined;

  // blob getter sync subscription
  $blobSubScription: Subscription = undefined;

  // peak instance
  peaks: Peaks.PeaksInstance;
  // peak ready flag
  peaksReady: boolean = false;


  /**
   * blob seter triggered by Input
   */
  @Input()
  set blob(blob: Blob)
  {
    // when blob is defined
    if (blob)
    {
      // affect blob
      this._blob = blob;

      // if first time
      if (!this.$blobSubScription)
      {
        // subscribe to sync event
        this.$blobSubScription = this.syncronizer.onSyncEvent.subscribe((syncEvent: SyncEvent) =>
        {
          // if blob is called or has called declared sync again
          if (syncEvent['blob'] || syncEvent.syncer == 'blob')
          {
            this.initPlayer();
          }
        });
      }

      // declare sync
      this.syncronizer.sync('blob');
    }
  }

  get blob(): Blob
  {
    return this._blob;
  }

  /**
   * Elements set By viewChild and sync on the way 
   */
  @ViewChild('audio')
  set audioEl(audioEl: ElementRef < HTMLAudioElement > )
  {
    this._audioEl = audioEl;
    this.syncronizer.sync('audioEl');
  }

  @ViewChild('zoomView')
  set zoomEl(zoomEl: ElementRef < HTMLDivElement > )
  {
    this._zoomEl = zoomEl;
    this.syncronizer.sync('zoomEl');
  }


  @ViewChild('overView')
  set overEl(overEl: ElementRef < HTMLDivElement > )
  {
    this._overEl = overEl;
    this.syncronizer.sync('overViewEl');
  }



  constructor(private cdRef: ChangeDetectorRef) {}


  ngOnDestroy(): void
  {
    if(this.peaks)
    {
      this.peaks.destroy();
    }
    // unsubscribe on component destroy
    if(this.$blobSubScription)
    {
      this.$blobSubScription.unsubscribe();
    }
  }


  /**
   * Zoom peaks instance
   * @param zoomIn zoom in if true
   */
  zoom(zoomIn: boolean = true)
  {
    if (this.peaksReady)
    {
      if (zoomIn)
      {
        this.peaks.zoom.zoomIn();
      }
      else
      {
        this.peaks.zoom.zoomOut();
      }
    }
  }

  /**
   * initialise peaks waveform and load audio
   */
  initPlayer(): void
  {
    this._audioEl.nativeElement.src = URL.createObjectURL(this.blob);

    if(this.peaks)
    {
      this.peaks.destroy();
    }

    this.peaks = Peaks.init(
    {
      containers:
      {
        zoomview: this._zoomEl.nativeElement,
        overview: this._overEl.nativeElement,
      },
      mediaElement: this._audioEl.nativeElement,
      webAudio:
      {
        audioContext: new AudioContext(),
        multiChannel: false,
      },
      ...this.peaksOptions,
    }, () =>
    {
      this.peaksReady = true;

      // trigger detect change manually or controls won't show
      this.cdRef.detectChanges();
    });

  }

  /**
   * Toogle play/pause
   */
  togglePlay()
  {
    if (this.peaksReady)
    {
      if (this._audioEl.nativeElement.paused)
      {
        this._audioEl.nativeElement.play();
      }
      else
      {
        this._audioEl.nativeElement.pause();
      }
    }
  }

  /**
   * toggleMute
   */
  toggleMute()
  {
    this._audioEl.nativeElement.muted = !this._audioEl.nativeElement.muted;
  }

}
