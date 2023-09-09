import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'ordinal'})
export class OrdinalPipe implements PipeTransform {
    transform(value: string | number | null): string {
        if (value === null) {
            return '';
        }
        const numberValue = Number(value);
        const j = numberValue % 10,
            k = numberValue % 100;
        if (j == 1 && k != 11) {
            return numberValue + "st";
        }
        if (j == 2 && k != 12) {
            return numberValue + "nd";
        }
        if (j == 3 && k != 13) {
            return numberValue + "rd";
        }
        return numberValue + "th";
    }
}

