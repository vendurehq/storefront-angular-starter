import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    AddressFragment,
    CountryFragment,
    CreateAddressMutation,
    CreateAddressMutationVariables,
    GetAvailableCountriesQuery
} from '../../../common/generated-types';
import { GET_AVAILABLE_COUNTRIES } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../../core/providers/data/data.service';
import { Dialog } from '../../../core/providers/modal/modal-types';

import { CREATE_ADDRESS } from './address-modal.graphql';

@Component({
    standalone: false,
    selector: 'vsf-address-modal',
    templateUrl: './address-modal.component.html',
    // styleUrls: ['./address-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class AddressModalComponent implements Dialog<AddressFragment>, OnInit {
    private dataService = inject(DataService);

    resolveWith: (result?: any) => void;
    address: AddressFragment;
    title: string;
    availableCountries$: Observable<CountryFragment[]>;

    ngOnInit() {
        this.availableCountries$ = this.dataService.query<GetAvailableCountriesQuery>(GET_AVAILABLE_COUNTRIES).pipe(
            map(data => data.availableCountries),
        );
    }

    save(value: any) {
        this.dataService.mutate<CreateAddressMutation, CreateAddressMutationVariables>(CREATE_ADDRESS, {
            input: value,
        }).subscribe(data => {
            this.resolveWith(data.createCustomerAddress);
        });
    }
}
