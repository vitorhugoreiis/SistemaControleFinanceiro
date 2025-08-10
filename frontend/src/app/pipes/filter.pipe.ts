import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], value: string, property: string): any[] {
    if (!items) return [];
    if (!value) return items;
    
    return items.filter(item => item[property] === value);
  }
}