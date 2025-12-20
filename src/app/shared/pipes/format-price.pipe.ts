import { ChangeDetectorRef, Pipe, PipeTransform, inject } from '@angular/core';
import { map, take } from 'rxjs/operators';

import { GetActiveChannelQuery } from '../../common/generated-types';
import { DataService } from '../../core/providers/data/data.service';

import { GET_ACTIVE_CHANNEL } from './get-active-channel.graphql';

/**
 * Cache the resolved promise so that the activeChannel only needs
 * to be fetched once on the first invocation of the pipe.
 */
let channelDataPromise: Promise<any>;

/**
 * A pipe which formats a price (always given as an integer by Venure) according
 * to the currencyCode of the current Channel.
 */
@Pipe({
    standalone: false,
    name: 'formatPrice',
    pure: false,
})
export class FormatPricePipe implements PipeTransform {
    private changeDetector = inject(ChangeDetectorRef);
    private dataService = inject(DataService);


    private latestValue: any = null;
    private latestReturnedValue: any = null;

    transform(value: number) {
        if (this.latestValue !== value) {
            this.latestValue = value;
            this.formatCurrency(value);
        }
        return this.latestReturnedValue;
    }

    private formatCurrency(value: number) {
        this.getActiveChannel()
            .then(channel => {
                const formatter = Intl.NumberFormat(channel.defaultLanguageCode, {
                    style: 'currency',
                    currency: channel.currencyCode,
                });
                this.latestReturnedValue = formatter.format(value / 100);
                this.changeDetector.markForCheck();
            });
    }

    private getActiveChannel(): Promise<GetActiveChannelQuery['activeChannel']> {
        if (!channelDataPromise) {
            channelDataPromise = this.dataService.query<GetActiveChannelQuery>(GET_ACTIVE_CHANNEL).pipe(
                take(1),
                map(data => data.activeChannel),
            ).toPromise();
        }
        return channelDataPromise;
    }
}
