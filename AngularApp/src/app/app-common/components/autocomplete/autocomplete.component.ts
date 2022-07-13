import { Component, ViewChild, EventEmitter, Output, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { } from 'googlemaps';
import { addressStructure } from '../../data/addressStructure';
import { Address } from '../../models/Address';
import { AppconstantsService } from '../../services/appconstants.service';

@Component({
  selector: 'app-autocomplete',
  template: `
  <input #addressText type="text" class="address-search-input" opened bps-input style="font-family: UniversForSchueco-430Reg; width: 215px;"
  id="new-project-location" placeholder="Street address or zip code" [(ngModel)]="autocompleteInput">
  `,
  styleUrls: ['./autocomplete.component.css']
})



export class AutocompleteComponent implements OnInit, AfterViewInit {
  _address!: Address;
  @Output() addressAutocomplete: EventEmitter<any> = new EventEmitter();
  @ViewChild('addressText') addressText: any;
  autocompleteInput: string = '';
  constructor(private appconstantsService: AppconstantsService) {
  }

  ngOnInit() {
  }
  /**
   * Set the auto-completion of the google map API
   */
  ngAfterViewInit() {
    const self = this;
    const googleUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + this.appconstantsService.GOOGLE_API_KEY;
    if (!document.querySelectorAll(`[src="${googleUrl}"]`).length) {
      document.body.appendChild(Object.assign(
        document.createElement('script'), {
        type: 'text/javascript',
        src: googleUrl,
        onload: () => self.getPlaceAutocomplete()
      }));
    } else {
      self.getPlaceAutocomplete();
    }
    const addressSearch = document.getElementsByClassName('address-search-input');

    if (addressSearch.length > 0) {
      (addressSearch[0] as HTMLElement).focus();
    }
  }

  private getPlaceAutocomplete(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.addressText.nativeElement,
      {
        types: ['geocode', 'establishment']
      });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this._address = <Address>{};
      for (let i = 0; i < place.address_components!.length; i++) {
        const addressType = place.address_components![i].types[0];
        if ((addressStructure as any)[addressType]) {
          const val = (place.address_components![i] as any)[(addressStructure as any)[addressType]];
          if (val !== undefined) {
            if (addressType === 'sublocality_level_1') { this._address.Line2 = val; }
            // tslint:disable-next-line: one-line
            else if (addressType === 'country') { this._address.Country = val; }
            // tslint:disable-next-line: one-line
            else if (addressType === 'locality') { this._address.City = val; }
            // tslint:disable-next-line: one-line
            else if (addressType === 'administrative_area_level_1') { this._address.State = val; }
            // tslint:disable-next-line: one-line
            else if (addressType === 'administrative_area_level_2') { this._address.County = val; }
            // tslint:disable-next-line: one-line
            else if (addressType === 'postal_code') { this._address.PostalCode = val; }
          }
        }
      }
      // Line1 was missing
      this._address.Lat = place.geometry.location.lat();
      this._address.Lng = place.geometry.location.lng();
      this._address.Line1 = place.name;
      this.invokeEvent(this._address);
      //this.autocompleteInput = '';
    });
  }

  invokeEvent(value: any): void {
    this.addressAutocomplete.emit(value);
  }
}
