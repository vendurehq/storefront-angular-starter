import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    standalone: false,
    selector: 'vsf-account-sign-in',
  templateUrl: './account-sign-in.component.html',
  styleUrls: ['./account-sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSignInComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
