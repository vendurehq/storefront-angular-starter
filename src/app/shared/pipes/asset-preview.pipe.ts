import { Pipe, PipeTransform } from '@angular/core';

import { AssetFragment } from '../../common/generated-types';

@Pipe({
    standalone: false,
    name: 'assetPreview',
})
export class AssetPreviewPipe implements PipeTransform {
    transform(asset?: AssetFragment, ...args: Array<string | number>): string {
        if (!asset) {
            return '';
        }
        if (!asset.preview || typeof asset.preview !== 'string') {
            throw new Error(`Expected an Asset, got ${JSON.stringify(asset)}`);
        }
        const previewUrl = asset.preview.replace(/\\/g, '/');
        const fp = asset.focalPoint ? `&fpx=${asset.focalPoint.x}&fpy=${asset.focalPoint.y}` : '';
        const query = this.getSizeQuery(args);
        return `${previewUrl}?${query}${fp}&format=webp`;
    }

    private getSizeQuery(args?: Array<string | number>): string {
        if (!args) {
            return `preset=thumb`;
        }
        if (args.length === 1) {
            if (typeof args[0] === 'string') {
                return `preset=${args[0]}`;
            } else {
                return `w=${args[0]}`;
            }
        } else {
            return `w=${args[0]}&h=${args[1]}`;
        }
    }
}
